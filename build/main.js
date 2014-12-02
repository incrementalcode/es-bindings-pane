"use strict";
Object.defineProperties(exports, {
  activate: {get: function() {
      return activate;
    }},
  __esModule: {value: true}
});
var $__parser_45_cache__,
    $__tree_45_component__,
    $__atom__;
var parseURI = ($__parser_45_cache__ = require("./parser-cache"), $__parser_45_cache__ && $__parser_45_cache__.__esModule && $__parser_45_cache__ || {default: $__parser_45_cache__}).parseURI;
var TreeComponent = ($__tree_45_component__ = require("./tree-component"), $__tree_45_component__ && $__tree_45_component__.__esModule && $__tree_45_component__ || {default: $__tree_45_component__}).TreeComponent;
var _atom = ($__atom__ = require("atom"), $__atom__ && $__atom__.__esModule && $__atom__ || {default: $__atom__}).default;
var React = _atom.React;
function activate(state) {
  atom.packages.once('activated', (function() {
    var element = document.createElement('div');
    React.constructAndRenderComponent(TreeComponent, {}, element);
    atom.workspaceView.appendToRight(element);
  }));
}
