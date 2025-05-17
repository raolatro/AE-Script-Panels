// RelinkExpressionsUI.jsx
// Place this script in the ScriptUI Panels folder.

{
    function RelinkExpressionsUI(thisObj) {
        function buildUI(thisObj) {
            var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Relink Expressions", undefined, { resizeable: true });

            // UI Elements
            var res = "group { \
                orientation:'column', alignment:['fill', 'fill'], alignChildren:['fill', 'top'], \
                oldCompGroup: Group { \
                    orientation:'row', alignment:['fill', 'top'], \
                    oldCompLabel: StaticText { text:'Old Comp Name:', alignment:['left', 'center'] }, \
                    oldCompInput: EditText { text:'', characters:25, alignment:['fill', 'center'] } \
                }, \
                oldLayerGroup: Group { \
                    orientation:'row', alignment:['fill', 'top'], \
                    oldLayerLabel: StaticText { text:'Old Layer Name:', alignment:['left', 'center'] }, \
                    oldLayerInput: EditText { text:'', characters:25, alignment:['fill', 'center'] } \
                }, \
                newCompGroup: Group { \
                    orientation:'row', alignment:['fill', 'top'], \
                    newCompLabel: StaticText { text:'New Comp Name:', alignment:['left', 'center'] }, \
                    newCompInput: EditText { text:'', characters:25, alignment:['fill', 'center'] } \
                }, \
                newLayerGroup: Group { \
                    orientation:'row', alignment:['fill', 'top'], \
                    newLayerLabel: StaticText { text:'New Layer Name:', alignment:['left', 'center'] }, \
                    newLayerInput: EditText { text:'', characters:25, alignment:['fill', 'center'] } \
                }, \
                renameButton: Button { text:'RENAME ALL', alignment:['center', 'top'] } \
            }";

            myPanel.grp = myPanel.add(res);

            // Event Handler
            myPanel.grp.renameButton.onClick = function() {
                var oldCompName = myPanel.grp.oldCompGroup.oldCompInput.text;
                var oldLayerName = myPanel.grp.oldLayerGroup.oldLayerInput.text;
                var newCompName = myPanel.grp.newCompGroup.newCompInput.text;
                var newLayerName = myPanel.grp.newLayerGroup.newLayerInput.text;

                if (oldCompName === '' || oldLayerName === '' || newCompName === '' || newLayerName === '') {
                    alert("Please fill in all fields.");
                    return;
                }

                app.beginUndoGroup("Relink Expressions");
                relinkExpressions(oldCompName, oldLayerName, newCompName, newLayerName);
                app.endUndoGroup();
            };

            myPanel.layout.layout(true);
            return myPanel;
        }

        // Function to escape special regex characters
        function escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        // The main function to relink expressions
        function relinkExpressions(oldCompName, oldLayerName, newCompName, newLayerName) {
            var proj = app.project;
            var items = proj.items;
            var expressionsChanged = 0;

            for (var i = 1; i <= items.length; i++) {
                if (items[i] instanceof CompItem) {
                    var comp = items[i];
                    var layers = comp.layers;

                    for (var j = 1; j <= layers.length; j++) {
                        var layer = layers[j];
                        expressionsChanged += relinkProperties(layer, oldCompName, oldLayerName, newCompName, newLayerName);
                    }
                }
            }

            alert("Expressions have been relinked.\nTotal expressions updated: " + expressionsChanged);
        }

        function relinkProperties(propertyGroup, oldCompName, oldLayerName, newCompName, newLayerName) {
            var expressionsChanged = 0;

            for (var i = 1; i <= propertyGroup.numProperties; i++) {
                var property = propertyGroup.property(i);

                if (property instanceof PropertyGroup) {
                    expressionsChanged += relinkProperties(property, oldCompName, oldLayerName, newCompName, newLayerName);
                } else if (property.canSetExpression && property.expressionEnabled) {
                    var expr = property.expression;
                    var newExpr = expr;

                    // Replace comp and layer names in the expression string
                    var regexComp = new RegExp('comp\\(\\"' + escapeRegExp(oldCompName) + '\\"\\)', "g");
                    var regexLayer = new RegExp('layer\\(\\"' + escapeRegExp(oldLayerName) + '\\"\\)', "g");

                    newExpr = newExpr.replace(regexComp, 'comp("' + newCompName + '")');
                    newExpr = newExpr.replace(regexLayer, 'layer("' + newLayerName + '")');

                    if (newExpr !== expr) {
                        property.expression = newExpr;
                        expressionsChanged++;
                    }
                }
            }

            return expressionsChanged;
        }

        var myScriptPal = buildUI(thisObj);

        if (myScriptPal instanceof Window) {
            myScriptPal.center();
            myScriptPal.show();
        } else {
            myScriptPal.layout.layout(true);
        }
    }

    RelinkExpressionsUI(this);
}
