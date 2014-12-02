"use strict";
Object.defineProperties(exports, {
  activate: {get: function() {
      return activate;
    }},
  __esModule: {value: true}
});
var $__parser_45_cache__;
var parseURI = ($__parser_45_cache__ = require("./parser-cache"), $__parser_45_cache__ && $__parser_45_cache__.__esModule && $__parser_45_cache__ || {default: $__parser_45_cache__}).parseURI;
function activate(state) {
  console.log("activated");
}
