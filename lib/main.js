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

  //When active panel is changed, set the react model.
  atom.workspace.observeActivePaneItem((item) => {
    if (!item) return;

    //If active item is javascript and has URI path, parse it and display data.
    if (item.getPath && item.getGrammar && item.getGrammar().name == 'JavaScript') {
      parseURI(item.getPath(), (error, result) => {
        if (error) {
          console.warn("Warning during parseURI() from main.js: " + error);

          //Unmount current react component, done here to avoid flicker
          return React.unmountComponentAtNode(treePanel);
        }

        //Successful parse, mount new component. Automatically unmounts previous.
        var {treeModel} = result;
        var treeComponent = TreeComponent(treeModel.bake());
        React.renderComponent(treeComponent, treePanel);
      });
    } else {
      //Again, unmounted here to avoid flicker
      React.unmountComponentAtNode(treePanel);
    }
  });
}
