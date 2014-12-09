import {createResizeHandle} from './resize-handle';
import {TreeModel, syntaxTreeToModel} from './tree-model';
import {parseTreeModel} from './parse-tree-model';

var treePanel, treeComponent = null;
export function activate(state) {
  //Create root element for react rendering.
  treePanel = document.createElement('div');
  treePanel.className = 'es-bindings-pane';
  createResizeHandle(treePanel);

  atom.workspace.addRightPanel({item: treePanel});

  var unmountTreePanel = () => {
    if (treeComponent) {
      treePanel.removeChild(treeComponent);
      treeComponent = null;
    }
  };

  //When active panel is changed, set the tree model.
  atom.workspace.observeActivePaneItem((item) => {
    if (!item) return;

    //If active item is javascript and has URI path, parse it and display data.
    if (item.getPath && item.getGrammar && item.getGrammar().name == 'JavaScript') {
      parseTreeModel(item.getPath(), (error, treeModel) => {
        if (error) {
          console.warn("Warning during parseURI() from main.js: " + error.stack);
          unmountTreePanel();
          treePanel.style.setProperty('display', 'none');
          return;
        }

        //Successful parse, unmount old and mount new component.
        unmountTreePanel();
        treePanel.style.removeProperty('display');
        treeComponent = treeModel.render();
        treePanel.appendChild(treeComponent);
      });
    } else {
      unmountTreePanel();
      treePanel.style.setProperty('display', 'none');
    }
  });
}
