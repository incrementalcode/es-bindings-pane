import {TreeModel} from "./tree-model";
import estraverse from 'estraverse';
import tools from 'es-parse-tools';
import path from 'path';

//Parse out the symbols in the global scope and their type, children.
//We do this by traversing the syntax  tree and recursing.
//Esprima visits nodes in order from root to leaves, so when we find a node
// we wish to  consider, we kill esprima at that point and recurse _parse on the
// node to establish children with no added cost.
export function parseTreeModel(syntaxTree, rootName, callback) {
  try {
    return callback(null, _parse(syntaxTree, rootName));
  } catch(error) {
    console.warn("Error in _parse() at parse-tree-model.js: " + error.stack);
    return callback(error);
  }
}

function _parse(syntaxTree, name = "root", loc = syntaxTree.loc, type = "Program", meta = null) {
  var result  = new TreeModel(name, loc, type, meta);

  //We handle imports separately as we want to group them by module  rather than by name.
  var imports = [];

  estraverse.traverse(syntaxTree, {
    enter: (node, parent) => {
      var meta, isExport;

      switch(node.type) {
        case "ExportDeclaration":
          if (!node.declaration) {
            for (let specifier of node.specifiers) {
              let name = specifier.name ? specifier.name.name : specifier.id.name;
              let loc = specifier.name ? specifier.name.loc : specifier.id.loc;

              result.addChild(_parse(specifier, name, loc, node.type, true));
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

          result.addChild(_parse(node.body, node.id.name, node.id.loc, node.type, isExport, meta));
          return estraverse.VisitorOption.Skip;

        case "ClassDeclaration":
          isExport = parent.type == "ExportDeclaration";

          result.addChild(_parse(node.body, node.id.name, node.id.loc, node.type, isExport));
          return estraverse.VisitorOption.Skip;

        case "MethodDefinition":
          meta = node.value.params.map((param) => param.name).join(", ");

          result.addChild(_parse(node.value, node.key.name, node.key.loc, node.type, false, meta));
          return estraverse.VisitorOption.Skip;
      }
    }
  });

  //If no imports, return tree straight, else construct new program tree.
  if (imports.length === 0) return result;

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

  //Group the imports.
  let editor = atom.workspace.getActiveTextEditor();
  for (let [source, {uriBase, moduleImports}] of importModuleMap) {
    let moduleModel = new TreeModel(uriBase, null, "ImportModule", null);

    for (let _import of moduleImports) {
      let {specifier, node} = _import;
      let importName = specifier.name ? specifier.name.name : specifier.id.name;
      let importLoc = specifier.name ? specifier.name.loc : specifier.id.loc;
      let importModel = _parse(specifier, importName, importLoc, node.type);

      moduleModel.addChild(importModel);
    }

    tools.resolveModulePath(editor.getPath(), source, (err, res) => {
      if (!err) moduleModel.meta = res;
    });

    moduleModel.collapsed = true;
    importContainerModel.addChild(moduleModel);
  }

  _result.addChild(importContainerModel);
  _result.addChild(result);
  return _result;
}
