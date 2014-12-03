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

    var iconClass = getIconClass.bind(this)();
    var arrowClass = getArrowClass.bind(this)();

    var metaData = null;
    if (this.props.model.meta !== null)
      metaData = Reactionary.h5({className: 'es-meta'}, " (" + this.props.model.meta + ")");

    return Reactionary.div(null,
      Reactionary.div({className: "es-container"},
        Reactionary.div({className: arrowClass, onClick: this.toggleCollapsed}),
        Reactionary.h5({className: iconClass, onClick: this.highlightLocation}, " " + this.props.model.name),
        metaData
      ),
      this.state.collapsed ? null : Reactionary.ul(null, children)
    );

    //INTERNAL render
    //get different icon depending on tree type
    function getIconClass() {
      switch(this.props.model.type) {
        case "ImportDeclaration":
          return "icon-cloud-download es-binding";

        case "ExportDeclaration":
          return "icon-cloud-upload es-binding";

        case "FunctionDeclaration":
          return "icon-gear es-binding";

        case "ClassDeclaration":
          return "icon-puzzle es-binding";

        case "MethodDefinition":
          return "icon-gear es-binding";
      }

      return "es-binding";
    }

    //INTERNAL render
    function getArrowClass() {
      //If we have children, display the toggleable arrow.
      if (this.props.model.children.length > 0) {
        if (this.state.collapsed) return "es-icon icon-chevron-right";
        else return "es-icon icon-chevron-down";
      } else {
        return "";
      }
    }
  },

  //Jump to definition of the component this represents.
  highlightLocation: function() {
    var location = this.props.model.location;
    var range = [
      [location.start.line - 1, location.start.column],
      [location.end.line - 1, location.end.column]
    ];

    var editor = atom.workspace.getActiveTextEditor();
    editor.setSelectedBufferRange(range);
    editor.scrollToBufferPosition(range[0]);
  },

  //Toggle whether this view is collapsed  or not
  toggleCollapsed: function() {
    this.setState({collapsed: !this.state.collapsed});
  }
});
