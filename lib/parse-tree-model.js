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

function _parse(syntaxTree, callback, name="root", loc=syntaxTree.loc, type="Program",  isExport=false, meta=null) {
  var result  = new TreeModel(name, loc, type, isExport, meta);

  //We handle imports separately as we want to group them by module  rather than by name.
  var imports = [];
  _parseSyntaxTree(syntaxTree, result, imports, (error, _) => {
    if (error) return callback(error);

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

    //Group the imports by module name, resolve said module.
    let editor = atom.workspace.getActiveTextEditor();
    async.each(importModuleArray, (obj, callback) => {
      //unpack and create our module model
      let [source, {uriBase, moduleImports}] = obj;
      tools.resolveModulePath(editor.getPath(), source, (error, modulePath) => {
        if (error || modulePath == "notFound") return callback();

        var moduleModel = parseTreeModel(modulePath, (error, moduleModel) => {
          if (!error) {
            moduleModel.children = moduleModel.children.filter(
              (child) => child.isExport
            );

            for (let child of moduleModel.children) {
              child.collapsed  = true;
              child.location = null;
            }

            moduleModel.collapsed = true;
            moduleModel.type = "ImportModule";
            moduleModel.location = null;
            moduleModel.imports = [];
            moduleModel.meta = modulePath;
            result.addImport(moduleModel);
          }

          callback();
        });
      });
    }, (error, _) => {
      if (error) return callback(error);

      //Finished adding import children, push to main container.
      // _result.addChild(importContainerModel);
      // _result.addChild(result);
      return callback(null, result);
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
          return estraverse.VisitorOption.Skip;

        case "ClassDeclaration":
          isExport = parent.type == "ExportDeclaration";

          declarations.push([node.body, node.id.name, node.id.loc, node.type, isExport, null]);
          return estraverse.VisitorOption.Skip;

        case "MethodDefinition":
          meta = node.value.params.map((param) => param.name).join(", ");

          declarations.push([node.value, node.key.name, node.key.loc, node.type, false, meta]);
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