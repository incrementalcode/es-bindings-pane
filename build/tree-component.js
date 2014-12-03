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
    var iconClass = getIconClass.bind(this)();
    var arrowClass = getArrowClass.bind(this)();
    return Reactionary.div(null, Reactionary.div({
      className: "es-container",
      onClick: this.toggle
    }, Reactionary.div({className: arrowClass}), Reactionary.h5({className: iconClass}, " " + this.props.model.name)), this.state.collapsed ? null : Reactionary.ul(null, children));
    function getIconClass() {
      switch (this.props.model.type) {
        case "ImportDeclaration":
          return "icon-cloud-download es-binding";
        case "FunctionDeclaration":
          return "icon-gear es-binding";
        case "ClassDeclaration":
          return "icon-puzzle-piece es-binding";
        case "MethodDefinition":
          return "icon-gear es-binding";
      }
      return "es-binding";
    }
    function getArrowClass() {
      if (this.props.model.children.length > 0) {
        if (this.state.collapsed)
          return "es-icon icon-chevron-right";
        else
          return "es-icon icon-chevron-down";
      } else {
        return "";
      }
    }
  },
  toggle: function() {
    this.setState({collapsed: !this.state.collapsed});
  }
});
