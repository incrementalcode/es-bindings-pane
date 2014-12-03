"use strict";
Object.defineProperties(exports, {
  TreeModel: {get: function() {
      return TreeModel;
    }},
  __esModule: {value: true}
});
var TreeModel = function TreeModel(name, type) {
  this.name = name;
  this.type = type;
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
        type: this.type,
        children: this.children.map((function(child) {
          return child.bake();
        }))
      }};
  }
}, {});
