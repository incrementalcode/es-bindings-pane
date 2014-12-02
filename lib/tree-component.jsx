import _atom from  'atom';
var React = _atom.React;
var Reactionary = _atom.Reactionary;

export var TreeComponent = React.createClass({
  render: function() {
    return (
      Reactionary.div({className: "es-module-view"}, "hello")
    );
  }
});
