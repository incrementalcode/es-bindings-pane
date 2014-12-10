"use strict";
Object.defineProperties(exports, {
  activate: {get: function() {
      return activate;
    }},
  __esModule: {value: true}
});
var $__resize_45_handle__,
    $__tree_45_model__,
    $__parse_45_tree_45_model__;
var createResizeHandle = ($__resize_45_handle__ = require("./resize-handle"), $__resize_45_handle__ && $__resize_45_handle__.__esModule && $__resize_45_handle__ || {default: $__resize_45_handle__}).createResizeHandle;
var TreeModel = ($__tree_45_model__ = require("./tree-model"), $__tree_45_model__ && $__tree_45_model__.__esModule && $__tree_45_model__ || {default: $__tree_45_model__}).TreeModel;
var parseTreeModel = ($__parse_45_tree_45_model__ = require("./parse-tree-model"), $__parse_45_tree_45_model__ && $__parse_45_tree_45_model__.__esModule && $__parse_45_tree_45_model__ || {default: $__parse_45_tree_45_model__}).parseTreeModel;
var treePanel,
    treeComponent = null;
function activate(state) {
  atom.workspaceView.command("es-bindings-pane:toggle", togglePanel);
  treePanel = document.createElement('div');
  treePanel.className = 'es-bindings-pane';
  createResizeHandle(treePanel);
  atom.workspace.addRightPanel({item: treePanel});
  atom.workspace.observeTextEditors((function(editor) {
    editor.onDidSave((function(event) {
      displayPanel(editor);
    }));
  }));
  atom.workspace.observeActivePaneItem((function(item) {
    if (!item)
      return;
    displayPanel(item);
  }));
}
function displayPanel(item) {
  if (item.getPath && item.getGrammar && item.getGrammar().name == 'JavaScript') {
    parseTreeModel(item.getPath(), (function(error, treeModel) {
      if (error) {
        console.warn("Warning during parseURI() from main.js: " + error.stack);
        return treePanel.style.setProperty('opacity', '0.5');
      }
      unmountTreePanel();
      treePanel.style.removeProperty('display');
      treePanel.style.removeProperty('opacity');
      treeComponent = treeModel.render();
      treePanel.appendChild(treeComponent);
    }));
  } else {
    return treePanel.style.setProperty('display', 'none');
  }
}
function unmountTreePanel() {
  if (treeComponent) {
    treePanel.removeChild(treeComponent);
    treeComponent = null;
  }
}
function togglePanel() {
  if (treePanel) {
    if (treePanel.style.getPropertyValue('display') == 'none')
      treePanel.style.removeProperty('display');
    else
      treePanel.style.setProperty('display', 'none');
  }
}
