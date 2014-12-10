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

function _parse(syntaxTree, callback, name="root", loc=syntaxTree.loc, type="Program",  moduleType=false, meta=null) {
  var result  = new TreeModel(name, loc, type, moduleType, meta);

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
              (child) => child.moduleType == 'export'
            );

            //TODO: not sure if all this preprocessing belongs here or in the render?
            //     problem with render is that if we don't do it here we get huge trees
            //     being passed  around, which is a less than ideal solution.

            //We want import children to be collapsed to avoid clutter.
            //Also, we want loc to be null so that clicking them doesn't highlight weird things.
            for (let child of moduleModel.children) {
              if (moduleImports.filter((_import) =>_import.name == child.name).length > 0)
                child.moduleType = 'import';
              else
                child.moduleType = 'unreferencedImport';

              child.modulePath = modulePath;
              child.collapsed  = true;
            }

            moduleModel.collapsed = true;
            moduleModel.moduleType = 'import';
            moduleModel.type = "ImportModule";
            moduleModel.location = null;
            moduleModel.imports = [];
            moduleModel.modulePath = modulePath;
            result.addImport(moduleModel);
          }

          callback();
        });
      });
    }, (error, _) => {
      if (error) return callback(error);

      //And we are done. Asyncmagic.
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
      var meta, moduleType;

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
            imports.push({
              name: specifier.name ? specifier.name.name : specifier.id.name,
              node
            });

          return estraverse.VisitorOption.Skip;

        case "FunctionDeclaration":
          meta = node.params.map((param) => param.name).join(", ");
          moduleType = parent.type == "ExportDeclaration" ? 'export' : '';

          declarations.push([node.body, node.id.name, node.id.loc, node.type, moduleType, meta]);
          return estraverse.VisitorOption.Skip;

        case "ClassDeclaration":
          moduleType = parent.type == "ExportDeclaration" ? 'export' : '';

          declarations.push([node.body, node.id.name, node.id.loc, node.type, moduleType, null]);
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
