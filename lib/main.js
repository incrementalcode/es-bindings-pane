import {parseURI} from "./cache";
import {TreeModel, syntaxTreeToModel} from './tree-model';

var treePanel, treeComponent = null;
export function activate(state) {
  //Create root element for react rendering.
  var treePanel = document.createElement('div');
  treePanel.className = 'es-bindings-pane';
  atom.workspace.addRightPanel({item: treePanel});

  var unmountTreePanel = () => {
    if (treeComponent) {
      treePanel.removeChild(treeComponent);
      treeComponent = null;
    }
  };

  //When active panel is changed, set the react model.
  atom.workspace.observeActivePaneItem((item) => {
    if (!item) return;

    //If active item is javascript and has URI path, parse it and display data.
    if (item.getPath && item.getGrammar && item.getGrammar().name == 'JavaScript') {
      parseURI(item.getPath(), (error, result) => {
        if (error) {
          console.warn("Warning during parseURI() from main.js: " + error.stack);
          unmountTreePanel();
          treePanel.style.setProperty('display', 'none');
        }

        //Successful parse, unmount old and mount new component.
        unmountTreePanel();
        treePanel.style.removeProperty('display');
        treeComponent = result.treeModel.render();
        treePanel.appendChild(treeComponent);
      });
    } else {
      unmountTreePanel();
      treePanel.style.setProperty('display', 'none');
    }
  });
}
