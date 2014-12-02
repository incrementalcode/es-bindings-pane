"use strict";
Object.defineProperties(exports, {
  TreeComponent: {get: function() {
      return TreeComponent;
    }},
  __esModule: {value: true}
});
var $__atom__;
var _atom = ($__atom__ = require("atom"), $__atom__ && $__atom__.__esModule && $__atom__ || {default: $__atom__}).default;
var React = _atom.React;
var Reactionary = _atom.Reactionary;
var TreeComponent = React.createClass({
  displayName: 'TreeComponent',
  render: function() {
    return (Reactionary.div({className: "es-module-view"}, "hello"));
  }
});
