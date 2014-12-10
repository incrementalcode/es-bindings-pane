"use strict";
Object.defineProperties(exports, {
  TreeModel: {get: function() {
      return TreeModel;
    }},
  __esModule: {value: true}
});
var TreeModel = function TreeModel(name, location, type) {
  var isExport = arguments[3] !== (void 0) ? arguments[3] : false;
  var meta = arguments[4] !== (void 0) ? arguments[4] : null;
  this.name = name;
  this.location = location;
  this.type = type;
  this.isExport = isExport;
  this.isImport = false;
  this.meta = meta;
  this.children = [];
  this.imports = [];
  this.collapsed = false;
  this.lastClickTime = Date.now();
};
($traceurRuntime.createClass)(TreeModel, {
  addChild: function(child) {
    this.children.push(child);
  },
  addImport: function(_import) {
    this.imports.push(_import);
  },
  render: function() {
    var $__0 = this;
    var root = document.createElement('div');
    var container = document.createElement('div');
    container.className = 'es-container';
    var arrow = document.createElement('div');
    arrow.className = this.getArrowClass();
    arrow.onclick = (function() {
      return $__0.toggleCollapsed(childList, arrow);
    });
    var text = document.createElement('h5');
    text.className = this.getIconClass();
    text.innerHTML = " " + this.name;
    text.onclick = (function() {
      return $__0.handleClick();
    });
    if (this.type == 'FunctionDeclaration' || this.type == 'MethodDefinition') {
      text.innerHTML += ("<i>(" + this.meta + ")</i>");
    }
    var childList = document.createElement('ul');
    childList.className = 'es-ul';
    this.children.map((function(child) {
      return childList.appendChild(child.render());
    }));
    if (this.collapsed)
      childList.style.setProperty('display', 'none');
    container.appendChild(arrow);
    container.appendChild(text);
    if (this.imports.length > 0) {
      this.imports.map((function(_import) {
        return root.appendChild(_import.render());
      }));
      root.appendChild(document.createElement('br'));
    }
    root.appendChild(container);
    root.appendChild(childList);
    return root;
  },
  getIconClass: function() {
    var result = "es-binding";
    switch (this.type) {
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
    else if (this.isImport)
      result += " es-import-text";
    else
      result += " es-default-text";
    return result;
  },
  getArrowClass: function() {
    if (this.children.length > 0) {
      if (this.collapsed)
        return "es-icon icon-chevron-right";
      return "es-icon icon-chevron-down";
    } else {
      return "";
    }
  },
  handleClick: function() {
    var time = Date.now();
    if (time - this.lastClickTime < 300) {
      if (this.type == "ImportModule")
        this.jumpToImport();
    } else {
      this.highlightLocation();
    }
    this.lastClickTime = time;
  },
  toggleCollapsed: function(childList, arrow) {
    this.collapsed = !this.collapsed;
    if (this.collapsed)
      childList.style.setProperty('display', 'none');
    else
      childList.style.removeProperty('display');
    arrow.className = this.collapsed ? arrow.className.replace('icon-chevron-down', 'icon-chevron-right') : arrow.className.replace('icon-chevron-right', 'icon-chevron-down');
  },
  jumpToImport: function() {
    if (this.meta && this.meta != "notFound")
      atom.workspace.open(this.meta, {
        activatePane: true,
        searchAllPanes: true
      });
  },
  highlightLocation: function() {
    if (!this.location)
      return;
    var location = this.location;
    var range = [[location.start.line - 1, location.start.column], [location.end.line - 1, location.end.column]];
    var editor = atom.workspace.getActiveTextEditor();
    editor.setSelectedBufferRange(range);
    editor.scrollToBufferPosition(range[0]);
  }
}, {});
