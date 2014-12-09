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
    $__path__,
    $__async__;
var TreeModel = ($__tree_45_model__ = require("./tree-model"), $__tree_45_model__ && $__tree_45_model__.__esModule && $__tree_45_model__ || {default: $__tree_45_model__}).TreeModel;
var estraverse = ($__estraverse__ = require("estraverse"), $__estraverse__ && $__estraverse__.__esModule && $__estraverse__ || {default: $__estraverse__}).default;
var tools = ($__es_45_parse_45_tools__ = require("es-parse-tools"), $__es_45_parse_45_tools__ && $__es_45_parse_45_tools__.__esModule && $__es_45_parse_45_tools__ || {default: $__es_45_parse_45_tools__}).default;
var path = ($__path__ = require("path"), $__path__ && $__path__.__esModule && $__path__ || {default: $__path__}).default;
var async = ($__async__ = require("async"), $__async__ && $__async__.__esModule && $__async__ || {default: $__async__}).default;
function parseTreeModel(uri, callback) {
  tools.parseURI(uri, (function(error, scopes) {
    if (error)
      return callback(error);
    return _parse(scopes[0].block, callback, path.basename(uri));
  }));
}
function _parse(syntaxTree, callback) {
  var name = arguments[2] !== (void 0) ? arguments[2] : "root";
  var loc = arguments[3] !== (void 0) ? arguments[3] : syntaxTree.loc;
  var type = arguments[4] !== (void 0) ? arguments[4] : "Program";
  var isExport = arguments[5] !== (void 0) ? arguments[5] : false;
  var meta = arguments[6] !== (void 0) ? arguments[6] : null;
  var result = new TreeModel(name, loc, type, isExport, meta);
  var imports = [];
  _parseSyntaxTree(syntaxTree, result, imports, (function(error, _) {
    if (error)
      return callback(error);
    var importModuleMap = new Map();
    for (var $__5 = imports[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__6; !($__6 = $__5.next()).done; ) {
      var _import = $__6.value;
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
    var importModuleArray = [];
    for (var $__7 = importModuleMap[$traceurRuntime.toProperty(Symbol.iterator)](),
        $__8; !($__8 = $__7.next()).done; ) {
      var obj = $__8.value;
      importModuleArray.push(obj);
    }
    var editor = atom.workspace.getActiveTextEditor();
    async.each(importModuleArray, (function(obj, callback) {
      var $__11 = obj,
          source = $__11[0],
          $__12 = $__11[1],
          uriBase = $__12.uriBase,
          moduleImports = $__12.moduleImports;
      tools.resolveModulePath(editor.getPath(), source, (function(error, modulePath) {
        if (error || modulePath == "notFound")
          return callback();
        var moduleModel = parseTreeModel(modulePath, (function(error, moduleModel) {
          if (!error) {
            moduleModel.children = moduleModel.children.filter((function(child) {
              return child.isExport;
            }));
            for (var $__9 = moduleModel.children[$traceurRuntime.toProperty(Symbol.iterator)](),
                $__10; !($__10 = $__9.next()).done; ) {
              var child = $__10.value;
              {
                child.collapsed = true;
                child.location = null;
              }
            }
            moduleModel.collapsed = true;
            moduleModel.type = "ImportModule";
            moduleModel.location = null;
            moduleModel.imports = [];
            moduleModel.meta = modulePath;
            result.addImport(moduleModel);
          }
          callback();
        }));
      }));
    }), (function(error, _) {
      if (error)
        return callback(error);
      return callback(null, result);
    }));
  }));
}
function _parseSyntaxTree(syntaxTree, result, imports, callback) {
  var declarations = [];
  estraverse.traverse(syntaxTree, {enter: (function(node, parent) {
      var meta,
          isExport;
      switch (node.type) {
        case "ExportDeclaration":
          if (!node.declaration) {
            for (var $__5 = node.specifiers[$traceurRuntime.toProperty(Symbol.iterator)](),
                $__6; !($__6 = $__5.next()).done; ) {
              var specifier = $__6.value;
              {
                var name = specifier.name ? specifier.name.name : specifier.id.name;
                var loc = specifier.name ? specifier.name.loc : specifier.id.loc;
                declarations.push([specifier, name, loc, node.type, true, null]);
              }
            }
            return estraverse.VisitorOption.Skip;
          }
          break;
        case "ImportDeclaration":
          for (var $__7 = node.specifiers[$traceurRuntime.toProperty(Symbol.iterator)](),
              $__8; !($__8 = $__7.next()).done; ) {
            var specifier$__13 = $__8.value;
            imports.push({
              specifier: specifier$__13,
              node: node
            });
          }
          return estraverse.VisitorOption.Skip;
        case "FunctionDeclaration":
          meta = node.params.map((function(param) {
            return param.name;
          })).join(", ");
          isExport = parent.type == "ExportDeclaration";
          declarations.push([node.body, node.id.name, node.id.loc, node.type, isExport, meta]);
          return estraverse.VisitorOption.Skip;
        case "ClassDeclaration":
          isExport = parent.type == "ExportDeclaration";
          declarations.push([node.body, node.id.name, node.id.loc, node.type, isExport, null]);
          return estraverse.VisitorOption.Skip;
        case "MethodDefinition":
          meta = node.value.params.map((function(param) {
            return param.name;
          })).join(", ");
          declarations.push([node.value, node.key.name, node.key.loc, node.type, false, meta]);
          return estraverse.VisitorOption.Skip;
      }
    })});
  async.each(declarations, (function(declaration, callback) {
    _parse.apply(null, $traceurRuntime.spread([declaration[0], (function(error, model) {
      if (error)
        return callback(error);
      result.addChild(model);
      callback();
    })], declaration.slice(1)));
  }), callback);
}
