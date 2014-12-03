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
    return callback(error);
  }
}

function _parse(syntaxTree, name = "root", loc = syntaxTree.loc, type = "Program", meta = null) {
  var result  = new TreeModel(name, loc, type, meta);

  estraverse.traverse(syntaxTree, {
    enter: (node, parent) => {
      var meta;

      switch(node.type) {
        case "ExportDeclaration":
          if (node.declaration) {
            if (node.declaration.type == "VariableDeclaration") {
              let body = node.declaration.declarations[0];
              let name = body.id.name;
              let location = body.id.loc;

              result.addChild(_parse(body, name, location, node.type));
            } else {
              let body = node.declaration;
              let name = body.name ? body.name : body.id.name;
              let location = body.name ? body.loc : body.id.loc;

              result.addChild(_parse(body, name, location, node.type));
            }
          } else {
            for (let specifier of node.specifiers) {
              let name = specifier.name ? specifier.name.name : specifier.id.name;
              let loc = specifier.name ? specifier.name.loc : specifier.id.loc;

              result.addChild(_parse(specifier, name, loc, node.type));
            }
          }
          return estraverse.VisitorOption.Skip;

        case "ImportDeclaration":
          for (let specifier of node.specifiers) {
            let name = specifier.name ? specifier.name.name : specifier.id.name;
            let loc = specifier.name ? specifier.name.loc : specifier.id.loc;

            result.addChild(_parse(specifier, name, loc, node.type));
          }
          return estraverse.VisitorOption.Skip;

        case "FunctionDeclaration":
          meta = node.params.map((param) => param.name).join(", ");

          result.addChild(_parse(node.body, node.id.name, node.id.loc, node.type, meta));
          return estraverse.VisitorOption.Skip;

        case "ClassDeclaration":
          result.addChild(_parse(node.body, node.id.name, node.id.loc, node.type));
          return estraverse.VisitorOption.Skip;

        case "MethodDefinition":
          meta = node.value.params.map((param) => param.name).join(", ");

          result.addChild(_parse(node.value, node.key.name, node.key.loc, node.type, meta));
          return estraverse.VisitorOption.Skip;
      }
    }
  });

  return result;
}
