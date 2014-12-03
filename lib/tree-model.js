export class TreeModel {
  constructor(name) {
    this.name = name;
    this.children = [];
  }

  addChild(child) {
    this.children.push(child);
    return this;
  }

  //Bake model to JSON for react.
  bake() {
    return {
      model: {
        name: this.name,
        children: this.children.map((child) => child.bake())
      }
    };
  }
}

//Utility function to create tree model from esprima tree
export function syntaxTreeToModel(syntaxTree) {
  if (!syntaxTree.type) return new TreeModel("Unknown");

  var result  = new TreeModel(syntaxTree.type);
  if (syntaxTree.body) {
    for (let child of syntaxTree.body) {
      result.addChild(syntaxTreeToModel(child));
    }
  }

  return result;
}
