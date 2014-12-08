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
    console.warn("Error in parse() at parse.js: " + error.stack);
    return callback(error);
  }
}
function _parse(syntaxTree) {
  var name = arguments[1] !== (void 0) ? arguments[1] : "root";
  var loc = arguments[2] !== (void 0) ? arguments[2] : syntaxTree.loc;
  var type = arguments[3] !== (void 0) ? arguments[3] : "Program";
  var meta = arguments[4] !== (void 0) ? arguments[4] : null;
  var result = new TreeModel(name, loc, type, meta);
  var imports = [];
  estraverse.traverse(syntaxTree, {enter: (function(node, parent) {
      var meta,
          isExport;
      switch (node.type) {
        case "ExportDeclaration":
          if (!node.declaration) {
            for (var $__2 = node.specifiers[$traceurRuntime.toProperty(Symbol.iterator)](),
                $__3; !($__3 = $__2.next()).done; ) {
              var specifier = $__3.value;
              {
                var name$__7 = specifier.name ? specifier.name.name : specifier.id.name;
                var loc$__8 = specifier.name ? specifier.name.loc : specifier.id.loc;
                result.addChild(_parse(specifier, name$__7, loc$__8, node.type, true));
              }
            }
            return estraverse.VisitorOption.Skip;
          }
          break;
        case "ImportDeclaration":
          for (var $__4 = node.specifiers[$traceurRuntime.toProperty(Symbol.iterator)](),
              $__5; !($__5 = $__4.next()).done; ) {
            var specifier$__9 = $__5.value;
            imports.push({
              specifier: specifier$__9,
              node: node
            });
          }
          return estraverse.VisitorOption.Skip;
        case "FunctionDeclaration":
          meta = node.params.map((function(param) {
            return param.name;
          })).join(", ");
          isExport = parent.type == "ExportDeclaration";
          result.addChild(_parse(node.body, node.id.name, node.id.loc, node.type, isExport, meta));
          return estraverse.VisitorOption.Skip;
        case "ClassDeclaration":
          isExport = parent.type == "ExportDeclaration";
          result.addChild(_parse(node.body, node.id.name, node.id.loc, node.type, isExport));
          return estraverse.VisitorOption.Skip;
        case "MethodDefinition":
          meta = node.value.params.map((function(param) {
            return param.name;
          })).join(", ");
          result.addChild(_parse(node.value, node.key.name, node.key.loc, node.type, false, meta));
          return estraverse.VisitorOption.Skip;
      }
    })});
  if (imports.length === 0)
    return result;
  var _result = new TreeModel(name, loc, type, meta);
  var importModel = new TreeModel("Imports", loc, null, null);
  result.name = "Module";
  for (var $__2 = imports[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__3; !($__3 = $__2.next()).done; ) {
    var _import = $__3.value;
    {
      var $__6 = _import,
          specifier = $__6.specifier,
          node = $__6.node;
      var importName = specifier.name ? specifier.name.name : specifier.id.name;
      var importLoc = specifier.name ? specifier.name.loc : specifier.id.loc;
      importModel.addChild(_parse(specifier, importName, importLoc, node.type));
    }
  }
  _result.addChild(importModel);
  _result.addChild(result);
  return _result;
}
