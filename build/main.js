"use strict";
Object.defineProperties(exports, {
  activate: {get: function() {
      return activate;
    }},
  __esModule: {value: true}
});
var $__resize_45_handle__,
    $__tree_45_model__,
    $__parse_45_tree_45_model__,
    $__es_45_parse_45_tools__,
    $__path__;
var createResizeHandle = ($__resize_45_handle__ = require("./resize-handle"), $__resize_45_handle__ && $__resize_45_handle__.__esModule && $__resize_45_handle__ || {default: $__resize_45_handle__}).createResizeHandle;
var $__1 = ($__tree_45_model__ = require("./tree-model"), $__tree_45_model__ && $__tree_45_model__.__esModule && $__tree_45_model__ || {default: $__tree_45_model__}),
    TreeModel = $__1.TreeModel,
    syntaxTreeToModel = $__1.syntaxTreeToModel;
var parseTreeModel = ($__parse_45_tree_45_model__ = require("./parse-tree-model"), $__parse_45_tree_45_model__ && $__parse_45_tree_45_model__.__esModule && $__parse_45_tree_45_model__ || {default: $__parse_45_tree_45_model__}).parseTreeModel;
var tools = ($__es_45_parse_45_tools__ = require("es-parse-tools"), $__es_45_parse_45_tools__ && $__es_45_parse_45_tools__.__esModule && $__es_45_parse_45_tools__ || {default: $__es_45_parse_45_tools__}).default;
var path = ($__path__ = require("path"), $__path__ && $__path__.__esModule && $__path__ || {default: $__path__}).default;
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
      tools.parseURI(item.getPath(), (function(error, scopes) {
        if (error || !scopes) {
          console.warn("Warning during parseURI() from main.js: " + error.stack);
          unmountTreePanel();
          treePanel.style.setProperty('display', 'none');
          return;
        }
        parseTreeModel(scopes[0].block, path.basename(item.getPath()), (function(error, treeModel) {
          if (error) {
            console.warn("Error during parseTreeModel() from main.js: " + error);
            return;
          }
          unmountTreePanel();
          treePanel.style.removeProperty('display');
          treeComponent = treeModel.render();
          treePanel.appendChild(treeComponent);
        }));
      }));
    } else {
      unmountTreePanel();
      treePanel.style.setProperty('display', 'none');
    }
  }));
}
