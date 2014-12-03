//Model of a  parsed syntax tree representing information we want to display to the
// user, i.e. function, class and method definitions, nested as in the original syntax
// tree.
//Name: name of parsed object
//Location: esprima location of object name in buffer
//Type: type of object (the node type)
//Meta: metadata to display, e.g. function signature.
export class TreeModel {
  constructor(name, location, type, meta) {
    this.name = name;
    this.location = location;
    this.type = type;
    this.meta = meta;
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
        location: this.location,
        type: this.type,
        meta: this.meta,
        children: this.children.map((child) => child.bake())
      }
    };
  }
}
