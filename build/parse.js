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
  var loc = arguments[2] !== (void 0) ? arguments[2] : syntaxTree.loc;
  var type = arguments[3] !== (void 0) ? arguments[3] : "Program";
  var meta = arguments[4] !== (void 0) ? arguments[4] : null;
  var result = new TreeModel(name, loc, type, meta);
  estraverse.traverse(syntaxTree, {enter: (function(node, parent) {
      var meta;
      switch (node.type) {
        case "ExportDeclaration":
          if (node.declaration) {
            if (node.declaration.type == "VariableDeclaration") {
              var body = node.declaration.declarations[0];
              var name$__6 = body.id.name;
              var location = body.id.loc;
              result.addChild(_parse(body, name$__6, location, node.type));
            } else {
              var body$__7 = node.declaration;
              var name$__8 = body$__7.name ? body$__7.name : body$__7.id.name;
              var location$__9 = body$__7.name ? body$__7.loc : body$__7.id.loc;
              result.addChild(_parse(body$__7, name$__8, location$__9, node.type));
            }
          } else {
            for (var $__2 = node.specifiers[$traceurRuntime.toProperty(Symbol.iterator)](),
                $__3; !($__3 = $__2.next()).done; ) {
              var specifier = $__3.value;
              {
                var name$__10 = specifier.name ? specifier.name.name : specifier.id.name;
                var loc$__11 = specifier.name ? specifier.name.loc : specifier.id.loc;
                result.addChild(_parse(specifier, name$__10, loc$__11, node.type));
              }
            }
          }
          return estraverse.VisitorOption.Skip;
        case "ImportDeclaration":
          for (var $__4 = node.specifiers[$traceurRuntime.toProperty(Symbol.iterator)](),
              $__5; !($__5 = $__4.next()).done; ) {
            var specifier$__12 = $__5.value;
            {
              var name$__13 = specifier$__12.name ? specifier$__12.name.name : specifier$__12.id.name;
              var loc$__14 = specifier$__12.name ? specifier$__12.name.loc : specifier$__12.id.loc;
              result.addChild(_parse(specifier$__12, name$__13, loc$__14, node.type));
            }
          }
          return estraverse.VisitorOption.Skip;
        case "FunctionDeclaration":
          meta = node.params.map((function(param) {
            return param.name;
          })).join(", ");
          result.addChild(_parse(node.body, node.id.name, node.id.loc, node.type, meta));
          return estraverse.VisitorOption.Skip;
        case "ClassDeclaration":
          result.addChild(_parse(node.body, node.id.name, node.id.loc, node.type));
          return estraverse.VisitorOption.Skip;
        case "MethodDefinition":
          meta = node.value.params.map((function(param) {
            return param.name;
          })).join(", ");
          result.addChild(_parse(node.value, node.key.name, node.key.loc, node.type, meta));
          return estraverse.VisitorOption.Skip;
      }
    })});
  return result;
}
