{
    function makeMainControlPanel(thisObj) {
        function buildUI(thisObj) {
            var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Make Main Control", undefined, {resizeable: true});

            var res =
            "group { \
                orientation:'column', alignment:['fill','fill'], alignChildren:['fill','top'], \
                btn: Button { text:'MAKE MAIN CONTROL' } \
            }";

            myPanel.grp = myPanel.add(res);

            myPanel.grp.btn.onClick = function() {
                app.beginUndoGroup("Make Main Control");

                var comp = app.project.activeItem;
                if (comp && comp instanceof CompItem) {

                    if (comp.selectedLayers.length !== 1) {
                        alert("Please select one layer to be the main control.");
                        app.endUndoGroup();
                        return;
                    }

                    var mainControlLayer = comp.selectedLayers[0];

                    if (!mainControlLayer.guideLayer) {
                        alert("Selected layer must be a guide layer.");
                        app.endUndoGroup();
                        return;
                    }

                    // Collect unparented layers, unlock them if locked, keep track of originally locked layers
                    var layersToParent = [];
                    var originallyLockedLayers = [];
                    for (var i = 1; i <= comp.numLayers; i++) {
                        var layer = comp.layer(i);
                        if (layer !== mainControlLayer && layer.parent === null) {
                            if (layer.locked) {
                                originallyLockedLayers.push(layer); // Keep track of locked layers
                                layer.locked = false; // Unlock the layer
                            }
                            layersToParent.push(layer);
                        }
                    }

                    // Parent the collected layers to mainControlLayer
                    for (var j = 0; j < layersToParent.length; j++) {
                        layersToParent[j].parent = mainControlLayer;
                    }

                    // Relock the layers that were originally locked
                    for (var k = 0; k < originallyLockedLayers.length; k++) {
                        originallyLockedLayers[k].locked = true;
                    }

                    // Move the main control layer to the top of the layer stack
                    mainControlLayer.moveToBeginning();

                    // Check if the main control layer has an effect called "Void"
                    var voidEffect = mainControlLayer.effect("Void");
                    if (voidEffect !== null) {
                        // Adjust Width and Height to match comp dimensions
                        if (voidEffect.property("Width") !== null) {
                            voidEffect.property("Width").setValue(comp.width);
                        }
                        if (voidEffect.property("Height") !== null) {
                            voidEffect.property("Height").setValue(comp.height);
                        }
                        // Change color to Fuchsia (RGB: 1, 0, 1)
                        if (voidEffect.property("Color") !== null) {
                            voidEffect.property("Color").setValue([1, 0, 1]);
                        }
                    }

                } else {
                    alert("Please select a composition.");
                }
                app.endUndoGroup();
            }

            myPanel.layout.layout(true);
            return myPanel;
        }

        var myScriptPal = buildUI(thisObj);

        if (myScriptPal instanceof Window) {
            myScriptPal.center();
            myScriptPal.show();
        } else {
            myScriptPal.layout.layout(true);
            myScriptPal.layout.resize();
        }
    }

    makeMainControlPanel(this);
}