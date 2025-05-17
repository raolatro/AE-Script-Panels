// Rao Master Script Pack
// Version: 1.3.2

// Created by Raoni Lima (http://linktr.ee/raonilima)
// This is an experimental project using GPT-4 for automation and efficiency in After Effects

function RAO_Master_Script_Pack(thisObj) {

    // Panel UI Build
    function createUI(thisObj) {
        var versionNumber = "1.3.2";
        var panel = (thisObj instanceof Panel) ? thisObj : new Window('palette', 'Master Script Panel', undefined, {resizeable: true});

        panel.alignChildren = ['left', 'top'];
        panel.spacing = 10;
        panel.margins = 10;

        panel.grp = panel.add('group', undefined, 'Raoni Master Script Pack');
        panel.grp.orientation = 'column';
        panel.grp.alignChildren = ['left', 'top'];
        panel.grp.spacing = 10;
        panel.grp.margins = 10;


        // Quick Render Section
        panel.grp.quickRenderSection = panel.grp.add('panel', undefined, 'QUICK RENDER');
        panel.grp.quickRenderSection.orientation = 'column';
        panel.grp.quickRenderSection.alignChildren = ['left', 'top'];
        panel.grp.quickRenderSection.spacing = 10;
        panel.grp.quickRenderSection.margins = [10, 10, 10, 10];

        panel.grp.renderMP4HRBtn = panel.grp.quickRenderSection.add('button', undefined, 'Render MP4 (HR)');
        panel.grp.renderMP4HRBtn.preferredSize = [180, 25];


        // Resize Section
        panel.grp.resizeSection = panel.grp.add('panel', undefined, 'RESIZER');
        panel.grp.resizeSection.alignChildren = ['left', 'top'];
        panel.grp.resizeSection.spacing = 10;
        panel.grp.resizeSection.margins = 10;
        
        panel.grp.resizeSection.contentGroup = panel.grp.resizeSection.add('group');
        panel.grp.resizeSection.contentGroup.orientation = 'column';
        panel.grp.resizeSection.contentGroup.alignChildren = 'left';

        var inputGroup = panel.grp.resizeSection.add('group');
        inputGroup.add('statictext', undefined, 'Width:');
        panel.grp.widthInput = inputGroup.add('edittext', undefined, '');
        panel.grp.widthInput.characters = 5;

        inputGroup.add('statictext', undefined, 'Height:');
        panel.grp.heightInput = inputGroup.add('edittext', undefined, '');
        panel.grp.heightInput.characters = 5;

        panel.grp.resizeBtn = panel.grp.resizeSection.add('button', undefined, 'Resize');
        panel.grp.resizeBtn.preferredSize = [180, 25];


        // Bkg Colour Section
        panel.grp.colorPanel = panel.grp.add("panel", undefined, "BKG COLOR");
        panel.grp.colorPanel.orientation = "row";
        panel.grp.colorPanel.colorPicker = panel.grp.colorPanel.add("edittext", undefined, "255,255,255"); // default to white color
        panel.grp.colorPanel.colorPicker.characters = 15;
        panel.grp.colorPanel.colorButton = panel.grp.colorPanel.add("button", undefined, "Change Bkg Color");


        // Rename Section
        panel.grp.renameSection = panel.grp.add('panel', undefined, 'BATCH RENAMER');
        panel.grp.renameSection.alignChildren = ['left', 'top'];
        panel.grp.renameSection.spacing = 10;
        panel.grp.renameSection.margins = 10;
        
        panel.grp.renameSection.contentGroup = panel.grp.renameSection.add('group');
        panel.grp.renameSection.contentGroup.orientation = 'column';
        panel.grp.renameSection.contentGroup.alignChildren = 'left';

        panel.grp.updateAspectRatioBtn = panel.grp.renameSection.add('button', undefined, 'Update Aspect Ratio');
        panel.grp.updateAspectRatioBtn.preferredSize = [180, 25];

        panel.grp.updateDimensionsBtn = panel.grp.renameSection.add('button', undefined, 'Update Dimensions');
        panel.grp.updateDimensionsBtn.preferredSize = [180, 25];

        panel.grp.newVersionBtn = panel.grp.renameSection.add('button', undefined, 'New Version');
        panel.grp.newVersionBtn.preferredSize = [180, 25];

        panel.grp.subVersionBtn = panel.grp.renameSection.add('button', undefined, 'New Sub-Version');
        panel.grp.subVersionBtn.preferredSize = [180, 25];

        panel.grp.resetVersionBtn = panel.grp.renameSection.add('button', undefined, 'Reset Version');
        panel.grp.resetVersionBtn.preferredSize = [180, 25];

        // True Duplicator Section
        panel.grp.duplicatorSection = panel.grp.add('panel', undefined, 'TRUE DUPLICATOR');
        panel.grp.duplicatorSection.alignChildren = ['left', 'top'];
        panel.grp.duplicatorSection.spacing = 10;
        panel.grp.duplicatorSection.margins = 10;
        panel.grp.duplicatorSection.preferredSize.width = -1;

        panel.grp.duplicatorSection.contentGroup = panel.grp.duplicatorSection.add('group');
        panel.grp.duplicatorSection.contentGroup.orientation = 'column';
        panel.grp.duplicatorSection.contentGroup.alignChildren = 'left';

        panel.grp.trueDuplicatorBtn = panel.grp.duplicatorSection.add('button', undefined, 'Duplicate Selected Composition');
        panel.grp.trueDuplicatorBtn.preferredSize = [180, 25];

        // Layer Management Section
        panel.grp.layerManagementSection = panel.grp.add('panel', undefined, 'LAYER MANAGER');
        panel.grp.layerManagementSection.alignChildren = ['left', 'top'];
        panel.grp.layerManagementSection.spacing = 10;
        panel.grp.layerManagementSection.margins = 10;
        
        panel.grp.layerManagementSection.contentGroup = panel.grp.layerManagementSection.add('group');
        panel.grp.layerManagementSection.contentGroup.orientation = 'column';
        panel.grp.layerManagementSection.contentGroup.alignChildren = 'left';

        var layerDuplicationGroup = panel.grp.layerManagementSection.add('group');
        layerDuplicationGroup.add('statictext', undefined, 'Duplicate:');
        panel.grp.duplicateInput = layerDuplicationGroup.add('edittext', undefined, '1');
        panel.grp.duplicateInput.characters = 4;
        panel.grp.duplicateLayerBtn = layerDuplicationGroup.add('button', undefined, 'Duplicate');

        var layerCascadeGroup = panel.grp.layerManagementSection.add('group');
        layerCascadeGroup.add('statictext', undefined, 'Cascade:');
        panel.grp.layerManagementSection.cascadeInput = layerCascadeGroup.add('edittext', undefined, '1');
        panel.grp.layerManagementSection.cascadeInput.characters = 4;
        panel.grp.layerManagementSection.exponentialCascadeCheckbox = layerCascadeGroup.add('checkbox', undefined, 'Expo');
        panel.grp.layerManagementSection.cascadeBtn = layerCascadeGroup.add('button', undefined, 'Cascade');
        panel.grp.layerManagementSection.alignBtn = layerCascadeGroup.add('button', undefined, 'Align');

        // New Null Controller
        panel.grp.newNullControllerBtn = panel.grp.layerManagementSection.add('button', undefined, 'New Null Controller');
        panel.grp.newNullControllerBtn.preferredSize = [180, 25];

        //'Clipping Matte' button for masking the selected layers
        panel.grp.layerManagementSection.clippingButton = panel.grp.layerManagementSection.add("button", undefined, "Clipping Matte");


        // Create Center Anchor button
        panel.grp.layerManagementSection.centerAnchorBtn = panel.grp.layerManagementSection.add('button', undefined, 'Center Anchors');

        panel.grp.layerManagementSection.cleanShapesButton = panel.grp.layerManagementSection.add("button", undefined, "Clean Shapes");
        


        // TEXT SPLITTER
        panel.grp.textSplitterPanel = panel.grp.add('panel', undefined, 'TEXT SPLITTER');
        panel.grp.textSplitterPanel.orientation = 'column';
        panel.grp.textSplitterPanel.alignChildren = ['fill', 'top'];
        panel.grp.textSplitterPanel.spacing = 10;
        panel.grp.textSplitterPanel.margins = 16;

        panel.grp.splitTextButton = panel.grp.textSplitterPanel.add("button", undefined, "Separate Words");
        panel.grp.splitTextButton.onClick = function () {
            splitText();
        }

        // EVENT LISTENERS

        panel.grp.layerManagementSection.cleanShapesButton.onClick = cleanShapes;
        
        panel.grp.layerManagementSection.centerAnchorBtn.onClick = function() {
            centerAnchorPoint();
        };

        panel.grp.layerManagementSection.clippingButton.onClick = createClippingMatte;

        panel.grp.colorPanel.colorButton.onClick = function() {
            changeBkgColor(panel.grp.colorPanel.colorPicker.text);
        };

    
        panel.grp.renderMP4HRBtn.onClick = function() {
            quickRenderMP4HR();
        }
        panel.grp.duplicateLayerBtn.onClick = function() {
            var numDuplicates = parseInt(panel.grp.duplicateInput.text);
            if (isNaN(numDuplicates) || numDuplicates < 1) {
                alert("Please enter a valid number for duplication.");
            } else {
                duplicateSelectedLayers(numDuplicates);
            }
        };

        panel.grp.layerManagementSection.cascadeBtn.onClick = function() {
            var comp = app.project.activeItem;
            if (comp && comp instanceof CompItem) {
                var layers = comp.selectedLayers.slice(0);
                var frames = parseInt(panel.grp.layerManagementSection.cascadeInput.text);
                var exponential = panel.grp.layerManagementSection.exponentialCascadeCheckbox.value;
                if (layers.length > 0) {
                    createCascade(frames, exponential);
                } else {
                    alert("No layers selected. Please select the layers you want to apply the cascade to.");
                }
            } else {
                alert("Please select a composition.");
            }
        };
        panel.grp.layerManagementSection.alignBtn.onClick = function() {
            var comp = app.project.activeItem;
            if (comp && comp instanceof CompItem) {
                var layers = comp.selectedLayers.slice(0);
                if (layers.length > 0) {
                    alignLayers();
                } else {
                    alert("No layers selected.\n\nPlease select the layers you want to align.");
                }
            }
        };   
        panel.grp.newNullControllerBtn.onClick = function() {
            createNewNullController();
        };
        panel.grp.newNullControllerBtn.onClick = function() {
            createNewNullController();
        };
        panel.grp.resizeBtn.onClick = function () {
            var selectedComps = getSelectedCompositions();
            if (selectedComps.length === 0) {
                alert('Please select one or more compositions to resize.');
            } else {
                var width = parseInt(panel.grp.widthInput.text, 10);
                var height = parseInt(panel.grp.heightInput.text, 10);
                resizeCompositions(selectedComps, width, height);
            }
        };
        panel.grp.updateAspectRatioBtn.onClick = function () {
            var selectedComps = getSelectedCompositions();
            if (selectedComps.length === 0) {
                alert('Please select one or more compositions to update aspect ratio.');
            } else {
                updateAspectRatios(selectedComps);
            }
        };
        panel.grp.updateDimensionsBtn.onClick = function () {
            var selectedComps = getSelectedCompositions();
            if (selectedComps.length === 0) {
                alert('Please select one or more compositions to update aspect ratio.');
            } else {
                updateDimension(selectedComps);
            }
        };
        panel.grp.newVersionBtn.onClick = function () {
            var selectedComps = getSelectedCompositions();
            if (selectedComps.length === 0) {
                alert('Please select one or more compositions to create a new version.');
            } else {
                updateVersions(selectedComps, 'increment');
            }
        };
        panel.grp.subVersionBtn.onClick = function () {
            var selectedComps = getSelectedCompositions();
            if (selectedComps.length === 0) {
                alert('Please select one or more compositions to create a new sub-version.');
            } else {
                updateVersions(selectedComps, 'subIncrement');
            }
        };
        panel.grp.resetVersionBtn.onClick = function () {
            var selectedComps = getSelectedCompositions();
            if (selectedComps.length === 0) {
                alert('Please select one or more compositions to reset version.');
            } else {
                updateVersions(selectedComps, 'reset');
            }
        };
        panel.grp.trueDuplicatorBtn.onClick = function () {
            trueDuplicator();
        };

        if (panel instanceof Window) {
            panel.center();
            panel.show();
        } else {
            panel.layout.layout(true);
        }
        // Footer group
        panel.footerGroup = panel.add('group', undefined);
        panel.footerGroup.orientation = 'row';

        // Add help button
        panel.helpButton = panel.footerGroup.add('button', undefined, '?');
        panel.helpButton.maximumSize = [20, 20];
        panel.helpButton.onClick = function() {
            alert('Raoni Master Script Pack\n\nThis is an experimental project made with the help of GPT-4 AI chatbot.\n\nPlease report if you find any bugs or want specific functions tailored for you :)\n\nVersion: ' + versionNumber + ' | Created by Raoni Lima\nContact & links: http://linktr.ee/raonilima');
        };

        // Add credits and versioning
        panel.credits = panel.footerGroup.add('statictext', undefined, 'Created by Raoni Lima | Version: ' + versionNumber);
        panel.credits.alignment = 'left';
        panel.credits.characters = 40;

        panel.layout.layout(true);

        if (panel instanceof Window) {
            panel.layout.layout(true);
            panel.layout.resize();
            panel.onResizing = panel.onResize = function() {
                this.layout.resize();
            };
        }
        return panel;
    }




////////// Functionalities ////////////////////////////////



    // CLEAN SHAPES
    function cleanShapes() {
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }
    
        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) {
            alert("Please select one or more shape layers.");
            return;
        }
    
        app.beginUndoGroup("Clean Shapes");
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            if (layer instanceof ShapeLayer) {
                var contents = layer.property("Contents");
                for (var j = 1; j <= contents.numProperties; j++) {
                    var group = contents.property(j);
                    if (group.matchName == "ADBE Vector Group") {
                        var pathsGroup = group.property("ADBE Vectors Group");
                        for (var k = pathsGroup.numProperties; k >= 1; k--) {
                            var path = pathsGroup.property(k);
                            if (path.name == "Path 2") {
                                path.remove();
                            }
                        }
                    }
                }
            }
        }
        app.endUndoGroup();
    }    

    // CLIPPING MASK / MATTE
    function createClippingMatte() {
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }

        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) {
            alert("Please select one or more layers.");
            return;
        }

        // Calculate the bounding box for all selected layers
        var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        var inPoint = Infinity, outPoint = -Infinity;
        var highestLayerIndex = Infinity;
        var layerNames = [];
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            layerNames.push(layer.name);

            var bounds = layer.sourceRectAtTime(comp.time, false);
            var position = layer.position.value;

            minX = Math.min(minX, position[0] - bounds.width / 2);
            maxX = Math.max(maxX, position[0] + bounds.width / 2);
            minY = Math.min(minY, position[1] - bounds.height / 2);
            maxY = Math.max(maxY, position[1] + bounds.height / 2);

            inPoint = Math.min(inPoint, layer.inPoint);
            outPoint = Math.max(outPoint, layer.outPoint);

            highestLayerIndex = Math.min(highestLayerIndex, layer.index);
        }

            // Create the new shape layer
            var shapeLayer = comp.layers.addShape();
            shapeLayer.moveBefore(comp.layer(highestLayerIndex));
            shapeLayer.name = "Matte (" + layerNames.join(", ") + ")";
            shapeLayer.startTime = inPoint;
            shapeLayer.outPoint = outPoint;
            shapeLayer.label = 10;  // Yellow


        // Create the rectangle path
        var contents = shapeLayer.property("Contents");
        var rect = contents.addProperty("ADBE Vector Group");
        var rectPath = rect.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");

        // Set the size and position of the rectangle
        var rectSize = rectPath.property("ADBE Vector Rect Size");
        rectSize.setValue([maxX - minX, maxY - minY]);

        var rectPosition = rectPath.property("ADBE Vector Rect Position");
        rectPosition.setValue([(minX + maxX) / 2, (minY + maxY) / 2]);

        // Set the fill color
        var fill = rect.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
        fill.property("Color").setValue([1, 1, 0]);  // Yellow

        // Set the track matte of the selected layers
        app.beginUndoGroup("Set Matte");
        for (var i = 0; i < selectedLayers.length; i++) {
            selectedLayers[i].trackMatteType = TrackMatteType.ALPHA;
        }
        app.endUndoGroup();
    }



    // CHANGE BKG COLOR of COMPS
    function changeBkgColor(hexColor) {
        var selectedItems = app.project.selection;
        
        if (selectedItems.length === 0) {
            alert("Please select one or more comps.");
            return;
        }
    
        if (!hexColor) {
            alert("Please enter a hex color code.");
            return;
        }
        
        var rgbColor = hexToRgb(hexColor);
    
        if (!rgbColor) {
            alert("Please enter a valid hex color code.");
            return;
        }
    
        app.beginUndoGroup("Change Bkg Color");
        for (var i = 0; i < selectedItems.length; i++) {
            if (selectedItems[i] instanceof CompItem) {
                selectedItems[i].bgColor = rgbColor;
            }
        }
        app.endUndoGroup();
    }
    
    // Function to convert hex color to rgb color.
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [parseInt(result[1], 16)/255, parseInt(result[2], 16)/255, parseInt(result[3], 16)/255] : null;
    }


    // Center Anchor Point
    function centerAnchorPoint() {
        var selectedLayers = app.project.activeItem.selectedLayers;
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            var layerBounds = layer.sourceRectAtTime(0, false);
    
            // Calculate the new anchor point
            var newX = layerBounds.left + layerBounds.width / 2;
            var newY = layerBounds.top + layerBounds.height / 2;
            var newAnchor = [newX, newY];
    
            // Calculate the difference between the new anchor and the old one
            var delta = [newAnchor[0] - layer.anchorPoint.value[0], newAnchor[1] - layer.anchorPoint.value[1]];
    
            // Change the position to compensate for the change in anchor point
            layer.position.setValue([layer.position.value[0] + delta[0], layer.position.value[1] + delta[1]]);
            
            // Set the new anchor point
            layer.anchorPoint.setValue(newAnchor);
        }
    }
    
    
    
    

    // Text Splitter Functionality
    function splitText() {
        var comp = app.project.activeItem;
        var selectedLayers = comp.selectedLayers;
    
        if (selectedLayers.length !== 1 || !(selectedLayers[0] instanceof TextLayer)) {
            alert("Please select a single text layer.");
            return;
        }
    
        var originalTextLayer = selectedLayers[0];
        var textDocument = originalTextLayer.property("Source Text").value;
        var words = textDocument.text.split(/(?<=\w\W)|\s/);
    
        app.beginUndoGroup("Split Text");
    
        var previousEndTime = originalTextLayer.inPoint;
        var newTextLayers = [];
    
        for (var i = 0; i < words.length; i++) {
            var newTextLayer = originalTextLayer.duplicate();
            newTextLayer.property("Source Text").setValue(new TextDocument(words[i]));
            newTextLayer.name = words[i];
            newTextLayer.startTime = previousEndTime;
            previousEndTime = newTextLayer.outPoint;
            newTextLayers.push(newTextLayer);
        }
        originalTextLayer.enabled = false;
    
        for (var i = newTextLayers.length - 1; i >= 0; i--) {
            newTextLayers[i].moveBefore(originalTextLayer);
        }
        app.endUndoGroup();
    }
    
    
    
    
    // Quick Render Functionalities
    function quickRenderMP4HR() {
        var selectedItems = app.project.selection;
        var desktopFolder = Folder.desktop.fsName;
        var bestSettings = "Best Settings";
        var h264MatchSettings = "H.264 - Match Render Settings";
    
        for (var i = 0; i < selectedItems.length; i++) {
            if (selectedItems[i] instanceof CompItem) {
                var comp = selectedItems[i];
                var renderQueueItem = app.project.renderQueue.items.add(comp);
                
                renderQueueItem.applyTemplate(bestSettings);
                renderQueueItem.outputModules[1].applyTemplate(h264MatchSettings);
                renderQueueItem.outputModules[1].file = new File(desktopFolder + "/" + comp.name + ".mp4");
            }
        }
    
        // Start rendering with a slight delay
        setTimeout(function() {
            app.project.renderQueue.render();
            alert('Rendering MP4...');
        }, 100);
    }    

    // True Duplicator Functionality
    function duplicateHierarchy(sourceItem, destFolder) {
        if (!(sourceItem instanceof FolderItem)) {
            var duplicatedItem = sourceItem.duplicate();
            duplicatedItem.parentFolder = destFolder;
            return duplicatedItem;
        }

        var newFolder = app.project.items.addFolder(sourceItem.name);
        newFolder.parentFolder = destFolder;

        for (var i = 1; i <= sourceItem.numItems; i++) {
            duplicateHierarchy(sourceItem.item(i), newFolder);
        }
    }

    function trueDuplicator() {
        var activeItem = app.project.activeItem;
        if (!activeItem || !(activeItem instanceof CompItem)) {
            alert('Please select a composition in the Project panel.');
            return;
        }

        app.beginUndoGroup('True Duplicator');

        var rootComp = activeItem;
        var rootCompName = rootComp.name;
        var folderName = rootCompName + ' (Duplicated Comps)';
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
        //alert('Duplicated comp "' + rootCompName + '" with all nested compositions.');
    }

    // Auto Comp Handler Functionality
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

    function getDimension(comp) {
        var width = comp.width;
        var height = comp.height;
        return width + 'x' + height;
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

    function updateDimension(comps) {
        var versionRegex = /(v\d+([a-zA-Z])?)$/;

        for (var i = 0; i < comps.length; i++) {
            var comp = comps[i];
            var compDimension = getDimension(comp);

            var currentName = comp.name;
            var newName;

            if (/\d+x\d+/.test(currentName)) {
                newName = currentName.replace(/(\d+x\d+)/, compDimension);
            } else {
                if (versionRegex.test(currentName)) {
                    newName = currentName.replace(versionRegex, compDimension + ' $1');
                } else {
                    newName = currentName + ' ' + compDimension;
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
            var reseted;

            if (versionRegex.test(currentName)) {
                newName = currentName.replace(versionRegex, function (match, p1, p2) {
                    var versionNumber = parseInt(p1.substring(1), 10);
                    var subVersion = p2 || '';

                    if (action === 'increment') {
                        versionNumber++;
                        subVersion = '';
                        reseted = false;
                    } else if (action === 'subIncrement') {
                        if (subVersion === '') {
                            subVersion = 'A';
                        } else {
                            subVersion = String.fromCharCode(subVersion.charCodeAt() + 1);
                        }
                        reseted = false;
                    } else if (action === 'reset') {
                        reseted = true;
                    }

                    if (reseted == true) {
                        return '';
                    } else {
                        return ' v' + versionNumber + subVersion;
                    }
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

    // Layer Cascade Functionality
    function createCascade(numFrames, exponential) {
        app.beginUndoGroup('Layer Cascade');
        var comp = app.project.activeItem;
        if (comp && comp instanceof CompItem) {
            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length < 2) {
                alert('Please select at least two layers.');
            } else {
                for (var i = 0; i < selectedLayers.length; i++) {
                    var layer = selectedLayers[i];
                    var frameDuration = comp.frameDuration;
                    var cascadeDelay;
    
                    if (exponential) {
                        cascadeDelay = Math.pow(i, 2) * numFrames * frameDuration;
                    } else {
                        cascadeDelay = i * numFrames * frameDuration;
                    }
                    layer.startTime += cascadeDelay;
                }
            }
        } else {
            alert('Please select a composition first.');
        }
        app.endUndoGroup();
    }
    
    // Layer Cascade Functionality
    function createCascade(numFrames, exponential) {
        app.beginUndoGroup('Layer Cascade');
        var comp = app.project.activeItem;
        if (comp && comp instanceof CompItem) {
            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length < 2) {
                alert('Please select at least two layers.');
            } else {
                for (var i = 0; i < selectedLayers.length; i++) {
                    var layer = selectedLayers[i];
                    var frameDuration = comp.frameDuration;
                    var cascadeDelay;
    
                    if (exponential) {
                        cascadeDelay = Math.pow(i, 2) * numFrames * frameDuration;
                    } else {
                        cascadeDelay = i * numFrames * frameDuration;
                    }
                    layer.startTime += cascadeDelay;
                }
            }
        } else {
            alert('Please select a composition first.');
        }
        app.endUndoGroup();
    }

    // Layer Alignment Functionality
    function alignLayers() {
        app.beginUndoGroup('Layer Align');
        var comp = app.project.activeItem;
        if (comp && comp instanceof CompItem) {
            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length < 2) {
                alert('Please select at least two layers.');
            } else {
                for (var i = 0; i < selectedLayers.length; i++) {
                    var layer = selectedLayers[i];
                    layer.startTime = 0;
                }
            }
        } else {
            alert('Please select a composition first.');
        }
        app.endUndoGroup();
    }
     
    // Duplicate Layer Functionality
    function duplicateSelectedLayers(numDuplicates) {
        app.beginUndoGroup('Duplicate Layers');
        var comp = app.project.activeItem;
        if (comp && comp instanceof CompItem) {
            var selectedLayers = comp.selectedLayers.slice(0);
            if (selectedLayers.length < 1) {
                alert('Please select at least one layer.');
            } else {
                for (var i = 0; i < selectedLayers.length; i++) {
                    var layer = selectedLayers[i];
                    for (var j = 0; j < numDuplicates; j++) {
                        var duplicatedLayer = layer.duplicate();
                        duplicatedLayer.moveAfter(layer);
                    }
                }
            }
        } else {
            alert('Please select a composition first.');
        }
        app.endUndoGroup();
    }
    
    // New Null Controller Functionality
    function createNewNullController() {
        var activeItem = app.project.activeItem;
        var selectedLayers = activeItem.selectedLayers;
        app.beginUndoGroup("New Null Controller");

        var nullController = activeItem.layers.addNull();
        nullController.name = "Null Controller";
        nullController.moveToBeginning();
        nullController.position.setValue([activeItem.width / 2, activeItem.height / 2]);

        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            layer.parent = nullController;
        }

        app.endUndoGroup();
    }

    createUI(thisObj);
}

var myScriptPal = RAO_Master_Script_Pack(this);
if (myScriptPal != null && !(myScriptPal instanceof Panel)) {
    myScriptPal.center();
    myScriptPal.show();
}
