"use strict";
Object.defineProperties(exports, {
  activate: {get: function() {
      return activate;
    }},
  __esModule: {value: true}
});
var $__cache__,
    $__resize_45_handle__,
    $__tree_45_model__;
var parseURI = ($__cache__ = require("./cache"), $__cache__ && $__cache__.__esModule && $__cache__ || {default: $__cache__}).parseURI;
var createResizeHandle = ($__resize_45_handle__ = require("./resize-handle"), $__resize_45_handle__ && $__resize_45_handle__.__esModule && $__resize_45_handle__ || {default: $__resize_45_handle__}).createResizeHandle;
var $__2 = ($__tree_45_model__ = require("./tree-model"), $__tree_45_model__ && $__tree_45_model__.__esModule && $__tree_45_model__ || {default: $__tree_45_model__}),
    TreeModel = $__2.TreeModel,
    syntaxTreeToModel = $__2.syntaxTreeToModel;
var treePanel,
    treeComponent = null;
function activate(state) {
  treePanel = document.createElement('div');
  treePanel.className = 'es-bindings-pane';
  createResizeHandle(treePanel);
  atom.workspace.addRightPanel({item: treePanel});
  var unmountTreePanel = (function() {
    if (treeComponent) {
      treePanel.removeChild(treeComponent);
      treeComponent = null;
    }
  });
  atom.workspace.observeActivePaneItem((function(item) {
    if (!item)
      return;
    if (item.getPath && item.getGrammar && item.getGrammar().name == 'JavaScript') {
      parseURI(item.getPath(), (function(error, result) {
        if (error) {
          console.warn("Warning during parseURI() from main.js: " + error.stack);
          unmountTreePanel();
          treePanel.style.setProperty('display', 'none');
          return;
        }
        unmountTreePanel();
        treePanel.style.removeProperty('display');
        treeComponent = result.treeModel.render();
        treePanel.appendChild(treeComponent);
      }));
    } else {
      unmountTreePanel();
      treePanel.style.setProperty('display', 'none');
    }
  }));
}
