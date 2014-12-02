{WorkspaceView} = require 'atom'
EsModuleView = require '../lib/es-module-view'

# Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
#
# To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
# or `fdescribe`). Remove the `f` to unfocus the block.

describe "EsModuleView", ->
  activationPromise = null

  beforeEach ->
    atom.workspaceView = new WorkspaceView
    activationPromise = atom.packages.activatePackage('es-module-view')

  describe "when the es-module-view:toggle event is triggered", ->
    it "attaches and then detaches the view", ->
      expect(atom.workspaceView.find('.es-module-view')).not.toExist()

      # This is an activation event, triggering it will cause the package to be
      # activated.
      atom.commands.dispatch atom.workspaceView.element, 'es-module-view:toggle'

      waitsForPromise ->
        activationPromise

      runs ->
        expect(atom.workspaceView.find('.es-module-view')).toExist()
        atom.commands.dispatch atom.workspaceView.element, 'es-module-view:toggle'
        expect(atom.workspaceView.find('.es-module-view')).not.toExist()
