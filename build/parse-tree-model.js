"use strict";
Object.defineProperties(exports, {
  parseTreeModel: {get: function() {
      return parseTreeModel;
    }},
  __esModule: {value: true}
});
var $__tree_45_model__,
    $__estraverse__,
    $__es_45_parse_45_tools__,
    $__path__;
var TreeModel = ($__tree_45_model__ = require("./tree-model"), $__tree_45_model__ && $__tree_45_model__.__esModule && $__tree_45_model__ || {default: $__tree_45_model__}).TreeModel;
var estraverse = ($__estraverse__ = require("estraverse"), $__estraverse__ && $__estraverse__.__esModule && $__estraverse__ || {default: $__estraverse__}).default;
var tools = ($__es_45_parse_45_tools__ = require("es-parse-tools"), $__es_45_parse_45_tools__ && $__es_45_parse_45_tools__.__esModule && $__es_45_parse_45_tools__ || {default: $__es_45_parse_45_tools__}).default;
var path = ($__path__ = require("path"), $__path__ && $__path__.__esModule && $__path__ || {default: $__path__}).default;
function parseTreeModel(syntaxTree, rootName, callback) {
  try {
    return callback(null, _parse(syntaxTree, rootName));
  } catch (error) {
    console.warn("Error in _parse() at parse-tree-model.js: " + error.stack);
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
            for (var $__4 = node.specifiers[$traceurRuntime.toProperty(Symbol.iterator)](),
                $__5; !($__5 = $__4.next()).done; ) {
              var specifier = $__5.value;
              {
                var name$__13 = specifier.name ? specifier.name.name : specifier.id.name;
                var loc$__14 = specifier.name ? specifier.name.loc : specifier.id.loc;
                result.addChild(_parse(specifier, name$__13, loc$__14, node.type, true));
              }
            }
            return estraverse.VisitorOption.Skip;
          }
          break;
        case "ImportDeclaration":
          for (var $__6 = node.specifiers[$traceurRuntime.toProperty(Symbol.iterator)](),
              $__7; !($__7 = $__6.next()).done; ) {
            var specifier$__15 = $__7.value;
            imports.push({
              specifier: specifier$__15,
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
  var importContainerModel = new TreeModel("Imports", loc, null, null);
  result.name = "Module";
  var importModuleMap = new Map();
  for (var $__4 = imports[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__5; !($__5 = $__4.next()).done; ) {
    var _import = $__5.value;
    {
      var source = _import.node.source.value;
      var sourceBaseName = path.basename(source);
      if (!importModuleMap.has(source))
        importModuleMap.set(source, {
          uriBase: sourceBaseName,
          moduleImports: []
        });
      importModuleMap.get(source).moduleImports.push(_import);
    }
  }
  var editor = atom.workspace.getActiveTextEditor();
  for (var $__8 = importModuleMap[$traceurRuntime.toProperty(Symbol.iterator)](),
      $__9; !($__9 = $__8.next()).done; ) {
    var $__10 = $__9.value,
        source$__16 = $__10[0],
        $__11 = $__10[1],
        uriBase = $__11.uriBase,
        moduleImports = $__11.moduleImports;
    {
      var moduleModel = new TreeModel(uriBase, null, "ImportModule", null);
      for (var $__6 = moduleImports[$traceurRuntime.toProperty(Symbol.iterator)](),
          $__7; !($__7 = $__6.next()).done; ) {
        var _import$__17 = $__7.value;
        {
          var $__12 = _import$__17,
              specifier = $__12.specifier,
              node = $__12.node;
          var importName = specifier.name ? specifier.name.name : specifier.id.name;
          var importLoc = specifier.name ? specifier.name.loc : specifier.id.loc;
          var importModel = _parse(specifier, importName, importLoc, node.type);
          moduleModel.addChild(importModel);
        }
      }
      tools.resolveModulePath(editor.getPath(), source$__16, (function(err, res) {
        if (!err)
          moduleModel.meta = res;
      }));
      moduleModel.collapsed = true;
      importContainerModel.addChild(moduleModel);
    }
  }
  _result.addChild(importContainerModel);
  _result.addChild(result);
  return _result;
}
