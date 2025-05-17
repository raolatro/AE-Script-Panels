{
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
        alert("Please select an active composition.");
    } else {
        var win = (this instanceof Panel) ? this : new Window("palette", "Circular Motion Setup", undefined, {resizeable:true});
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        
        var createBtn = win.add("button", undefined, "Create Circular Motion");
        
        createBtn.onClick = function() {
            app.beginUndoGroup("Create Circular Motion");
            
            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length < 1) {
                alert("Please select at least one layer for circular motion.");
                return;
            }
            
            // Prompt for the master control layer
            var layerList = [];
            for (var i = 1; i <= comp.numLayers; i++) {
                layerList.push(comp.layer(i).name);
            }
            var dlg = new Window("dialog", "Select Master Control Layer");
            dlg.orientation = "column";
            dlg.add("statictext", undefined, "Select the Master Control Layer:");
            var dropdown = dlg.add("dropdownlist", undefined, layerList);
            dropdown.selection = 0;
            dlg.add("button", undefined, "OK");
            if (dlg.show() != 1) { return; }
            
            var masterLayerName = dropdown.selection.text;
            var masterLayer = comp.layer(masterLayerName);
            if (!masterLayer) {
                alert("Master control layer not found.");
                return;
            }
            
            // Function to add a slider control if not already present
            function addSlider(layer, sliderName, initVal) {
                var ef = layer.property("ADBE Effect Parade").property(sliderName);
                if (!ef) {
                    ef = layer.Effects.addProperty("ADBE Slider Control");
                    ef.name = sliderName;
                    ef.property("ADBE Slider Control-0001").setValue(initVal);
                }
                return ef;
            }
            
            // Add master controls: Radius, Progress, and Number of Layers.
            addSlider(masterLayer, "Radius", 200);
            addSlider(masterLayer, "Progress", 0);
            // Set Number of Layers to the number of controlled layers (exclude master).
            var controlledLayers = [];
            for (var j = 0; j < selectedLayers.length; j++) {
                if (selectedLayers[j] !== masterLayer) {
                    controlledLayers.push(selectedLayers[j]);
                }
            }
            addSlider(masterLayer, "Number of Layers", controlledLayers.length);
            
            // For each controlled layer, add a checkbox and a Motion Order slider.
            for (var k = 0; k < controlledLayers.length; k++) {
                var lyr = controlledLayers[k];
                // Add checkbox control "Add to Circular Motion"
                var chk = lyr.property("ADBE Effect Parade").property("Add to Circular Motion");
                if (!chk) {
                    chk = lyr.Effects.addProperty("ADBE Checkbox Control");
                    chk.name = "Add to Circular Motion";
                    chk.property("ADBE Checkbox Control-0001").setValue(1);
                }
                // Add slider for Motion Order, default incremental (1, 2, 3, ...)
                var orderSlider = lyr.property("ADBE Effect Parade").property("Motion Order");
                if (!orderSlider) {
                    orderSlider = lyr.Effects.addProperty("ADBE Slider Control");
                    orderSlider.name = "Motion Order";
                    orderSlider.property("ADBE Slider Control-0001").setValue(k+1);
                }
                
                // Expression for Position using master controls.
                var expr = "var master = thisComp.layer(\"" + masterLayerName + "\");\n" +
                           "var radius = master.effect(\"Radius\")(\"Slider\");\n" +
                           "var progress = master.effect(\"Progress\")(\"Slider\")/100;\n" +
                           "var total = master.effect(\"Number of Layers\")(\"Slider\");\n" +
                           "var order = effect(\"Motion Order\")(\"Slider\");\n" +
                           "if(total < 1) total = 1;\n" +
                           "var offsetAngle = (order - 1) * (360 / total);\n" +
                           "var angle = progress * 360 + offsetAngle;\n" +
                           "master.position + [Math.cos(degreesToRadians(angle)) * radius, Math.sin(degreesToRadians(angle)) * radius];";
                
                lyr.property("Position").expression = expr;
            }
            
            app.endUndoGroup();
        }
        
        win.layout.layout(true);
        if (win instanceof Window) {
            win.center();
            win.show();
        }
    }
}