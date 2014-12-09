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

    //Children are in-module children
    //Imports are imported modules
    this.children = [];
    this.imports = [];

    this.collapsed = false;
    this.lastClickTime = Date.now();
  }

  addChild(child) {
    this.children.push(child);
  }

  addImport(_import) {
    this.imports.push(_import);
  }

  //Bake bake bake. All the Html.
  render() {
    var root = document.createElement('div');

    var container = document.createElement('div');
    container.className = 'es-container';

    var arrow = document.createElement('div');
    arrow.className = this.getArrowClass();
    arrow.onclick = () => this.toggleCollapsed(childList, arrow);

    var text = document.createElement('h5');
    text.className = this.getIconClass();
    text.innerHTML = " " + this.name;
    text.onclick = () => this.handleClick();

    //Add function parameter meta-data if appropriate.
    if (this.type == 'FunctionDeclaration' || this.type == 'MethodDefinition') {
      text.innerHTML += `<i>(${this.meta})</i>`;
    }

    var childList = document.createElement('ul');
    childList.className = 'es-ul';
    this.children.map((child) => childList.appendChild(child.render()));

    if (this.collapsed)
      childList.style.setProperty('display', 'none');

    container.appendChild(arrow);
    container.appendChild(text);
    if (this.imports.length > 0) {
      this.imports.map((_import) => root.appendChild(_import.render()));
      root.appendChild(document.createElement('br'));
    }
    root.appendChild(container);
    root.appendChild(childList);

    return root;
  }

  //INTERNAL render
  //get different icon depending on tree type
  getIconClass() {
    var result = "es-binding";

    switch(this.type) {
      case "ImportModule":
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
    else if (this.type == "ImportModule")
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

  //Handle click events on text. If click once, highlight import. Else jump to it.
  handleClick() {
    var time = Date.now();

    if (time - this.lastClickTime < 300) {
      if (this.type == "ImportModule")
        this.jumpToImport();
    } else {
      this.highlightLocation();
    }

    this.lastClickTime = time;
  }

  //Collapse tree node, update style.
  toggleCollapsed(childList, arrow) {
    this.collapsed = !this.collapsed;
    if (this.collapsed) childList.style.setProperty('display', 'none');
    else childList.style.removeProperty('display');

    arrow.className = this.collapsed ? arrow.className.replace('icon-chevron-down', 'icon-chevron-right')
                                                               : arrow.className.replace('icon-chevron-right', 'icon-chevron-down');
  }

  //Jump to clicked import
  jumpToImport() {
    if (this.meta && this.meta != "notFound")
      atom.workspace.open(this.meta, {activatePane: true, searchAllPanes: true});
  }

  //Highlight clicked location.
  highlightLocation() {
    if (!this.location) return;

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
