"use strict";
Object.defineProperties(exports, {
  parse: {get: function() {
      return parse;
    }},
  __esModule: {value: true}
});
var $__tree_45_model__,
    $__estraverse__;
var TreeModel = ($__tree_45_model__ = require("./tree-model"), $__tree_45_model__ && $__tree_45_model__.__esModule && $__tree_45_model__ || {default: $__tree_45_model__}).TreeModel;
var estraverse = ($__estraverse__ = require("estraverse"), $__estraverse__ && $__estraverse__.__esModule && $__estraverse__ || {default: $__estraverse__}).default;
function parse(syntaxTree, callback) {
  try {
    return callback(null, _parse(syntaxTree));
  } catch (error) {
    return callback(error);
  }
}
function _parse(syntaxTree) {
  var name = arguments[1] !== (void 0) ? arguments[1] : "root";
  var type = arguments[2] !== (void 0) ? arguments[2] : "Program";
  var result = new TreeModel(name, syntaxTree.loc, type);
  estraverse.traverse(syntaxTree, {enter: (function(node, parent) {
      switch (node.type) {
        case "ImportDeclaration":
          for (var $__2 = node.specifiers[$traceurRuntime.toProperty(Symbol.iterator)](),
              $__3; !($__3 = $__2.next()).done; ) {
            var specifier = $__3.value;
            {
              var name$__4 = specifier.name ? specifier.name.name : specifier.id.name;
              result.addChild(_parse(specifier, name$__4, node.type));
            }
          }
          return estraverse.VisitorOption.Skip;
        case "FunctionDeclaration":
          result.addChild(_parse(node.body, node.id.name, node.type));
          return estraverse.VisitorOption.Skip;
        case "ClassDeclaration":
          result.addChild(_parse(node.body, node.id.name, node.type));
          return estraverse.VisitorOption.Skip;
        case "MethodDefinition":
          result.addChild(_parse(node.value, node.key.name, node.type));
          return estraverse.VisitorOption.Skip;
      }
    })});
  return result;
}
