{
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Please select an active composition.");
    } else {
        // Create main UI panel
        var win = (this instanceof Panel) ? this : new Window("palette", "Circular Motion Setup", undefined, {resizeable: true});
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];

        // Global variables
        var masterLayer = null;
        var animMode = "Multiple Layers"; // or "Single Shape Layer"
        var ctrlSource = "Existing"; // or "New"

        // Animation Mode Radio Group
        var modeGrp = win.add("group", undefined);
        modeGrp.orientation = "row";
        modeGrp.add("statictext", undefined, "Animation Mode:");
        var modeMulti = modeGrp.add("radiobutton", undefined, "Multiple Layers");
        var modeShape = modeGrp.add("radiobutton", undefined, "Single Shape Layer");
        modeMulti.value = true;
        modeMulti.onClick = function() { animMode = "Multiple Layers"; };
        modeShape.onClick = function() { animMode = "Single Shape Layer"; };

        // Control Layer Source Radio Group
        var ctrlGrp = win.add("group", undefined);
        ctrlGrp.orientation = "row";
        ctrlGrp.add("statictext", undefined, "Control Layer:");
        var ctrlExisting = ctrlGrp.add("radiobutton", undefined, "Existing");
        var ctrlNew = ctrlGrp.add("radiobutton", undefined, "New");
        ctrlExisting.value = true;
        ctrlExisting.onClick = function() { ctrlSource = "Existing"; };
        ctrlNew.onClick = function() { ctrlSource = "New"; };

        // Combined Button: Setup Master + Apply Expressions
        var createAnimBtn = win.add("button", undefined, "Create Animation");
        createAnimBtn.onClick = function () {
            app.beginUndoGroup("Create Circular Motion Animation");
            // --- SELECT OR CREATE CONTROL LAYER ---
            if (ctrlSource === "Existing") {
                // Open a popup to select a control layer from updated list
                var ctrlDlg = new Window("dialog", "Select Control Layer");
                ctrlDlg.orientation = "column";
                ctrlDlg.alignChildren = ["fill", "top"];
                ctrlDlg.add("statictext", undefined, "Select the Control Layer:");
                var dropdown = ctrlDlg.add("dropdownlist", undefined, getAllLayerNames());
                dropdown.selection = 0;
                var okBtn = ctrlDlg.add("button", undefined, "OK");
                if (ctrlDlg.show() != 1) {
                    app.endUndoGroup();
                    return;
                }
                var selName = dropdown.selection.text;
                masterLayer = comp.layer(selName);
            } else {
                // Create a new control layer as an empty shape layer
                masterLayer = comp.layers.addShape();
                masterLayer.name = "CTRL Circular Motion";
                masterLayer.guideLayer = true;
                masterLayer.label = 10; // Fuchsia; may vary by AE version
                // Set duration to the longest duration among selected layers
                var selLayers = comp.selectedLayers;
                var maxOut = 0;
                for (var i = 0; i < selLayers.length; i++) {
                    if (selLayers[i].outPoint > maxOut) { maxOut = selLayers[i].outPoint; }
                }
                if (maxOut > masterLayer.outPoint) { masterLayer.outPoint = maxOut; }
                // Move the new control layer directly above the top selected layer
                var topIndex = comp.numLayers + 1;
                for (var i = 0; i < selLayers.length; i++) {
                    if (selLayers[i].index < topIndex) { topIndex = selLayers[i].index; }
                }
                masterLayer.moveBefore(comp.layer(topIndex));
            }

            // --- SETUP MASTER CONTROLS (if not already present) ---
            var masterEffects = masterLayer.property("ADBE Effect Parade");
            if (!masterEffects.property("Radius") || !masterEffects.property("Progress") || 
                !masterEffects.property("Spins") || !masterEffects.property("Layers") || 
                !masterEffects.property("Delay")) {
                addSlider(masterLayer, "Radius", 200);
                addSlider(masterLayer, "Progress", 0);
                addSlider(masterLayer, "Spins", 1);
                addSlider(masterLayer, "Layers", 0); // updated later
                addSlider(masterLayer, "Delay", 0);
            }
            // --- APPLY EXPRESSIONS BASED ON ANIMATION MODE ---
            if (animMode === "Multiple Layers") {
                // Get controlled layers: use selected layers excluding the master.
                var selLayers = comp.selectedLayers;
                var controlledLayers = [];
                for (var j = 0; j < selLayers.length; j++) {
                    if (selLayers[j] !== masterLayer) { controlledLayers.push(selLayers[j]); }
                }
                // If none selected, fallback to all layers except master.
                if (controlledLayers.length === 0) {
                    for (var j = 1; j <= comp.numLayers; j++) {
                        var lyr = comp.layer(j);
                        if (lyr !== masterLayer) { controlledLayers.push(lyr); }
                    }
                }
                addSlider(masterLayer, "Layers", controlledLayers.length);
                for (var k = 0; k < controlledLayers.length; k++) {
                    var lyr = controlledLayers[k];
                    // Add "Add to Circular Motion" checkbox if needed.
                    var chk = lyr.property("ADBE Effect Parade").property("Add to Circular Motion");
                    if (!chk) {
                        chk = lyr.Effects.addProperty("ADBE Checkbox Control");
                        chk.name = "Add to Circular Motion";
                        chk.property("ADBE Checkbox Control-0001").setValue(1);
                    }
                    // Record original position as 2D.
                    var posVal = lyr.property("Position").value;
                    if (posVal instanceof Array && posVal.length > 2) { posVal = [posVal[0], posVal[1]]; }
                    addPointControl(lyr, "Original Position", posVal);
                    // Create order slider on master: "Order of [layer name]"
                    var orderName = "Order of " + lyr.name;
                    var orderSlider = masterLayer.property("ADBE Effect Parade").property(orderName);
                    if (!orderSlider) {
                        orderSlider = masterLayer.Effects.addProperty("ADBE Slider Control");
                        orderSlider.name = orderName;
                    }
                    orderSlider.property("ADBE Slider Control-0001").setValue(k + 1);
                    // Build expression for layer's Position.
                    var expr = ""
                        + "var master = thisComp.layer(\"" + masterLayer.name + "\");\n"
                        + "var radius = master.effect(\"Radius\")(\"Slider\");\n"
                        + "var progress = master.effect(\"Progress\")(\"Slider\")/100;\n"
                        + "var spins = master.effect(\"Spins\")(\"Slider\");\n"
                        + "var total = master.effect(\"Layers\")(\"Slider\");\n"
                        + "var order = master.effect(\"" + orderName + "\")(\"Slider\");\n"
                        + "if(total < 1) total = 1;\n"
                        + "var offsetAngle = (order - 1) * (360 / total);\n"
                        + "var angle = progress * 360 * spins + offsetAngle;\n"
                        + "var finalPos = master.position + [Math.cos(degreesToRadians(angle))*radius, Math.sin(degreesToRadians(angle))*radius];\n"
                        + "var origPos = effect(\"Original Position\")(\"Point\");\n"
                        + "var delay = master.effect(\"Delay\")(\"Slider\")/100;\n"
                        + "if (effect(\"Add to Circular Motion\")(\"Checkbox\") == 1) {\n"
                        + "    linear(delay, 0, 1, origPos, finalPos);\n"
                        + "} else {\n"
                        + "    origPos;\n"
                        + "}";
                    lyr.property("Position").expression = expr;
                }
            } else if (animMode === "Single Shape Layer") {
                // In Single Shape Layer mode, assume the selected shape layer is the one to animate.
                var shapeLayer = null;
                // Find a shape layer from selected layers that's not the master.
                var selLayers = comp.selectedLayers;
                for (var i = 0; i < selLayers.length; i++) {
                    if (selLayers[i] !== masterLayer && selLayers[i] instanceof ShapeLayer) {
                        shapeLayer = selLayers[i];
                        break;
                    }
                }
                if (!shapeLayer || !(shapeLayer instanceof ShapeLayer)) {
                    alert("No valid shape layer found for Single Shape Layer mode.");
                    app.endUndoGroup();
                    return;
                }
                var contents = shapeLayer.property("ADBE Root Vectors Group");
                if (!contents) {
                    alert("No shape groups found in " + shapeLayer.name);
                    app.endUndoGroup();
                    return;
                }
                var numGroups = contents.numProperties;
                addSlider(masterLayer, "Layers", numGroups);
                for (var g = 1; g <= numGroups; g++) {
                    var group = contents.property(g);
                    // Process only if the group is a vector group
                    if (group.matchName !== "ADBE Vector Group") {
                        continue;
                    }
                    var transformGroup = group.property("ADBE Transform Group");
                    if (!transformGroup) {
                        continue;
                    }
                    var grpPos = transformGroup.property("ADBE Position");
                    if (!grpPos) {
                        continue;
                    }
                    var origPos = grpPos.value;
                    if (origPos instanceof Array && origPos.length > 2) { origPos = [origPos[0], origPos[1]]; }
                    var origPosStr = "[" + origPos[0].toFixed(2) + ", " + origPos[1].toFixed(2) + "]";
                    var orderName = "Order of " + group.name;
                    var orderSlider = masterLayer.property("ADBE Effect Parade").property(orderName);
                    if (!orderSlider) {
                        orderSlider = masterLayer.Effects.addProperty("ADBE Slider Control");
                        orderSlider.name = orderName;
                    }
                    orderSlider.property("ADBE Slider Control-0001").setValue(g);
                    var exprGroup = ""
                        + "var master = thisComp.layer(\"" + masterLayer.name + "\");\n"
                        + "var radius = master.effect(\"Radius\")(\"Slider\");\n"
                        + "var progress = master.effect(\"Progress\")(\"Slider\")/100;\n"
                        + "var spins = master.effect(\"Spins\")(\"Slider\");\n"
                        + "var total = master.effect(\"Layers\")(\"Slider\");\n"
                        + "var order = master.effect(\"" + orderName + "\")(\"Slider\");\n"
                        + "if(total < 1) total = 1;\n"
                        + "var offsetAngle = (order - 1) * (360 / total);\n"
                        + "var angle = progress * 360 * spins + offsetAngle;\n"
                        + "var finalPos = master.position + [Math.cos(degreesToRadians(angle))*radius, Math.sin(degreesToRadians(angle))*radius];\n"
                        + "var delay = master.effect(\"Delay\")(\"Slider\")/100;\n"
                        + "linear(delay, 0, 1, " + origPosStr + ", finalPos);";
                    grpPos.expression = exprGroup;
                }
            }
            alert("Animation creation complete.");
            app.endUndoGroup();
        };

        win.layout.layout(true);
        if (win instanceof Window) {
            win.center();
            win.show();
        }

        // --- Helper Functions ---
        function addSlider(layer, sliderName, initVal) {
            var ef = layer.property("ADBE Effect Parade").property(sliderName);
            if (!ef) {
                ef = layer.Effects.addProperty("ADBE Slider Control");
                ef.name = sliderName;
            }
            ef.property("ADBE Slider Control-0001").setValue(initVal);
            return ef;
        }
        function addPointControl(layer, controlName, initVal) {
            var ef = layer.property("ADBE Effect Parade").property(controlName);
            if (!ef) {
                ef = layer.Effects.addProperty("ADBE Point Control");
                ef.name = controlName;
            }
            ef.property("ADBE Point Control-0001").setValue(initVal);
            return ef;
        }
    }
}