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
var $__esprima_45_fb__,
    $__fs__;
var esprima = ($__esprima_45_fb__ = require("esprima-fb"), $__esprima_45_fb__ && $__esprima_45_fb__.__esModule && $__esprima_45_fb__ || {default: $__esprima_45_fb__}).default;
var fs = ($__fs__ = require("fs"), $__fs__ && $__fs__.__esModule && $__fs__ || {default: $__fs__}).default;
var cache = new Map();
function cachedObject(syntaxTree, lastModified) {
  var isClean = arguments[2] !== (void 0) ? arguments[2] : true;
  this.syntaxTree = syntaxTree;
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
function parseURI(uri, callback) {
  var tab = getAtomTab();
  if (tab && cache.has(uri) && cache.get(uri).isClean)
    return callback(null, cache.get(uri).syntaxTree);
  fs.stat(uri, (function(error, stat) {
    if (error)
      return callback(error);
    var lastModified = stat.mtime;
    if (cache.has(uri) && cache.get(uri).lastModified.getTime() == lastModified.getTime())
      return callback(null, cache.get(uri).syntaxTree);
    if (tab) {
      return callback(null, parseAndPush(uri, tab.getText(), lastModified));
    } else {
      fs.readFile(uri, (function(error, buffer) {
        if (error)
          return callback(error);
        return callback(null, parseAndPush(uri, buffer, lastModified));
      }));
    }
  }));
  function parseAndPush(uri, buffer, lastModified) {
    var syntaxTree = esprima.parse(buffer, {
      loc: true,
      tolerant: true
    });
    cache.set(uri, new cachedObject(syntaxTree, lastModified));
    return syntaxTree;
  }
  function getAtomTab(uri) {
    var pane = atom.workspace.paneForUri(uri);
    return pane ? pane.itemForUri(uri) : undefined;
  }
}