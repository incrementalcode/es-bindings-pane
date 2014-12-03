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

function _parse(syntaxTree, name = "root", loc = syntaxTree.loc, type = "Program") {
  var result  = new TreeModel(name, loc, type);

  estraverse.traverse(syntaxTree, {
    enter: (node, parent) =>{
      switch(node.type) {
        case "ImportDeclaration":
          for (let specifier of node.specifiers) {
            let name = specifier.name ? specifier.name.name : specifier.id.name;
            let loc = specifier.name ? specifier.name.loc : specifier.id.loc;
            result.addChild(_parse(specifier, name, loc, node.type));
          }
          return estraverse.VisitorOption.Skip;

        case "FunctionDeclaration":
          result.addChild(_parse(node.body, node.id.name, node.id.loc, node.type));
          return estraverse.VisitorOption.Skip;

        case "ClassDeclaration":
          result.addChild(_parse(node.body, node.id.name, node.id.loc, node.type));
          return estraverse.VisitorOption.Skip;

        case "MethodDefinition":
          result.addChild(_parse(node.value, node.key.name, node.key.loc, node.type));
          return estraverse.VisitorOption.Skip;
      }
    }
  });

  return result;
}
