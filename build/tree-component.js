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
  getInitialState: function() {
    return {collapsed: false};
  },
  render: function() {
    var children = this.state.collapsed ? [] : this.props.model.children.map((function(child, index) {
      child.key = index;
      return TreeComponent(child);
    }));
    var h5Class = "es-binding ";
    if (this.state.collapsed)
      h5Class += "es-toggle-closed";
    else
      h5Class += "es-toggle-open";
    return Reactionary.div(null, Reactionary.h5({
      className: h5Class,
      onClick: this.collapse
    }, this.props.model.name), this.state.collapsed ? null : Reactionary.ul(null, children));
  },
  collapse: function() {
    this.setState({collapsed: !this.state.collapsed});
  }
});
