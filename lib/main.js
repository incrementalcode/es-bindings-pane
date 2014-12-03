import {parseURI} from "./cache";
import {TreeComponent} from "./tree-component";
import {TreeModel, syntaxTreeToModel} from './tree-model';

import _atom from 'atom';
var React = _atom.React;

var treePanel;
export function activate(state) {
  //Create root element for react rendering.
  var treePanel = document.createElement('div');
  treePanel.className = 'es-bindings-pane';
  atom.workspace.addRightPanel({item: treePanel});

  atom.packages.once('activated', () => {
    atom.workspace.observeActivePaneItem((item) => {
      //If active item has URI path, parse it and display data.
      if (item.getPath) {
        parseURI(item.getPath(), (error, result) => {
          if (error) {
            console.warn(error);
            return;
          }

          var {treeModel} = result;
          var treeComponent = TreeComponent(treeModel.bake());
          React.renderComponent(treeComponent, treePanel);
        });
      }
    });
  });
}
