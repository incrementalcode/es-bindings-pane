"use strict";
Object.defineProperties(exports, {
  TreeModel: {get: function() {
      return TreeModel;
    }},
  __esModule: {value: true}
});
var TreeModel = function TreeModel(name, location, type) {
  var moduleType = arguments[3] !== (void 0) ? arguments[3] : '';
  var meta = arguments[4] !== (void 0) ? arguments[4] : null;
  this.name = name;
  this.location = location;
  this.type = type;
  this.moduleType = moduleType;
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
    this.imports.map((function(_import) {
      return root.appendChild(_import.render());
    }));
    root.appendChild(container);
    root.appendChild(childList);
    return root;
  },
  getIconClass: function() {
    var result = "es-binding";
    switch (this.type) {
      case "ImportModule":
        break;
      case "ExportDeclaration":
        break;
      case "FunctionDeclaration":
        result += " icon-list-ordered";
        break;
      case "ClassDeclaration":
        result += " icon-versions";
        break;
      case "MethodDefinition":
        result += " icon-list-ordered";
        break;
    }
    if (this.moduleType == 'export')
      result += " es-export-text";
    else if (this.moduleType == 'import')
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
    if (this.moduleType == "import" || this.moduleType == "unreferencedImport") {
      if (time - this.lastClickTime < 300)
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
    var $__0 = this;
    if (this.modulePath && this.modulePath != "notFound")
      atom.workspace.open(this.modulePath, {
        activatePane: true,
        searchAllPanes: true
      }).then((function(editor) {
        $__0._highlightLocationInEditor(editor, $__0.location);
      }));
  },
  highlightLocation: function() {
    if (!this.location)
      return;
    var editor = atom.workspace.getActiveTextEditor();
    this._highlightLocationInEditor(editor, this.location);
  },
  _highlightLocationInEditor: function(editor, location) {
    var range = [[location.start.line - 1, location.start.column], [location.end.line - 1, location.end.column]];
    editor.setSelectedBufferRange(range);
    editor.scrollToBufferPosition(range[0]);
  }
}, {});
