"use strict";
Object.defineProperties(exports, {
  TreeModel: {get: function() {
      return TreeModel;
    }},
  __esModule: {value: true}
});
var TreeModel = function TreeModel(name, location, type, meta) {
  this.name = name;
  this.location = location;
  this.type = type;
  this.meta = meta;
  this.children = [];
  this.collapsed = false;
};
($traceurRuntime.createClass)(TreeModel, {
  addChild: function(child) {
    this.children.push(child);
    return this;
  },
  render: function() {
    var $__0 = this;
    var root = document.createElement('div');
    var container = document.createElement('div');
    container.className = 'es-container';
    var arrow = document.createElement('div');
    arrow.className = this.getArrowClass();
    arrow.onclick = (function() {
      return $__0.toggleCollapsed(childList);
    });
    var text = document.createElement('h5');
    text.className = this.getIconClass();
    text.textContent = " " + this.name;
    text.onclick = (function() {
      return $__0.highlightLocation();
    });
    var childList = document.createElement('ul');
    childList.className = 'es-ul';
    this.children.map((function(child) {
      return childList.appendChild(child.render());
    }));
    if (this.collapsed)
      childList.style.setProperty('display', 'none');
    container.appendChild(arrow);
    container.appendChild(text);
    root.appendChild(container);
    root.appendChild(childList);
    return root;
  },
  getIconClass: function() {
    switch (this.type) {
      case "ImportDeclaration":
        return "icon-cloud-download es-binding";
      case "ExportDeclaration":
        return "icon-cloud-upload es-binding";
      case "FunctionDeclaration":
        return "icon-gear es-binding";
      case "ClassDeclaration":
        return "icon-puzzle es-binding";
      case "MethodDefinition":
        return "icon-gear es-binding";
    }
    return "es-binding";
  },
  getArrowClass: function() {
    if (this.children.length > 0) {
      return "es-icon icon-chevron-down";
    } else {
      return "";
    }
  },
  toggleCollapsed: function(childList) {
    this.collapsed = !this.collapsed;
    if (this.collapsed)
      childList.style.setProperty('display', 'none');
    else
      childList.style.removeProperty('display');
  },
  highlightLocation: function() {
    var location = this.location;
    var range = [[location.start.line - 1, location.start.column], [location.end.line - 1, location.end.column]];
    var editor = atom.workspace.getActiveTextEditor();
    editor.setSelectedBufferRange(range);
    editor.scrollToBufferPosition(range[0]);
  }
}, {});
