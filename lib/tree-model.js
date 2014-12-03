//Model of a  parsed syntax tree representing information we want to display to the
// user, i.e. function, class and method definitions, nested as in the original syntax
// tree.
export class TreeModel {
  constructor(name, type) {
    this.name = name;
    this.type = type;
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
        type: this.type,
        children: this.children.map((child) => child.bake())
      }
    };
  }
}