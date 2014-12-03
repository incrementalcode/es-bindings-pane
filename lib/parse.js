import {TreeModel} from "./tree-model";
import estraverse from 'estraverse';

//Parse out the symbols in the global scope and their type, children.
//We do this by traversing the syntax  tree and recursing.
//Esprima visits nodes in order from root to leaves, so when we find a node
// we wish to  consider, we kill esprima at that point and recurse _parse on the
// node to establish children with no added cost.
export function parse(syntaxTree, callback) {
  console.log(syntaxTree);

  try {
    return callback(null, _parse(syntaxTree));
  } catch(error) {
    return callback(error);
  }
}

function _parse(syntaxTree, name = "root", type = "Program") {
  var result  = new TreeModel(name, type);

  estraverse.traverse(syntaxTree, {
    enter: (node, parent) =>{
      switch(node.type) {
        case "ImportDeclaration":
          for (let specifier of node.specifiers) {
            let name = specifier.name ? specifier.name.name : specifier.id.name;
            result.addChild(_parse(specifier, name, node.type));
          }
          return estraverse.VisitorOption.Skip;

        case "FunctionDeclaration":
          result.addChild(_parse(node.body, node.id.name, node.type));
          return estraverse.VisitorOption.Skip;

        case "ClassDeclaration":
          result.addChild(_parse(node.body, node.id.name, node.type));
          return estraverse.VisitorOption.Skip;

        case "MethodDefinition":
          result.addChild(_parse(node.body, node.key.name, node.type));
          return estraverse.VisitorOption.Skip;
      }
    }
  });

  return result;
}
