import _atom from  'atom';
var React = _atom.React;
var Reactionary = _atom.Reactionary;

//We render a tree recursively, passing in a node property formatted as follows:
export var TreeComponent = React.createClass({
  getInitialState: function() {
    return {collapsed: false};
  },

  render: function() {
    var children = this.state.collapsed ? [] : this.props.model.children.map((child, index) => {
      child.key = index;
      return TreeComponent(child);
    });

    var h5Class = "es-binding ";
    if (this.state.collapsed) h5Class += "es-toggle-closed";
    else h5Class += "es-toggle-open";

    return Reactionary.div(null,
      Reactionary.h5({className: h5Class, onClick: this.collapse}, this.props.model.name),
      this.state.collapsed ? null : Reactionary.ul(null, children)
    );
  },

  collapse: function() {
    this.setState({collapsed: !this.state.collapsed});
  }
});
