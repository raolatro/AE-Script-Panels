function AutoCompHandler(thisObj) {
    function createUI(thisObj) {
        var versionNumber = "1.0.0";
        var panel = (thisObj instanceof Panel) ? thisObj : new Window('palette', 'Auto Comp Handler ' + versionNumber, undefined, {resizeable: true});


        panel.grp = panel.add('group', undefined, 'Auto Comp Handler');
        panel.grp.orientation = 'column';
        panel.grp.alignChildren = ['left', 'top'];
        panel.grp.spacing = 10;
        panel.grp.margins = 16;

        // Resize Section
        panel.grp.resizeSection = panel.grp.add('panel', undefined, 'Resize');
        panel.grp.resizeSection.alignChildren = ['left', 'top'];
        panel.grp.resizeSection.spacing = 10;
        panel.grp.resizeSection.margins = 10;
        panel.grp.resizeSection.preferredSize.width = 200;

        var inputGroup = panel.grp.resizeSection.add('group');
        inputGroup.add('statictext', undefined, 'Width:');
        panel.grp.widthInput = inputGroup.add('edittext', undefined, '1920');
        panel.grp.widthInput.characters = 5;

        inputGroup.add('statictext', undefined, 'Height:');
        panel.grp.heightInput = inputGroup.add('edittext', undefined, '1080');
        panel.grp.heightInput.characters = 5;

        panel.grp.resizeBtn = panel.grp.resizeSection.add('button', undefined, 'Resize');
        panel.grp.resizeBtn.preferredSize = [180, 25];
        panel.grp.identifyDimensionsBtn = panel.grp.resizeSection.add('button', undefined, 'Identify Dimensions');
        panel.grp.identifyDimensionsBtn.preferredSize = [180, 25];

        // Rename Section
        panel.grp.renameSection = panel.grp.add('panel', undefined, 'Rename');
        panel.grp.renameSection.alignChildren = ['left', 'top'];
        panel.grp.renameSection.spacing = 10;
        panel.grp.renameSection.margins = 10;
        panel.grp.renameSection.preferredSize.width = 200;

        panel.grp.updateAspectRatioBtn = panel.grp.renameSection.add('button', undefined, 'Update Aspect Ratio');
        panel.grp.updateAspectRatioBtn.preferredSize = [180, 25];

        panel.grp.newVersionBtn = panel.grp.renameSection.add('button', undefined, 'New Version');
        panel.grp.newVersionBtn.preferredSize = [180, 25];

        panel.grp.subVersionBtn = panel.grp.renameSection.add('button', undefined, 'Sub Version');
        panel.grp.subVersionBtn.preferredSize = [180, 25];

        panel.grp.resetVersionBtn = panel.grp.renameSection.add('button', undefined, 'Reset Version');
        panel.grp.resetVersionBtn.preferredSize = [180, 25];

        // Footer group
        panel.footerGroup = panel.add('group', undefined);
        panel.footerGroup.orientation = 'row';
        // Add help button
        panel.helpButton = panel.footerGroup.add('button', undefined, '?');
        panel.helpButton.maximumSize = [20, 20];
        panel.helpButton.onClick = function() {
            alert('Auto Comp Handler\n\nThis is an experimental project made with the help of GPT-4 AI chatbot.\n\nPlease report if you find any bugs or want specific functions tailored for you :)\n\nVersion: ' + versionNumber + ' | Created by Raoni Lima\nContact & links: http://linktr.ee/raonilima');
        };

        // Add credits and versioning
        panel.credits = panel.footerGroup.add('statictext', undefined, 'Created by Raoni Lima | Version: ' + versionNumber);
        panel.credits.alignment = 'left';
        panel.credits.characters = 40;

        return panel;
    }

    function getSelectedCompositions() {
        var items = app.project.items;
        var selectedCompositions = [];
        for (var i = 1; i <=  items.length; i++) {
            var item = items[i];
            if (item.selected && item instanceof CompItem) {
                selectedCompositions.push(item);
            }
        }
        return selectedCompositions;
    }

    function getAspectRatio(comp) {
        var width = comp.width;
        var height = comp.height;

        var gcd = function (a, b) {
            if (b === 0) return a;
            return gcd(b, a % b);
        };

        var divisor = gcd(width, height);
        return (width / divisor) + 'x' + (height / divisor);
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

    function resizeCompositions(comps, width, height) {
        app.beginUndoGroup('Resize Compositions');
        for (var i = 0; i < comps.length; i++) {
            var comp = comps[i];
            comp.width = width;
            comp.height = height;
        }
        app.endUndoGroup();
    }

    function identifyDimensions(comps) {
        for (var i = 0; i < comps.length; i++) {
            var comp = comps[i];
            var width = comp.width;
            var height = comp.height;
            var aspectRatio = getAspectRatio(comp);
            alert("Comp Name: " + comp.name + "\nWidth: " + width + "\nHeight: " + height + "\nAspect Ratio: " + aspectRatio);
        }
    }

    function updateVersions(comps, action) {
        app.beginUndoGroup('Update Versions');
        for (var i = 0; i < comps.length; i++) {
            var comp = comps[i];
            var currentName = comp.name;
            var versionRegex = /(?:^|\s)(v\d+([a-zA-Z])?)(?:\s|$)/;
            var newName;

            if (versionRegex.test(currentName)) {
                newName = currentName.replace(versionRegex, function (match, p1, p2) {
                    var versionNumber = parseInt(p1.substring(1), 10);
                    var subVersion = p2 || '';

                    if (action === 'increment') {
                        versionNumber++;
                        subVersion = '';
                    } else if (action === 'subIncrement') {
                        if (subVersion === '') {
                            subVersion = 'A';
                        } else {
                            subVersion = String.fromCharCode(subVersion.charCodeAt() + 1);
                        }
                    } else if (action === 'reset') {
                        versionNumber = 1;
                        subVersion = '';
                    }

                    return ' v' + versionNumber + subVersion;
                });
            } else {
                if (action !== 'reset') {
                    newName = currentName + ' v1';
                } else {
                    newName = currentName;
                }
            }

            comp.name = newName;
        }
        app.endUndoGroup();
    }

    function resetVersions(comps) {
        var versionRegex = /( v\d+([a-zA-Z])?)$/;
    
        for (var i = 0; i < comps.length; i++) {
            var comp = comps[i];
            var currentName = comp.name;
            var newName = currentName.replace(versionRegex, '');
            comp.name = newName;
        }
    }
    

    function main() {
        var scriptPal = createUI(thisObj);

        if (parseFloat(app.version) < 9) {
            alert('This script requires Adobe After Effects CS4 or later.', 'Script Warning');
            return scriptPal;
        }

        scriptPal.grp.widthInput.onChange = function () {
            var width = parseInt(scriptPal.grp.widthInput.text, 10);
            if (isNaN(width) || width <= 0) {
                alert('Please enter a valid width.', 'Invalid Width');
                scriptPal.grp.widthInput.text = '1920';
            }
        };

        scriptPal.grp.heightInput.onChange = function () {
            var height = parseInt(scriptPal.grp.heightInput.text, 10);
            if (isNaN(height) || height <= 0) {
                alert('Please enter a valid height.', 'Invalid Height');
                scriptPal.grp.heightInput.text = '1080';
            }
        };

        scriptPal.grp.resizeBtn.onClick = function () {
            var selectedComps = getSelectedCompositions();
            if (selectedComps.length === 0) {
                alert('No compositions are selected.', 'No Compositions Selected');
                return;
            }

            var width = parseInt(scriptPal.grp.widthInput.text, 10);
            var height = parseInt(scriptPal.grp.heightInput.text, 10);

            resizeCompositions(selectedComps, width, height);
        };

        scriptPal.grp.identifyDimensionsBtn.onClick = function () {
            var selectedComps = getSelectedCompositions();
            if (selectedComps.length === 0) {
                alert('No compositions are selected.', 'No Compositions Selected');
                return;
            }

            var comp = selectedComps[0];
            scriptPal.grp.widthInput.text = comp.width;
            scriptPal.grp.heightInput.text = comp.height;
            identifyDimensions(selectedComps);
        };


        scriptPal.grp.updateAspectRatioBtn.onClick = function () {
            var selectedComps = getSelectedCompositions();
            if (selectedComps.length === 0) {
                alert('No compositions are selected.', 'No Compositions Selected');
                return;
            }

            updateAspectRatios(selectedComps);
        };

        scriptPal.grp.newVersionBtn.onClick = function () {
            var selectedComps = getSelectedCompositions();
            if (selectedComps.length === 0) {
                alert('No compositions are selected.', 'No Compositions Selected');
                return;
            }

            updateVersions(selectedComps, 'increment');
        };

        scriptPal.grp.subVersionBtn.onClick = function () {
            var selectedComps = getSelectedCompositions();
            if (selectedComps.length === 0) {
                alert('No compositions are selected.', 'No Compositions Selected');
                return;
            }

            updateVersions(selectedComps, 'subIncrement');
        };

        scriptPal.grp.resetVersionBtn.onClick = function () {
            var selectedComps = getSelectedCompositions();
            if (selectedComps.length === 0) {
                alert('No compositions are selected.', 'No Compositions Selected');
                return;
            }

            resetVersions(selectedComps);
        };

        return scriptPal;
    }

    var scriptPal = main();

    if (scriptPal !== null && scriptPal instanceof Window) {
        scriptPal.center();
        scriptPal.show();
    }
}

AutoCompHandler(this);
