//Model of a  parsed syntax tree representing information we want to display to the
// user, i.e. function, class and method definitions, nested as in the original syntax
// tree.
//Name: name of parsed object
//Location: esprima location of object name in buffer
//Type: type of object (the node type)
//Meta: metadata to display, e.g. function signature.
export class TreeModel {
  constructor(name, location, type, isExport=false, meta=null) {
    this.name = name;
    this.location = location;
    this.type = type;
    this.isExport = isExport;
    this.meta = meta;
    this.children = [];

    this.collapsed = false;
  }

  addChild(child) {
    this.children.push(child);
    return this;
  }

  //Bake bake bake. All the Html.
  render() {
    var root = document.createElement('div');

    var container = document.createElement('div');
    container.className = 'es-container';

    var arrow = document.createElement('div');
    arrow.className = this.getArrowClass();
    arrow.onclick = () => this.toggleCollapsed(childList);

    var text = document.createElement('h5');
    text.className = this.getIconClass();
    text.textContent = " " + this.name;
    text.onclick = () => this.highlightLocation();

    var childList = document.createElement('ul');
    childList.className = 'es-ul';
    this.children.map((child) => childList.appendChild(child.render()));

    if (this.collapsed)
      childList.style.setProperty('display', 'none');

    container.appendChild(arrow);
    container.appendChild(text);
    root.appendChild(container);
    root.appendChild(childList);

    return root;
  }

  //INTERNAL render
  //get different icon depending on tree type
  getIconClass() {
    var result = "es-binding";

    switch(this.type) {
      case "ImportDeclaration":
        result += " icon-cloud-download";
        break;

      case "ExportDeclaration":
        result += " icon-cloud-upload";
        break;

      case "FunctionDeclaration":
        result += " icon-gear";
        break;

      case "ClassDeclaration":
        result += " icon-puzzle";
        break;

      case "MethodDefinition":
        result += " icon-gear";
        break;
    }

    if (this.isExport)
      result += " es-export-text";
    else if (this.type == "ImportDeclaration")
      result += " es-import-text";
    else
      result += " es-default-text";

    return result;
  }

  //INTERNAL render
  getArrowClass() {
    //If we have children, display the toggleable arrow.
    if (this.children.length > 0) {
      //if (this.state.collapsed) return "es-icon icon-chevron-right";
      /*else*/return "es-icon icon-chevron-down";
    } else {
      return "";
    }
  }

  //Collapse tree node, update style.
  toggleCollapsed(childList) {
    this.collapsed = !this.collapsed;
    if (this.collapsed) childList.style.setProperty('display', 'none');
    else childList.style.removeProperty('display');
  }

  highlightLocation() {
    var location = this.location;
    var range = [
      [location.start.line - 1, location.start.column],
      [location.end.line - 1, location.end.column]
    ];

    var editor = atom.workspace.getActiveTextEditor();
    editor.setSelectedBufferRange(range);
    editor.scrollToBufferPosition(range[0]);
  }
}
