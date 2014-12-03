"use strict";
Object.defineProperties(exports, {
  TreeModel: {get: function() {
      return TreeModel;
    }},
  syntaxTreeToModel: {get: function() {
      return syntaxTreeToModel;
    }},
  __esModule: {value: true}
});
var TreeModel = function TreeModel(name) {
  this.name = name;
  this.children = [];
};
($traceurRuntime.createClass)(TreeModel, {
  addChild: function(child) {
    this.children.push(child);
    return this;
  },
  bake: function() {
    return {model: {
        name: this.name,
        children: this.children.map((function(child) {
          return child.bake();
        }))
      }};
  }
}, {});
function syntaxTreeToModel(syntaxTree) {
  if (!syntaxTree.type)
    return new TreeModel("Unknown");
  var result = new TreeModel(syntaxTree.type);
  if (syntaxTree.body) {
    for (var $__1 = syntaxTree.body[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__2; !($__2 = $__1.next()).done; ) {
      var child = $__2.value;
      {
        result.addChild(syntaxTreeToModel(child));
      }
    }
  }
  return result;
}
