// Save this script with a .jsx extension in the ScriptUI Panels folder
// For example: "FUCSH_ALL_CTRLs.jsx"

{
    // Global variable for the panel
    var myPanel;

    // Function to create the UI panel
    function createUI(thisObj) {
        myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "FUCSH ALL CTRLs", undefined, {resizeable:true});

        // Add a group with padding
        var res = "group { \
            orientation:'column', alignment:['fill','fill'], alignChildren:['fill','top'], spacing:10, margins:[10,10,10,10], \
            btn: Button { text:'FUCSH ALL CTRLs', alignment:['fill','top'] }, \
            message: StaticText { text:'', alignment:['fill','top'], properties:{multiline:true} } \
        }";
        myPanel.grp = myPanel.add(res);

        // Define what happens when the button is clicked
        myPanel.grp.btn.onClick = function() {
            // Begin undo group for script actions
            app.beginUndoGroup("Color Controller Layers Fuchsia");
            try {
                // Ensure the active item is a composition
                var comp = app.project.activeItem;
                if (comp && comp instanceof CompItem) {
                    // Arrays to store layers identified as controllers
                    var controllerLayers = [];

                    // First, identify guide layers that are controlling other layers
                    for (var i = 1; i <= comp.numLayers; i++) {
                        var layer = comp.layer(i);

                        // Check if the layer is a guide layer
                        var isGuideLayer = (layer.guideLayer === true);

                        if (isGuideLayer) {
                            var isController = false;

                            // Check if any layers are parented to this guide layer
                            for (var j = 1; j <= comp.numLayers; j++) {
                                var otherLayer = comp.layer(j);
                                if (otherLayer.parent && otherLayer.parent.index === layer.index) {
                                    isController = true;
                                    break;
                                }
                            }

                            // Check if any expressions reference this guide layer
                            if (!isController) {
                                for (var j = 1; j <= comp.numLayers; j++) {
                                    var otherLayer = comp.layer(j);
                                    function checkExpressions(propGroup) {
                                        for (var k = 1; k <= propGroup.numProperties; k++) {
                                            var prop = propGroup.property(k);
                                            if (prop instanceof PropertyGroup) {
                                                checkExpressions(prop);
                                            } else if (prop.canSetExpression && prop.expressionEnabled) {
                                                var expr = prop.expression;
                                                // Check if the expression references this guide layer
                                                var guideLayerName = layer.name;
                                                // Simple check using the layer name
                                                if (expr.indexOf(guideLayerName) !== -1) {
                                                    isController = true;
                                                    return;
                                                }
                                            }
                                        }
                                    }
                                    checkExpressions(otherLayer);
                                    if (isController) {
                                        break;
                                    }
                                }
                            }

                            // If the guide layer is controlling at least one other layer
                            if (isController) {
                                controllerLayers.push(layer);
                            }
                        }
                    }

                    // Color identified controller layers fuchsia
                    if (controllerLayers.length > 0) {
                        for (var i = 0; i < controllerLayers.length; i++) {
                            var layer = controllerLayers[i];
                            // Set label color to fuchsia (label index might be 13)
                            layer.label = 13;
                        }
                    }

                    // Update the message text and display it
                    myPanel.grp.message.text = controllerLayers.length + " fucshiaed!";
                    myPanel.grp.layout.layout(true);

                    // Schedule the message to disappear after 2 seconds (2000 milliseconds)
                    app.scheduleTask("clearMessage()", 2000, false);

                } else {
                    // If no active composition
                    myPanel.grp.message.text = "Please select an active composition.";
                    myPanel.grp.layout.layout(true);

                    // Schedule the message to disappear after 2 seconds
                    app.scheduleTask("clearMessage()", 2000, false);
                }
            } catch (err) {
                // On error, display error message
                myPanel.grp.message.text = "An error occurred: " + err.message;
                myPanel.grp.layout.layout(true);

                // Schedule the message to disappear after 2 seconds
                app.scheduleTask("clearMessage()", 2000, false);
            }
            app.endUndoGroup();
        };

        // Setup panel resizing
        myPanel.onResizing = myPanel.onResize = function () { this.layout.resize(); };

        return myPanel;
    }

    // Function to clear the message
    function clearMessage() {
        if (myPanel && myPanel.grp && myPanel.grp.message) {
            myPanel.grp.message.text = "";
            myPanel.grp.layout.layout(true);
        }
    }

    // Execute the script to create the UI panel
    var myScriptPal = createUI(this);
    if (myScriptPal instanceof Window) {
        myScriptPal.center();
        myScriptPal.show();
    } else if (myScriptPal instanceof Panel) {
        myScriptPal.layout.layout(true);
    }
}