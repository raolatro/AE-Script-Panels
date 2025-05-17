(function (thisObj) {
  
  function buildUI(thisObj) {
    var versionNumber = "1.8.2";

    var panel = (thisObj instanceof Panel) ? thisObj : new Window('palette', 'True Duplicator ' + versionNumber, undefined, {resizeable: true});
    panel.orientation = "column";
    panel.alignChildren = "left";
    
    // Add description
    panel.descGroup = panel.add('group', undefined);
    panel.descGroup.orientation = 'column';
    panel.descGroup.alignChildren = 'left';
    panel.descGroup.add('statictext', undefined, 'True Duplicator makes it simple to create copies of compositions,');
    panel.descGroup.add('statictext', undefined, 'including any comps inside them, completely cloning the selected comp.');
    panel.descGroup.add('statictext', undefined, 'It also organizes the duplicates into a new folder, making it');
    panel.descGroup.add('statictext', undefined, 'easier to manage complex projects with multiple elements.');
    panel.descGroup.add('statictext', undefined, '(Experimental project made with the help of Open AI GPT-4)');
    panel.descGroup.add('statictext', undefined, '_________________________________________________________');

    // Add input text box
    panel.inputGroup = panel.add('group', undefined);
    panel.inputGroup.orientation = 'row';
    panel.inputGroup.add('statictext', undefined, 'Prefix (optional):');
    panel.folderPrefix = panel.inputGroup.add('edittext', undefined, '');
    panel.folderPrefix.characters = 15;

    // Add button
    panel.duplicateButton = panel.add('button', undefined, 'TRULY DUPLICATE');
    panel.duplicateButton.onClick = duplicateComp;

    // Add re-run script button
    /* panel.rerunScriptButton = panel.add('button', undefined, 'Re-run Script');
    panel.rerunScriptButton.onClick = function() {
      if (trueDuplicatorPanel instanceof Window) {
        trueDuplicatorPanel.close();
      }
      var scriptFile = new File($.fileName);
      if (scriptFile.exists) {
        app.scheduleTask('var scriptToRun = File("' + scriptFile.fullName + '"); scriptToRun.open("r"); eval(scriptToRun.read()); scriptToRun.close();', 100, false);
      } else {
        alert('Error: Script file not found.');
      }
    }; */
    

    // Footer group
    panel.footerGroup = panel.add('group', undefined);
    panel.footerGroup.orientation = 'row';
    // Add help button
    panel.helpButton = panel.footerGroup.add('button', undefined, '?');
    panel.helpButton.maximumSize = [20, 20];
    panel.helpButton.onClick = function() {
      alert('True Duplicator\n\nTrue Duplicator performs the following steps:\n\n1. Duplicate the selected composition (root comp)\n2. Create a new folder in the Project panel for duplicates\n3. Duplicate all nested compositions within the root comp\n4. Replace all instances of the nested comps with their duplicates\n\nVersion: ' + versionNumber + ' | Created by Raoni Lima\nFollow me: http://linktr.ee/raonilima');
    };

    // Add credits and versioning
    panel.credits = panel.footerGroup.add('statictext', undefined, 'Created by Raoni Lima | Version: ' + versionNumber);
    panel.credits.alignment = 'left';
    panel.credits.characters = 40;

    // Always return the created panel
    return panel;
  }

  

  function handleError(error) {
    var prefix = "It's not working, I got this error message: ";
    var errorMessage = prefix + error.toString();
    alert(errorMessage);

    // Copy error message to clipboard
    var copyToClipboard = new File(Folder.temp + '/temp.txt');
    copyToClipboard.encoding = 'UTF8';
    copyToClipboard.open('w');
    copyToClipboard.write(errorMessage);
    copyToClipboard.close();
    copyToClipboard.execute(); // This will open the file, which will copy the text to clipboard
    copyToClipboard.remove(); // Remove the temporary file
  }

  function duplicateComp() {
    var activeItem = app.project.activeItem;
    if (!activeItem || !(activeItem instanceof CompItem)) {
        alert('Please select a composition in the Project panel.');
        return;
    }

    app.beginUndoGroup('True Duplicator');

    var rootComp = activeItem;
    var rootCompName = rootComp.name;
    var folderPrefix = trueDuplicatorPanel.folderPrefix.text;
    var folderName = folderPrefix ? folderPrefix + ' ' + rootCompName : rootCompName + ' Duplicate';
    var duplicatesFolder = app.project.items.addFolder(folderName);

    var newRootComp = rootComp.duplicate();
    newRootComp.parentFolder = duplicatesFolder;

    var duplicatedComps = {};

    function duplicateNestedComps(parentComp, parentFolder) {
        for (var i = 1; i <= parentComp.layers.length; i++) {
            var layer = parentComp.layers[i];
            if (layer.source instanceof CompItem) {
                if (!duplicatedComps[layer.source.id]) {
                    var newComp = layer.source.duplicate();
                    newComp.parentFolder = parentFolder;
                    duplicatedComps[layer.source.id] = newComp;
                    duplicateNestedComps(newComp, parentFolder);
                }
                layer.replaceSource(duplicatedComps[layer.source.id], true);
            }
        }
    }

    duplicateNestedComps(newRootComp, duplicatesFolder);

    app.endUndoGroup();

    alert('Duplicated comp "' + rootCompName + '" with all nested compositions.');
  }

  // Create and show the panel
  var trueDuplicatorPanel = buildUI(thisObj);
  if (trueDuplicatorPanel instanceof Window) {
    trueDuplicatorPanel.show();
  }
})(this);
