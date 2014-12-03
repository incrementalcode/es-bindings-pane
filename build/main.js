"use strict";
Object.defineProperties(exports, {
  activate: {get: function() {
      return activate;
    }},
  __esModule: {value: true}
});
var $__cache__,
    $__tree_45_component__,
    $__tree_45_model__,
    $__atom__;
var parseURI = ($__cache__ = require("./cache"), $__cache__ && $__cache__.__esModule && $__cache__ || {default: $__cache__}).parseURI;
var TreeComponent = ($__tree_45_component__ = require("./tree-component"), $__tree_45_component__ && $__tree_45_component__.__esModule && $__tree_45_component__ || {default: $__tree_45_component__}).TreeComponent;
var $__2 = ($__tree_45_model__ = require("./tree-model"), $__tree_45_model__ && $__tree_45_model__.__esModule && $__tree_45_model__ || {default: $__tree_45_model__}),
    TreeModel = $__2.TreeModel,
    syntaxTreeToModel = $__2.syntaxTreeToModel;
var _atom = ($__atom__ = require("atom"), $__atom__ && $__atom__.__esModule && $__atom__ || {default: $__atom__}).default;
var React = _atom.React;
var treePanel;
function activate(state) {
  var treePanel = document.createElement('div');
  treePanel.className = 'es-bindings-pane';
  atom.workspace.addRightPanel({item: treePanel});
  atom.workspace.observeActivePaneItem((function(item) {
    if (!item)
      return;
    if (item.getPath && item.getGrammar && item.getGrammar().name == 'JavaScript') {
      parseURI(item.getPath(), (function(error, result) {
        if (error) {
          console.warn("Warning during parseURI() from main.js: " + error);
          return React.unmountComponentAtNode(treePanel);
        }
        var treeModel = result.treeModel;
        var treeComponent = TreeComponent(treeModel.bake());
        React.renderComponent(treeComponent, treePanel);
      }));
    } else {
      React.unmountComponentAtNode(treePanel);
    }
  }));
}
