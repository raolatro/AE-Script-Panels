// ApplyExpressionsUIWithControlLayerCreation.jsx
// After Effects script to apply expressions to selected layers with a responsive UI panel
// Includes a section to create control layers with matching settings
// The panel is organized into collapsible sections and is responsive to its size

(function applyExpressionsUIWithControlLayerCreation(thisObj) {
    // Function to create the UI
    function buildUI(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Apply Expressions", undefined, {resizeable: true});
        
        // Main container
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 10;
        win.margins = 16;
        
        // Collapsible Panel for Control Layer Creation
        var controlPanel = win.add("panel", undefined, "Create Control Layer");
        controlPanel.orientation = "column";
        controlPanel.alignChildren = ["fill", "top"];
        controlPanel.spacing = 5;
        controlPanel.margins = [10, 20, 10, 10];
        controlPanel.expanded = true;
        
        // Property Selection Group
        var propertyGroup = controlPanel.add("group");
        propertyGroup.orientation = "row";
        propertyGroup.alignChildren = ["left", "center"];
        propertyGroup.spacing = 5;
        
        propertyGroup.add("statictext", undefined, "Property:");
        var properties = ["Position", "X Position", "Y Position", "Z Position", "Rotation", "X Rotation", "Y Rotation", "Z Rotation", "Scale", "Opacity"];
        var propertyDropdown = propertyGroup.add("dropdownlist", undefined, properties);
        propertyDropdown.selection = 0; // Initialize selection to the first item
        
        // Create Control Layer Button
        var createControlBtn = controlPanel.add("button", undefined, "Create Control Layer");
        
        // Delay Input Group
        var delayGroup = win.add("group");
        delayGroup.orientation = "row";
        delayGroup.alignChildren = ["left", "center"];
        delayGroup.add("statictext", undefined, "Delay between layers (seconds):");
        var delayInput = delayGroup.add("edittext", undefined, "0");
        delayInput.characters = 5;
        
        // Overlap Input Group
        var overlapGroup = win.add("group");
        overlapGroup.orientation = "row";
        overlapGroup.alignChildren = ["left", "center"];
        overlapGroup.add("statictext", undefined, "Overlap between layers (seconds):");
        var overlapInput = overlapGroup.add("edittext", undefined, "0");
        overlapInput.characters = 5;
        
        // Apply At Group
        var applyAtGroup = win.add("group");
        applyAtGroup.orientation = "row";
        applyAtGroup.alignChildren = ["left", "center"];
        applyAtGroup.add("statictext", undefined, "Apply animation at:");
        var inRadio = applyAtGroup.add("radiobutton", undefined, "IN");
        var outRadio = applyAtGroup.add("radiobutton", undefined, "OUT");
        inRadio.value = true; // Default to IN
        
        // Category: Transform Properties
        var transformGroup = win.add("panel", undefined, "Transform Properties");
        transformGroup.orientation = "column";
        transformGroup.alignChildren = ["fill", "top"];
        transformGroup.spacing = 5;
        transformGroup.margins = 10;
        
        // Position Buttons Group
        var positionGroup = transformGroup.add("group");
        positionGroup.orientation = "row";
        positionGroup.alignChildren = ["fill", "center"];
        positionGroup.spacing = 5;
        
        var positionBtn = positionGroup.add("button", undefined, "Position");
        var xPosBtn = positionGroup.add("button", undefined, "X");
        var yPosBtn = positionGroup.add("button", undefined, "Y");
        var zPosBtn = positionGroup.add("button", undefined, "Z");
        
        // Rotation Buttons Group
        var rotationGroup = transformGroup.add("group");
        rotationGroup.orientation = "row";
        rotationGroup.alignChildren = ["fill", "center"];
        rotationGroup.spacing = 5;
        
        var rotationBtn = rotationGroup.add("button", undefined, "Rotation");
        var xRotBtn = rotationGroup.add("button", undefined, "X");
        var yRotBtn = rotationGroup.add("button", undefined, "Y");
        var zRotBtn = rotationGroup.add("button", undefined, "Z");
        
        // Other Transform Buttons
        var scaleBtn = transformGroup.add("button", undefined, "Scale");
        var opacityBtn = transformGroup.add("button", undefined, "Opacity");
        
        // Separate Dimensions Toggle Button
        var separateDimsBtn = win.add("button", undefined, "Toggle Separate Dimensions");
        
        // Event handlers for control panel
        createControlBtn.onClick = function() {
            if (!propertyDropdown.selection) {
                propertyDropdown.selection = 0; // Ensure a selection is made
            }
            createControlLayer(propertyDropdown.selection.text);
        };
        
        // Event handlers for expression panel
        positionBtn.onClick = function() {
            applyExpressionToProperty("Position", positionExpression, "ADBE Position", parseFloat(delayInput.text) || 0, parseFloat(overlapInput.text) || 0, inRadio.value ? "IN" : "OUT");
        };
        
        xPosBtn.onClick = function() {
            applyExpressionToProperty("X Position", xPositionExpression, "ADBE Position_0", parseFloat(delayInput.text) || 0, parseFloat(overlapInput.text) || 0, inRadio.value ? "IN" : "OUT");
        };
        
        yPosBtn.onClick = function() {
            applyExpressionToProperty("Y Position", yPositionExpression, "ADBE Position_1", parseFloat(delayInput.text) || 0, parseFloat(overlapInput.text) || 0, inRadio.value ? "IN" : "OUT");
        };
        
        zPosBtn.onClick = function() {
            applyExpressionToProperty("Z Position", zPositionExpression, "ADBE Position_2", parseFloat(delayInput.text) || 0, parseFloat(overlapInput.text) || 0, inRadio.value ? "IN" : "OUT");
        };
        
        rotationBtn.onClick = function() {
            applyExpressionToProperty("Rotation", rotationExpression, "ADBE Rotate Z", parseFloat(delayInput.text) || 0, parseFloat(overlapInput.text) || 0, inRadio.value ? "IN" : "OUT");
        };
        
        xRotBtn.onClick = function() {
            applyExpressionToProperty("X Rotation", xRotationExpression, "ADBE Rotate X", parseFloat(delayInput.text) || 0, parseFloat(overlapInput.text) || 0, inRadio.value ? "IN" : "OUT");
        };
        
        yRotBtn.onClick = function() {
            applyExpressionToProperty("Y Rotation", yRotationExpression, "ADBE Rotate Y", parseFloat(delayInput.text) || 0, parseFloat(overlapInput.text) || 0, inRadio.value ? "IN" : "OUT");
        };
        
        zRotBtn.onClick = function() {
            applyExpressionToProperty("Z Rotation", zRotationExpression, "ADBE Rotate Z", parseFloat(delayInput.text) || 0, parseFloat(overlapInput.text) || 0, inRadio.value ? "IN" : "OUT");
        };
        
        scaleBtn.onClick = function() {
            applyExpressionToProperty("Scale", scaleExpression, "ADBE Scale", parseFloat(delayInput.text) || 0, parseFloat(overlapInput.text) || 0, inRadio.value ? "IN" : "OUT");
        };
        
        opacityBtn.onClick = function() {
            applyExpressionToProperty("Opacity", opacityExpression, "ADBE Opacity", parseFloat(delayInput.text) || 0, parseFloat(overlapInput.text) || 0, inRadio.value ? "IN" : "OUT");
        };
        
        // Separate Dimensions Toggle Button Event Handler
        separateDimsBtn.onClick = function() {
            toggleSeparateDimensions();
        };
        
        // Make the UI responsive
        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function() {
            this.layout.resize();
        };
        
        return win;
    }
    
    // Function to create control layer
    function createControlLayer(selectedProperty) {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }
    
        if (!selectedProperty) {
            alert("Please select a property to create a control layer.");
            return;
        }
    
        var selectedLayers = comp.selectedLayers;
        var insertIndex = selectedLayers.length > 0 ? selectedLayers[0].index : 1;
    
        // Determine inPoint and outPoint from selected layers
        var inPoint, outPoint;
        if (selectedLayers.length > 0) {
            inPoint = selectedLayers[0].inPoint;
            outPoint = selectedLayers[0].outPoint;
        } else {
            inPoint = comp.time;
            outPoint = comp.duration;
        }
    
        // Ensure outPoint is greater than inPoint
        if (outPoint <= inPoint) {
            alert("Selected layer's Out Point must be greater than In Point.");
            return;
        }
    
        app.beginUndoGroup("Create Control Layer");
    
        // Handle duplicate names by adding a number if necessary
        var controlLayerNameBase = "CTRL " + selectedProperty;
        var controlLayerName = controlLayerNameBase;
        var nameIndex = 2;
        while (comp.layer(controlLayerName) != null) {
            controlLayerName = controlLayerNameBase + " " + nameIndex;
            nameIndex++;
        }
    
        // Create a shape layer with a rectangle outline only
        var controlLayer = comp.layers.addShape();
        controlLayer.name = controlLayerName;
        controlLayer.moveBefore(comp.layer(insertIndex));
        controlLayer.guideLayer = true;
        controlLayer.label = 13; // Fuchsia color label
        controlLayer.inPoint = inPoint;
        controlLayer.outPoint = outPoint;
    
        // Add a rectangle path
        var contents = controlLayer.property("ADBE Root Vectors Group");
        var rectGroup = contents.addProperty("ADBE Vector Group");
        rectGroup.name = "Rectangle";
    
        var rectPath = rectGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
        rectPath.property("Size").setValue([100, 100]);
    
        // Remove fill if any
        var fill = rectGroup.property("ADBE Vectors Group").property("ADBE Vector Graphic - Fill");
        if (fill) rectGroup.property("ADBE Vectors Group").remove(fill);
    
        // Add stroke
        var stroke = rectGroup.property("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
        stroke.property("ADBE Vector Stroke Width").setValue(1);
        stroke.property("ADBE Vector Stroke Color").setValue([1, 0, 1]); // Fuchsia color
    
        // Set 3D layer if needed
        if (selectedProperty.indexOf("Z") !== -1 || selectedProperty.indexOf("Rotation") !== -1) {
            controlLayer.threeDLayer = true;
        }
    
        // Match Separate Dimensions setting with selected layer
        var controlTransform = controlLayer.property("ADBE Transform Group");
        var controlPositionProp = controlTransform.property("ADBE Position");
    
        if (selectedLayers.length > 0) {
            var selectedLayer = selectedLayers[0];
            var selectedPositionProp = selectedLayer.property("ADBE Transform Group").property("ADBE Position");
    
            if (selectedPositionProp && controlPositionProp) {
                controlPositionProp.dimensionsSeparated = selectedPositionProp.dimensionsSeparated;
            }
        }
    
        // Separate dimensions if needed for certain properties
        if (selectedProperty === "X Position" || selectedProperty === "Y Position" || selectedProperty === "Z Position") {
            if (!controlPositionProp.dimensionsSeparated) {
                controlPositionProp.dimensionsSeparated = true;
            }
        }
    
        app.endUndoGroup();
    }
    
    // Rest of your existing code remains the same (functions for applying expressions, etc.)
    
    // Function to get control layers (Guide Layers with keyframes on specified property)
    function getControlLayers(comp, propertyMatchName) {
        var controlLayers = [];
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            if (layer.guideLayer) {
                // Check if the layer has keyframes on the specified property
                var hasKeyframes = false;
                var transformGroup = layer.property("ADBE Transform Group");
                if (transformGroup) {
                    var prop = transformGroup.property(propertyMatchName);
                    if (prop && prop.numKeys > 0) {
                        hasKeyframes = true;
                    }
                }
                if (hasKeyframes) {
                    controlLayers.push(layer.name);
                }
            }
        }
        return controlLayers;
    }
    
    // Function to select control layer from dropdown
    function selectControlLayer(comp, propertyMatchName) {
        var controlLayers = getControlLayers(comp, propertyMatchName);
        if (controlLayers.length == 0) {
            alert("No eligible control layers found with keyframes on the selected property. Please ensure there are guide layers with keyframes on the desired property.");
            return null;
        }
        var dialog = new Window("dialog", "Select Control Layer");
        dialog.orientation = "column";
        dialog.alignChildren = ["fill", "top"];
        dialog.spacing = 10;
        dialog.margins = 16;
    
        dialog.add("statictext", undefined, "Select a control layer:");
        var controlLayerDropdown = dialog.add("dropdownlist", undefined, controlLayers);
        controlLayerDropdown.selection = 0;
    
        var btnGroup = dialog.add("group");
        btnGroup.orientation = "row";
        btnGroup.alignChildren = ["fill", "center"];
        var okBtn = btnGroup.add("button", undefined, "OK");
        var cancelBtn = btnGroup.add("button", undefined, "Cancel");
    
        var result = null;
        okBtn.onClick = function() {
            if (controlLayerDropdown.selection) {
                result = controlLayerDropdown.selection.text;
                dialog.close();
            } else {
                alert("Please select a control layer.");
            }
        };
        cancelBtn.onClick = function() {
            dialog.close();
        };
    
        dialog.show();
    
        return result;
    }
    
    // Function to prompt for control layer and apply the expression
    function applyExpressionToProperty(displayName, expressionFunction, propertyMatchName, layerDelay, overlap, applyAt) {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }
        var controlLayerName = selectControlLayer(comp, propertyMatchName);
        if (controlLayerName == null) {
            return;
        }
        var controlLayer = comp.layer(controlLayerName);
        if (!controlLayer) {
            alert("Control layer '" + controlLayerName + "' not found.");
            return;
        }
    
        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) {
            alert("Please select at least one layer.");
            return;
        }
        
        // Sort selected layers by layer index (descending) to start from the bottom layer
        selectedLayers.sort(function(a, b) {
            return b.index - a.index;
        });
        
        // Adjust the delay per layer to account for overlap
        var adjustedDelay = layerDelay - overlap;
        if (adjustedDelay < 0) adjustedDelay = 0;
        
        app.beginUndoGroup("Apply " + displayName + " Expression");
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            var delay = adjustedDelay * i; // Calculate delay based on sequence
            expressionFunction(layer, controlLayerName, delay, applyAt);
        }
        app.endUndoGroup();
    }
    
    // Updated Expression functions for Position
    function positionExpression(layer, controlLayerName, delay, applyAt) {
        var expr =
        "// Reference the control layer\n" +
        "var ctrlLayer = thisComp.layer(\"" + controlLayerName + "\");\n" +
        "var tDelay = " + delay.toFixed(3) + ";\n" +
        "var tOffset = " + (applyAt === "IN" ? "inPoint" : "outPoint") + ";\n" +
        "var t = time - tOffset - tDelay;\n" +
        "var ctrlPos = ctrlLayer.transform.position.valueAtTime(ctrlLayer.inPoint + t);\n" +
        "var startCtrlPos = ctrlLayer.transform.position.valueAtTime(ctrlLayer.inPoint);\n" +
        "var delta = ctrlPos - startCtrlPos;\n" +
        "value + delta;";
        layer.property("Position").expression = expr;
    }
    
    function xPositionExpression(layer, controlLayerName, delay, applyAt) {
        var positionProp = layer.property("ADBE Transform Group").property("ADBE Position");
        if (!positionProp.dimensionsSeparated) {
            alert("Please separate dimensions on the selected layers to use X Position.");
            return;
        }
        var expr =
        "// Reference the control layer\n" +
        "var ctrlLayer = thisComp.layer(\"" + controlLayerName + "\");\n" +
        "var tDelay = " + delay.toFixed(3) + ";\n" +
        "var tOffset = " + (applyAt === "IN" ? "inPoint" : "outPoint") + ";\n" +
        "var t = time - tOffset - tDelay;\n" +
        "var ctrlPos = ctrlLayer.transform.xPosition.valueAtTime(ctrlLayer.inPoint + t);\n" +
        "var startCtrlPos = ctrlLayer.transform.xPosition.valueAtTime(ctrlLayer.inPoint);\n" +
        "var delta = ctrlPos - startCtrlPos;\n" +
        "value + delta;";
        layer.transform.xPosition.expression = expr;
    }
    
    function yPositionExpression(layer, controlLayerName, delay, applyAt) {
        var positionProp = layer.property("ADBE Transform Group").property("ADBE Position");
        if (!positionProp.dimensionsSeparated) {
            alert("Please separate dimensions on the selected layers to use Y Position.");
            return;
        }
        var expr =
        "// Reference the control layer\n" +
        "var ctrlLayer = thisComp.layer(\"" + controlLayerName + "\");\n" +
        "var tDelay = " + delay.toFixed(3) + ";\n" +
        "var tOffset = " + (applyAt === "IN" ? "inPoint" : "outPoint") + ";\n" +
        "var t = time - tOffset - tDelay;\n" +
        "var ctrlPos = ctrlLayer.transform.yPosition.valueAtTime(ctrlLayer.inPoint + t);\n" +
        "var startCtrlPos = ctrlLayer.transform.yPosition.valueAtTime(ctrlLayer.inPoint);\n" +
        "var delta = ctrlPos - startCtrlPos;\n" +
        "value + delta;";
        layer.transform.yPosition.expression = expr;
    }
    
    function zPositionExpression(layer, controlLayerName, delay, applyAt) {
        if (!layer.threeDLayer) {
            alert("Z Position is only available on 3D layers.");
            return;
        }
        var positionProp = layer.property("ADBE Transform Group").property("ADBE Position");
        if (!positionProp.dimensionsSeparated) {
            alert("Please separate dimensions on the selected layers to use Z Position.");
            return;
        }
        var expr =
        "// Reference the control layer\n" +
        "var ctrlLayer = thisComp.layer(\"" + controlLayerName + "\");\n" +
        "var tDelay = " + delay.toFixed(3) + ";\n" +
        "var tOffset = " + (applyAt === "IN" ? "inPoint" : "outPoint") + ";\n" +
        "var t = time - tOffset - tDelay;\n" +
        "var ctrlPos = ctrlLayer.transform.zPosition.valueAtTime(ctrlLayer.inPoint + t);\n" +
        "var startCtrlPos = ctrlLayer.transform.zPosition.valueAtTime(ctrlLayer.inPoint);\n" +
        "var delta = ctrlPos - startCtrlPos;\n" +
        "value + delta;";
        layer.transform.zPosition.expression = expr;
    }
    
    // Updated Expression functions for Rotation
    function rotationExpression(layer, controlLayerName, delay, applyAt) {
        var rotationProp = layer.property("ADBE Transform Group").property("ADBE Rotate Z");
        var expr =
        "// Reference the control layer\n" +
        "var ctrlLayer = thisComp.layer(\"" + controlLayerName + "\");\n" +
        "var tDelay = " + delay.toFixed(3) + ";\n" +
        "var tOffset = " + (applyAt === "IN" ? "inPoint" : "outPoint") + ";\n" +
        "var t = time - tOffset - tDelay;\n" +
        "var ctrlRot = ctrlLayer.transform.rotation.valueAtTime(ctrlLayer.inPoint + t);\n" +
        "var startCtrlRot = ctrlLayer.transform.rotation.valueAtTime(ctrlLayer.inPoint);\n" +
        "var delta = ctrlRot - startCtrlRot;\n" +
        "value + delta;";
        rotationProp.expression = expr;
    }
    
    function xRotationExpression(layer, controlLayerName, delay, applyAt) {
        if (!layer.threeDLayer) {
            alert("X Rotation is only available on 3D layers.");
            return;
        }
        var rotationProp = layer.property("ADBE Transform Group").property("ADBE Rotate X");
        var expr =
        "// Reference the control layer\n" +
        "var ctrlLayer = thisComp.layer(\"" + controlLayerName + "\");\n" +
        "var tDelay = " + delay.toFixed(3) + ";\n" +
        "var tOffset = " + (applyAt === "IN" ? "inPoint" : "outPoint") + ";\n" +
        "var t = time - tOffset - tDelay;\n" +
        "var ctrlRot = ctrlLayer.transform.xRotation.valueAtTime(ctrlLayer.inPoint + t);\n" +
        "var startCtrlRot = ctrlLayer.transform.xRotation.valueAtTime(ctrlLayer.inPoint);\n" +
        "var delta = ctrlRot - startCtrlRot;\n" +
        "value + delta;";
        rotationProp.expression = expr;
    }
    
    function yRotationExpression(layer, controlLayerName, delay, applyAt) {
        if (!layer.threeDLayer) {
            alert("Y Rotation is only available on 3D layers.");
            return;
        }
        var rotationProp = layer.property("ADBE Transform Group").property("ADBE Rotate Y");
        var expr =
        "// Reference the control layer\n" +
        "var ctrlLayer = thisComp.layer(\"" + controlLayerName + "\");\n" +
        "var tDelay = " + delay.toFixed(3) + ";\n" +
        "var tOffset = " + (applyAt === "IN" ? "inPoint" : "outPoint") + ";\n" +
        "var t = time - tOffset - tDelay;\n" +
        "var ctrlRot = ctrlLayer.transform.yRotation.valueAtTime(ctrlLayer.inPoint + t);\n" +
        "var startCtrlRot = ctrlLayer.transform.yRotation.valueAtTime(ctrlLayer.inPoint);\n" +
        "var delta = ctrlRot - startCtrlRot;\n" +
        "value + delta;";
        rotationProp.expression = expr;
    }
    
    function zRotationExpression(layer, controlLayerName, delay, applyAt) {
        var rotationProp = layer.property("ADBE Transform Group").property("ADBE Rotate Z");
        var expr =
        "// Reference the control layer\n" +
        "var ctrlLayer = thisComp.layer(\"" + controlLayerName + "\");\n" +
        "var tDelay = " + delay.toFixed(3) + ";\n" +
        "var tOffset = " + (applyAt === "IN" ? "inPoint" : "outPoint") + ";\n" +
        "var t = time - tOffset - tDelay;\n" +
        "var ctrlRot = ctrlLayer.transform.zRotation.valueAtTime(ctrlLayer.inPoint + t);\n" +
        "var startCtrlRot = ctrlLayer.transform.zRotation.valueAtTime(ctrlLayer.inPoint);\n" +
        "var delta = ctrlRot - startCtrlRot;\n" +
        "value + delta;";
        rotationProp.expression = expr;
    }
    
    // Updated Expression functions for Scale
    function scaleExpression(layer, controlLayerName, delay, applyAt) {
        var expr =
        "// Reference the control layer\n" +
        "var ctrlLayer = thisComp.layer(\"" + controlLayerName + "\");\n" +
        "var tDelay = " + delay.toFixed(3) + ";\n" +
        "var tOffset = " + (applyAt === "IN" ? "inPoint" : "outPoint") + ";\n" +
        "var t = time - tOffset - tDelay;\n" +
        "var ctrlScale = ctrlLayer.transform.scale.valueAtTime(ctrlLayer.inPoint + t);\n" +
        "var startCtrlScale = ctrlLayer.transform.scale.valueAtTime(ctrlLayer.inPoint);\n" +
        "var delta = ctrlScale - startCtrlScale;\n" +
        "value + delta;";
        layer.property("Scale").expression = expr;
    }
    
    // Updated Expression function for Opacity
    function opacityExpression(layer, controlLayerName, delay, applyAt) {
        var expr =
        "// Reference the control layer\n" +
        "var ctrlLayer = thisComp.layer(\"" + controlLayerName + "\");\n" +
        "var tDelay = " + delay.toFixed(3) + ";\n" +
        "var tOffset = " + (applyAt === "IN" ? "inPoint" : "outPoint") + ";\n" +
        "var t = time - tOffset - tDelay;\n" +
        "var ctrlOpacity = ctrlLayer.transform.opacity.valueAtTime(ctrlLayer.inPoint + t);\n" +
        "var startCtrlOpacity = ctrlLayer.transform.opacity.valueAtTime(ctrlLayer.inPoint);\n" +
        "var delta = ctrlOpacity - startCtrlOpacity;\n" +
        "value + delta;";
        layer.property("Opacity").expression = expr;
    }
    
    // Function to toggle Separate Dimensions
    function toggleSeparateDimensions() {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }
        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) {
            alert("Please select at least one layer.");
            return;
        }
        app.beginUndoGroup("Toggle Separate Dimensions");
        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            var positionProp = layer.property("ADBE Transform Group").property("ADBE Position");
            if (positionProp) {
                positionProp.dimensionsSeparated = !positionProp.dimensionsSeparated;
            }
        }
        app.endUndoGroup();
    }
    
    // Build and display the UI
    var myUI = buildUI(thisObj);
    if (myUI instanceof Window) {
        myUI.center();
        myUI.show();
    } else {
        myUI.layout.layout(true);
    }
})(this);