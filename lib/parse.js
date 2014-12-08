import {TreeModel} from "./tree-model";
import estraverse from 'estraverse';

//Parse out the symbols in the global scope and their type, children.
//We do this by traversing the syntax  tree and recursing.
//Esprima visits nodes in order from root to leaves, so when we find a node
// we wish to  consider, we kill esprima at that point and recurse _parse on the
// node to establish children with no added cost.
export function parse(syntaxTree, callback) {
  try {
    return callback(null, _parse(syntaxTree));
  } catch(error) {
    console.warn("Error in parse() at parse.js: " + error.stack);
    return callback(error);
  }
}

function _parse(syntaxTree, name = "root", loc = syntaxTree.loc, type = "Program", meta = null) {
  var result  = new TreeModel(name, loc, type, meta);

  //We handle imports separately as we want to group them by module  rather than by name.
  //TODO
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
  var importModel = new TreeModel("Imports", loc, null, null);
  result.name = "Module";

  for (let _import of imports) {
    let {specifier, node} = _import;
    let importName = specifier.name ? specifier.name.name : specifier.id.name;
    let importLoc = specifier.name ? specifier.name.loc : specifier.id.loc;
    importModel.addChild(_parse(specifier, importName, importLoc, node.type));
  }

  _result.addChild(importModel);
  _result.addChild(result);
  return _result;
}
