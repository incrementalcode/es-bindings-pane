import {TreeModel} from "./tree-model";
import estraverse from 'estraverse';
import tools from 'es-parse-tools';
import path from 'path';
import async from 'async';

//Parse out the symbols in the global scope and their type, children.
//We do this by traversing the syntax  tree and recursing.
//Esprima visits nodes in order from root to leaves, so when we find a node
// we wish to  consider, we kill esprima at that point and recurse _parse on the
// node to establish children with no added cost.
export function parseTreeModel(uri, callback) {
  tools.parseURI(uri, (error, scopes) => {
    if (error) return callback(error);

    return _parse(scopes[0].block, callback, path.basename(uri));
  });
}

function _parse(syntaxTree, callback, name = "root", loc = syntaxTree.loc, type = "Program", meta = null) {
  var result  = new TreeModel(name, loc, type, meta);

  //We handle imports separately as we want to group them by module  rather than by name.
  var imports = [];
  _parseSyntaxTree(syntaxTree, result, imports, (error, _) => {
    if (error) return callback(error);

    //If no imports, return tree straight, else construct new program tree.
    if (imports.length === 0) return callback(null, result);

    var _result = new TreeModel(name, loc, type, meta);
    var importContainerModel = new TreeModel("Imports", loc, null, null);
    result.name = "Module";

    //Group imports by module, rather than by symbol name..
    var importModuleMap = new Map();
    for (let _import of imports) {
      let source = _import.node.source.value;
      let sourceBaseName = path.basename(source);

      if (!importModuleMap.has(source))
        importModuleMap.set(source, { uriBase: sourceBaseName, moduleImports: [] });

      importModuleMap.get(source).moduleImports.push(_import);
    }

    let importModuleArray = [];
    for (let obj of importModuleMap)
      importModuleArray.push(obj);

    //Group the imports.
    let editor = atom.workspace.getActiveTextEditor();
    async.each(importModuleArray, (obj, callback) => {
      //unpack and create our module model
      let [source, {uriBase, moduleImports}] = obj;
      let moduleModel = new TreeModel(uriBase, null, "ImportModule", null);

      //add each import as a child model
      for (let _import of moduleImports) {
        let {specifier, node} = _import;
        let importName = specifier.name ? specifier.name.name : specifier.id.name;
        let importLoc = specifier.name ? specifier.name.loc : specifier.id.loc;
        let importModel = new TreeModel(importName, importLoc, node.type);

        moduleModel.addChild(importModel);
      }

      //set the module to by default be collapsed, push to parent model
      moduleModel.collapsed = true;
      importContainerModel.addChild(moduleModel);

      //we resolve  the module path before callback success
      tools.resolveModulePath(editor.getPath(), source, (err, res) => {
        if (!err) moduleModel.meta = res;
        callback();
      });
    }, (error, _) => {
      if (error) return callback(error);

      //Finished adding import children, push to main container.
      _result.addChild(importContainerModel);
      _result.addChild(result);
      return callback(null, _result);
    });
  });
}

//Parses syntax tree, calls callback when the traversing is finished.
//Runs the traversing asynchronously, "wrapping" the traverse calls.
function _parseSyntaxTree(syntaxTree, result, imports, callback) {
  var declarations = [];

  estraverse.traverse(syntaxTree, {
    enter: (node, parent) => {
      var meta, isExport;

      switch(node.type) {
        case "ExportDeclaration":
          if (!node.declaration) {
            for (let specifier of node.specifiers) {
              let name = specifier.name ? specifier.name.name : specifier.id.name;
              let loc = specifier.name ? specifier.name.loc : specifier.id.loc;

              declarations.push([specifier, name, loc, node.type, true, null]);
              //result.addChild(_parse(specifier, name, loc, node.type, true));
            }

            return estraverse.VisitorOption.Skip;
          }
          break;

        case "ImportDeclaration":
          for (let specifier of node.specifiers)
            imports.push({specifier, node});

          return estraverse.VisitorOption.Skip;

        case "FunctionDeclaration":
          meta = node.params.map((param) => param.name).join(", ");
          isExport = parent.type == "ExportDeclaration";

          declarations.push([node.body, node.id.name, node.id.loc, node.type, isExport, meta]);
          // result.addChild(_parse(node.body, node.id.name, node.id.loc, node.type, isExport, meta));
          return estraverse.VisitorOption.Skip;

        case "ClassDeclaration":
          isExport = parent.type == "ExportDeclaration";

          declarations.push([node.body, node.id.name, node.id.loc, node.type, isExport, null]);
          // result.addChild(_parse(node.body, node.id.name, node.id.loc, node.type, isExport));
          return estraverse.VisitorOption.Skip;

        case "MethodDefinition":
          meta = node.value.params.map((param) => param.name).join(", ");

          declarations.push([node.value, node.key.name, node.key.loc, node.type, false, meta]);
          // result.addChild(_parse(node.value, node.key.name, node.key.loc, node.type, false, meta));
          return estraverse.VisitorOption.Skip;
      }
    }
  });

  //Traversing is finished, handle asynchronous stuff.
  async.each(declarations, (declaration, callback) => {
    _parse(declaration[0], (error, model) =>{
          if (error) return callback(error);

          result.addChild(model);
          callback();
        }, ...declaration.slice(1));
  }, callback);
}
