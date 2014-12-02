//A simple implementation of an Esprima syntax tree cache.
//Given a resource URI, we run the following algorithm:
//First check if the URI is open in an atom tab. If so, and the URI is already cached,
// we can check the cache directly for whether the cache is clean as atom callbacks
// are set up to dirty modified caches.
//If the URI is not open in atom, we fstat the filesystem to determine last modified date.
// we can then compare this to the cache to determine if cache is clean or dirty.
//If we still haven't found clean data in the cache, we load the file and cache it.

import esprima from 'esprima-fb';
import fs from 'fs';

var cache = new Map();

//Cache object type.
function cachedObject(syntaxTree, lastModified, isClean = true) {
  this.syntaxTree = syntaxTree;
  this.lastModified = lastModified;
  this.isClean = isClean;
}

//Atom callback on tabs to automatically dirty the cache on buffer change.
atom.packages.once('activated', () => {
  atom.workspace.observeTextEditors((editor) => {
    editor.onDidChange(() => {
      dirtyURI(editor.getPath());
    });
  });
});

//Dirty the given cache data.
export function dirtyURI(uri) {
  if (cache.has(uri))
    cache.get(uri).isClean = false;
}

//Clear the cache.
export function clearCache() {
  cache.clear();
}

//Resolve to the esprima syntax tree for the given uri, or error.
export function parseURI(uri, callback) {
  var tab = getAtomTab();

  //If uri is an atom tab, atom callbacks dirty the cache so we can check directly.
  if (tab && cache.has(uri) && cache.get(uri).isClean)
    return callback(null, cache.get(uri).syntaxTree);

  //Get last modified date and check against cache.
  fs.stat(uri, (error, stat) => {
    if (error) return callback(error);

    let lastModified = stat.mtime;
    if (cache.has(uri) && cache.get(uri).lastModified.getTime() == lastModified.getTime())
      return callback(null, cache.get(uri).syntaxTree);

    //Cache is either nonexistant or dirty, so push and parse
    if (tab) {
      return callback(null, parseAndPush(uri, tab.getText(), lastModified));
    } else {
      fs.readFile(uri, (error, buffer) => {
        if (error) return callback(error);

        return callback(null, parseAndPush(uri, buffer, lastModified));
      });
    }
  });

  //INTERNAL parseURI
  function parseAndPush(uri, buffer, lastModified) {
    let syntaxTree = esprima.parse(buffer, {loc: true, tolerant: true});
    cache.set(uri, new cachedObject(syntaxTree, lastModified));

    return syntaxTree;
  }

  //INTERNAL parseURI
  function getAtomTab(uri) {
    let pane = atom.workspace.paneForUri(uri);
    return pane ? pane.itemForUri(uri) : undefined;
  }
}