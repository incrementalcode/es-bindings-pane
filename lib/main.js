import {createResizeHandle} from './resize-handle';
import {TreeModel} from './tree-model';
import {parseTreeModel} from './parse-tree-model';

var treePanel, treeComponent = null;
export function activate(state) {
  atom.workspaceView.command("es-bindings-pane:toggle", togglePanel);

  //Create root element for react rendering.
  treePanel = document.createElement('div');
  treePanel.className = 'es-bindings-pane';
  createResizeHandle(treePanel);

  atom.workspace.addRightPanel({item: treePanel});

  //When a javascript texteditor is finished editing.
  atom.workspace.observeTextEditors((editor) => {
    editor.onDidSave((event) => {
      displayPanel(editor);
    });
  });

  //When active panel is changed, set the tree model.
  atom.workspace.observeActivePaneItem((item) => {
    if (!item) return;

    //If active item is javascript and has URI path, parse it and display data.
    displayPanel(item);
  });
}

function displayPanel(item) {
  if (item.getPath && item.getGrammar && item.getGrammar().name == 'JavaScript') {
    parseTreeModel(item.getPath(), (error, treeModel) => {
      if (error) {
        console.warn("Warning during parseURI() from main.js: " + error.stack);
        return treePanel.style.setProperty('opacity', '0.5');
      }

      //Successful parse, unmount old and mount new component.
      unmountTreePanel();
      treePanel.style.removeProperty('display');
      treePanel.style.removeProperty('opacity');
      treeComponent = treeModel.render();
      treePanel.appendChild(treeComponent);
    });
  } else {
    return treePanel.style.setProperty('display', 'none');
  }
}

function unmountTreePanel() {
  if (treeComponent) {
    treePanel.removeChild(treeComponent);
    treeComponent = null;
  }
}

function togglePanel() {
  if (treePanel) {
    if (treePanel.style.getPropertyValue('display') == 'none')
      treePanel.style.removeProperty('display');
    else
      treePanel.style.setProperty('display', 'none');
  }
}
