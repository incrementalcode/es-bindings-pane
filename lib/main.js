import {parseURI} from "./parser-cache";
import {TreeComponent} from "./tree-component";

import _atom from 'atom';
var React = _atom.React;

export function activate(state) {
  atom.packages.once('activated', () => {
    var element = document.createElement('div');
    React.constructAndRenderComponent(TreeComponent, {}, element);

    atom.workspaceView.appendToRight(element);
  });
}
