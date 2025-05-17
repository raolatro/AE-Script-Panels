/*  Layer Labeler v1.2 — responsive ScriptUI panel  */
(function (thisObj) {
    // Global debug flag to control alerts
    var DEBUG_MODE = true;
    
    // Debug alert function that only shows alerts when debug mode is enabled
    function debugAlert(message) {
        if (DEBUG_MODE) {
            alert(message);
        }
    }
    
    // debugAlert("Layer Labeler UI building…");

    // ---------- CATEGORY DEFINITIONS ----------
    // Define categories with default colors and test functions - priority determines order for Apply All
    var CAT = [
        { title:"Control", labelIndex: 6, priority: 1, // purple
          test:function(l){return l.nullLayer||l.guideLayer||(l.parent&&(l.parent.nullLayer||l.parent.guideLayer));} },
        { title:"Comps", labelIndex: 5, priority: 2, // brown
          test:function(l){return l.source instanceof CompItem;} },
        { title:"Audio", labelIndex: 9, priority: 3, // aqua
          test:function(l){return l.hasAudio&&!l.hasVideo;} },
        { title:"Text", labelIndex: 1, priority: 4, // red
          test:function(l){return l.property("ADBE Text Properties")!==null;} },
        { title:"Shapes", labelIndex: 3, priority: 5, // light blue
          test:function(l){return l.matchName==="ADBE VectorLayer";} },
        { title:"Mattes", labelIndex: 2, priority: 6, // yellow
          test:function(l){
              // Check if this layer is used as a matte by any other layer in the comp
              var comp = l.containingComp;
              if (!comp) return false;
              
              for (var i = 1; i <= comp.numLayers; i++) {
                  var otherLayer = comp.layer(i);
                  if (otherLayer.trackMatteType !== TrackMatteType.NO_TRACK_MATTE && 
                      otherLayer.index - 1 === l.index) {
                      // Layer immediately above a layer with track matte is being used as a matte
                      return true;
                  }
              }
              return false;
          } },
        { title:"Adjust", labelIndex: 11, priority: 7, // orange
          test:function(l){return l.adjustmentLayer;} },
        { title:"Images", labelIndex: 8, priority: 8, // green
          test:function(l){return (l.source instanceof FootageItem)&&l.source.mainSource.isStill;} }
    ];

    // Define the After Effects label colors with their respective names and indices
    var AE_LABEL_COLORS = [
        { name: "None", index: 0, color: [0.6, 0.6, 0.6] },
        { name: "Red", index: 1, color: [1, 0.2, 0.2] },
        { name: "Yellow", index: 2, color: [1, 0.6, 0.2] },
        { name: "Aqua", index: 3, color: [0.2, 0.6, 1] },
        { name: "Pink", index: 4, color: [0.2, 0.2, 1] },
        { name: "Lavender", index: 5, color: [0.8, 0.6, 0.2] },
        { name: "Peach", index: 6, color: [0.6, 0.2, 0.6] },
        { name: "Sea Foam", index: 7, color: [0.4, 0.4, 0.4] },
        { name: "Blue", index: 8, color: [0.2, 0.6, 0.2] },
        { name: "Green", index: 9, color: [0.4, 0.8, 1] },
        { name: "Purple", index: 10, color: [0.2, 0.2, 0.4] },
        { name: "Orange", index: 11, color: [0.4, 0.2, 0.2] },
        { name: "Brown", index: 12, color: [0.2, 0.4, 0.2] },
        { name: "Fuchsia", index: 13, color: [0.6, 0.6, 1] },
        { name: "Cyan", index: 14, color: [0.6, 0.2, 0] },
        { name: "Sandstone", index: 15, color: [1, 0.4, 0.8] },
        { name: "Dark Green", index: 16, color: [0.4, 0.2, 0.6] }
    ];
    
    // Function to get color by index
    function getColorByIndex(index) {
        for (var i = 0; i < AE_LABEL_COLORS.length; i++) {
            if (AE_LABEL_COLORS[i].index === index) {
                return AE_LABEL_COLORS[i].color;
            }
        }
        return AE_LABEL_COLORS[0].color; // Default to None
    }

    // ---------- UI CONSTRUCTION ----------
    function buildUI(cont){
        // debugAlert("Building UI panels and controls");
        var win = (cont instanceof Panel) ? cont : new Window("palette", "Layer Labeler", undefined, {resizeable:true});
        var main = win.add("group {orientation:'column', alignChildren:['fill','top']}");
        
        // Add debug mode checkbox
        var debugGroup = main.add("group");
        debugGroup.orientation = "row";
        debugGroup.alignment = ["right", "top"];
        var debugCheck = debugGroup.add("checkbox", undefined, "Debug Mode");
        debugCheck.value = DEBUG_MODE;
        debugCheck.onClick = function() {
            DEBUG_MODE = this.value;
            // debugAlert("Debug mode " + (DEBUG_MODE ? "enabled" : "disabled"));
        };

        // Create UI rows for each category
        for(var i=0; i<CAT.length; i++){
            (function(cat){
                var row = main.add("group {orientation:'row', alignChildren:['left','center']}");
                var btn = row.add("button", undefined, cat.title);
                btn.minimumSize.width = 120;

                // Create color swatch and dropdown for each category
                var swatchGroup = row.add("group", undefined);
                swatchGroup.orientation = "horizontal";
                swatchGroup.alignChildren = ["left", "center"];
                swatchGroup.spacing = 2;
                
                // Create swatch to show current color
                var swatch = swatchGroup.add("panel", undefined, "");
                swatch.preferredSize = [34, 22];
                
                // Create dropdown with color names
                var dropdown = swatchGroup.add("dropdownlist");
                dropdown.preferredSize.width = 90;
                
                // Add all AE label colors to dropdown
                for (var j = 0; j < AE_LABEL_COLORS.length; j++) {
                    var item = dropdown.add("item", AE_LABEL_COLORS[j].name);
                    item.index = AE_LABEL_COLORS[j].index;
                }
                
                // Set initial selected color based on category's labelIndex
                cat.currentLabelIndex = cat.labelIndex; // Use the defined label index
                
                // Set initial selected dropdown item and swatch color
                for (var k = 0; k < dropdown.items.length; k++) {
                    if (dropdown.items[k].index === cat.currentLabelIndex) {
                        dropdown.selection = dropdown.items[k];
                        break;
                    }
                }
                
                // Update swatch color based on current selection
                var currentColor = getColorByIndex(cat.currentLabelIndex);
                swatch.graphics.backgroundColor = swatch.graphics.newBrush(
                    swatch.graphics.BrushType.SOLID_COLOR, 
                    currentColor
                );
                
                // Handle dropdown selection change
                dropdown.onChange = function() {
                    if (this.selection !== null) {
                        cat.currentLabelIndex = this.selection.index;
                        var newColor = getColorByIndex(cat.currentLabelIndex);
                        
                        // Update swatch color
                        swatch.graphics.backgroundColor = swatch.graphics.newBrush(
                            swatch.graphics.BrushType.SOLID_COLOR, 
                            newColor
                        );
                        swatch.notify();
                        
                        debugAlert("Color set for " + cat.title + " to " + this.selection.text);
                    }
                };

                // --- apply one category ---
                btn.onClick = function(){
                    debugAlert("Applying " + cat.title + " color");
                    applyCategory(cat);
                };
            })(CAT[i]);
        }

        // ---------- APPLY ALL BUTTON ----------
        var allBtn = main.add("button", undefined, "Apply All");
        allBtn.alignment = ["center", "top"];
        allBtn.onClick = function(){
            debugAlert("Apply All started - processing all categories");
            app.beginUndoGroup("Apply All Label Colors");
            
            var comp = app.project.activeItem;
            if(!(comp instanceof CompItem)) {
                alert("No active composition selected"); // Keep this as a regular alert for error conditions
                return;
            }
            
            // Sort categories by priority before applying
            var sortedCats = CAT.slice().sort(function(a, b) {
                return a.priority - b.priority;
            });
            
            // Keep track of which layers have been processed
            var processedLayers = {};
            
            // Process each category in priority order
            for(var j=0; j<sortedCats.length; j++) {
                var cat = sortedCats[j];
                var hit = 0;
                
                for(var i=1; i<=comp.layers.length; i++) {
                    var lyr = comp.layers[i];
                    // Only process if layer has not been labeled by a higher priority category
                    if(cat.test(lyr) && !processedLayers[i]) {
                        var wasLocked = lyr.locked;
                        if(wasLocked) lyr.locked = false;

                        try {
                            // Set the layer's label property to the selected index
                            lyr.label = cat.currentLabelIndex;
                            processedLayers[i] = true; // Mark as processed
                            hit++;
                        } catch(e) {
                            alert("Error setting label on layer " + i + ": " + e.toString()); // Keep error alerts
                        }

                        if(wasLocked) lyr.locked = true;
                    }
                }
                
                debugAlert(cat.title + " → " + hit + " layers updated");
            }
            
            app.endUndoGroup();
            debugAlert("Apply All finished - all categories processed");
        };

        win.onResizing = win.onResize = function() {
            this.layout.resize();
        };
        
        win.layout.layout(true);
        // alert("UI build complete");
        return win;
    }

    // ---------- UTILITY FUNCTIONS ----------
    // This section contains utility functions for working with colors and UI

    // ---------- APPLY COLOR TO LAYERS ----------
    function applyCategory(cat) {
        var comp = app.project.activeItem;
        if(!(comp instanceof CompItem)) {
            alert("No active composition selected"); // Keep this as a regular alert for error conditions
            return;
        }

        app.beginUndoGroup("Label " + cat.title);
        var hit = 0;
        
        debugAlert("Processing layers for category: " + cat.title);
        
        for(var i=1; i<=comp.layers.length; i++) {
            var lyr = comp.layers[i];
            if(cat.test(lyr)) {
                var wasLocked = lyr.locked;
                if(wasLocked) lyr.locked = false;

                try {
                    // Set the layer's label property to the selected index
                    lyr.label = cat.currentLabelIndex;
                    hit++;
                } catch(e) {
                    alert("Error setting label on layer " + i + ": " + e.toString()); // Keep error alerts
                }

                if(wasLocked) lyr.locked = true;
            }
        }
        
        app.endUndoGroup();
        debugAlert(cat.title + " → " + hit + " layers updated");
    }

    // ---------- RUN SCRIPT ----------
    // debugAlert("Initializing Layer Labeler script");
    var ui = buildUI(thisObj);
    if(ui instanceof Window) {
        ui.center();
        ui.show();
    }

})(this);