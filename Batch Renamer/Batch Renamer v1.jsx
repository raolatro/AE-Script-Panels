// Create the main UI
function createUI() {
    var mainWindow = new Window('palette', 'Batch Comp Renamer', undefined);
    mainWindow.orientation = 'column';

    var aspectRatioGroup = mainWindow.add('group', undefined);
    aspectRatioGroup.orientation = 'row';
    aspectRatioGroup.add('statictext', undefined, 'Aspect Ratio Renaming');
    var updateAspectRatioBtn = aspectRatioGroup.add('button', undefined, 'Update Aspect Ratios');

    var versionGroup = mainWindow.add('group', undefined);
    versionGroup.orientation = 'row';
    versionGroup.add('statictext', undefined, 'Version Management');
    var newVersionBtn = versionGroup.add('button', undefined, 'New Version');
    var resetVersionBtn = versionGroup.add('button', undefined, 'Reset Version');
    var subVersionBtn = versionGroup.add('button', undefined, 'Sub Version');


    mainWindow.center();
    mainWindow.show();

    updateAspectRatioBtn.onClick = function() {
        var selectedComps = getSelectedComps();
        if (selectedComps.length === 0) {
            alert('No compositions selected. Please select at least one composition to update aspect ratios.');
        } else {
            app.beginUndoGroup('Update Aspect Ratios');
            try {
                updateAspectRatios(selectedComps);
                // Removed the success alert here
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                app.endUndoGroup();
            }
        }
    };
    
    newVersionBtn.onClick = function() {
        var selectedComps = getSelectedComps();
        if (selectedComps.length === 0) {
            alert('No compositions selected. Please select at least one composition to update version numbers.');
        } else {
            app.beginUndoGroup('New Version');
            try {
                updateVersions(selectedComps, 'new');
                // Removed the success alert here
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                app.endUndoGroup();
            }
        }
    };
    
    resetVersionBtn.onClick = function() {
        var selectedComps = getSelectedComps();
        if (selectedComps.length === 0) {
            alert('No compositions selected. Please select at least one composition to reset version numbers.');
        } else {
            app.beginUndoGroup('Reset Version');
            try {
                updateVersions(selectedComps, 'reset');
                // Removed the success alert here
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                app.endUndoGroup();
            }
        }
    };

    subVersionBtn.onClick = function() {
        var selectedComps = getSelectedComps();
        if (selectedComps.length === 0) {
            alert('No compositions selected. Please select at least one composition to update sub-version numbers.');
        } else {
            app.beginUndoGroup('Sub Version');
            try {
                updateVersions(selectedComps, 'sub');
            } catch (err) {
                alert('Error: ' + err.message);
            } finally {
                app.endUndoGroup();
            }
        }
    };
    
    
}

function getSelectedComps() {
    var items = app.project.selection;
    var selectedComps = [];

    for (var i = 0; i < items.length; i++) {
        if (items[i] instanceof CompItem) {
            selectedComps.push(items[i]);
        }
    }

    return selectedComps;
}

function updateAspectRatios(comps) {
    var versionRegex = /(v\d+([a-zA-Z])?)$/;

    for (var i = 0; i < comps.length; i++) {
        var comp = comps[i];
        var aspectRatio = getAspectRatio(comp);

        var currentName = comp.name;
        var newName;

        if (/\d+x\d+/.test(currentName)) {
            newName = currentName.replace(/(\d+x\d+)/, aspectRatio);
        } else {
            if (versionRegex.test(currentName)) {
                newName = currentName.replace(versionRegex, aspectRatio + ' $1');
            } else {
                newName = currentName + ' ' + aspectRatio;
            }
        }
        comp.name = newName;
    }
}


function getAspectRatio(comp) {
    var width = comp.width;
    var height = comp.height;

    var gcd = function(a, b) {
        if (b === 0) return a;
        return gcd(b, a % b);
    };

    var divisor = gcd(width, height);
    return (width / divisor) + 'x' + (height / divisor);
}

function updateVersions(comps, action) {
    var versionRegex = /(v\d+([a-zA-Z])?)$/;

    for (var i = 0; i < comps.length; i++) {
        var comp = comps[i];
        var currentName = comp.name;

        if (action === 'new') {
            if (versionRegex.test(currentName)) {
                var newVersion = currentName.replace(versionRegex, function(match) {
                    var versionNum = parseInt(match.slice(1));
                    versionNum++;
                    return 'v' + versionNum;
                });
                comp.name = newVersion;
            } else {
                comp.name = currentName + ' v1';
            }
        } else if (action === 'reset') {
            if (versionRegex.test(currentName)) {
                comp.name = currentName.replace(versionRegex, 'v1');
            } else {
                comp.name = currentName + ' v1';
            }
        } else if (action === 'sub') {
            if (versionRegex.test(currentName)) {
                var newSubVersion = currentName.replace(versionRegex, function(match) {
                    var versionNum = parseInt(match.slice(1));
                    var versionChar = match.slice(2);
                    if (versionChar === '') {
                        versionChar = 'A';
                    } else {
                        var charCode = versionChar.charCodeAt(0);
                        if (charCode < 90) {
                            versionChar = String.fromCharCode(charCode + 1);
                        } else {
                            versionChar = 'A';
                            versionNum++;
                        }
                    }
                    return 'v' + versionNum + versionChar;
                });
                comp.name = newSubVersion;
            } else {
                comp.name = currentName + ' v1A';
            }
        }
    }
}


createUI();

