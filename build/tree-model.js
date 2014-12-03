"use strict";
Object.defineProperties(exports, {
  TreeModel: {get: function() {
      return TreeModel;
    }},
  __esModule: {value: true}
});
var TreeModel = function TreeModel(name, location, type, meta) {
  this.name = name;
  this.location = location;
  this.type = type;
  this.meta = meta;
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
        location: this.location,
        type: this.type,
        meta: this.meta,
        children: this.children.map((function(child) {
          return child.bake();
        }))
      }};
  }
}, {});
