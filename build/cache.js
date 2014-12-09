"use strict";
Object.defineProperties(exports, {
  dirtyURI: {get: function() {
      return dirtyURI;
    }},
  clearCache: {get: function() {
      return clearCache;
    }},
  parseURI: {get: function() {
      return parseURI;
    }},
  __esModule: {value: true}
});
var $__parse__,
    $__path__,
    $__esprima_45_fb__,
    $__fs__,
    $__es_45_parse_45_tools__;
var parse = ($__parse__ = require("./parse"), $__parse__ && $__parse__.__esModule && $__parse__ || {default: $__parse__}).parse;
var path = ($__path__ = require("path"), $__path__ && $__path__.__esModule && $__path__ || {default: $__path__}).default;
var esprima = ($__esprima_45_fb__ = require("esprima-fb"), $__esprima_45_fb__ && $__esprima_45_fb__.__esModule && $__esprima_45_fb__ || {default: $__esprima_45_fb__}).default;
var fs = ($__fs__ = require("fs"), $__fs__ && $__fs__.__esModule && $__fs__ || {default: $__fs__}).default;
var cache = new Map();
function cachedObject(syntaxTree, treeModel, lastModified) {
  var isClean = arguments[3] !== (void 0) ? arguments[3] : true;
  this.syntaxTree = syntaxTree;
  this.treeModel = treeModel;
  this.lastModified = lastModified;
  this.isClean = isClean;
}
atom.packages.once('activated', (function() {
  atom.workspace.observeTextEditors((function(editor) {
    editor.onDidChange((function() {
      dirtyURI(editor.getPath());
    }));
  }));
}));
function dirtyURI(uri) {
  if (cache.has(uri))
    cache.get(uri).isClean = false;
}
function clearCache() {
  cache.clear();
}
var tools = ($__es_45_parse_45_tools__ = require("es-parse-tools"), $__es_45_parse_45_tools__ && $__es_45_parse_45_tools__.__esModule && $__es_45_parse_45_tools__ || {default: $__es_45_parse_45_tools__}).default;
function parseURI(uri, callback) {
  tools.parseURI(uri, (function(err, res) {
    return console.log(res);
  }));
  var tab = getAtomTab();
  if (tab && cache.has(uri) && cache.get(uri).isClean)
    return callback(null, cache.get(uri).syntaxTree);
  fs.stat(uri, (function(error, stat) {
    if (error)
      return callback(error);
    var lastModified = stat.mtime;
    if (cache.has(uri) && cache.get(uri).lastModified.getTime() == lastModified.getTime())
      return callback(null, cache.get(uri));
    if (tab) {
      return parseAndPush(uri, tab.getText(), lastModified, callback);
    } else {
      fs.readFile(uri, (function(error, buffer) {
        if (error)
          return callback(error);
        return parseAndPush(uri, buffer, lastModified, callback);
      }));
    }
  }));
  function parseAndPush(uri, buffer, lastModified, callback) {
    try {
      var syntaxTree = esprima.parse(buffer, {
        loc: true,
        tolerant: true
      });
    } catch (error) {
      return callback(error);
    }
    var baseName = path.basename(uri);
    parse(syntaxTree, baseName, (function(error, treeModel) {
      if (error)
        return callback(error);
      var toCache = new cachedObject(syntaxTree, treeModel, lastModified);
      cache.set(uri, toCache);
      return callback(null, toCache);
    }));
  }
  function getAtomTab(uri) {
    var pane = atom.workspace.paneForUri(uri);
    return pane ? pane.itemForUri(uri) : undefined;
  }
}
