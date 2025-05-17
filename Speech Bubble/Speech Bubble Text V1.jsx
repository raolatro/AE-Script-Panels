(function(thisObj){
    function createUI(thisObj) {
        var win = (thisObj instanceof Panel)
            ? thisObj
            : new Window("palette", "Speech Bubble Tool", undefined, {resizeable:true});
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 10;
        win.margins = 10;

        // 1- Create New Speech Bubble Section
        var createSection = win.add("panel", undefined, "Create New Speech Bubble");
        createSection.orientation = "column";
        createSection.alignChildren = ["fill", "top"];
        var createBtn = createSection.add("button", undefined, "Create Speech Bubble");

        // 2- Select Layers Section (stacked, left-aligned)
        var selectSection = win.add("panel", undefined, "Select Layers");
        selectSection.orientation = "column";
        selectSection.alignChildren = ["left", "top"];
        var textLabel = selectSection.add("statictext", undefined, "Text Layer:");
        textLabel.alignment = "left";
        var textLayerDropdown = selectSection.add("dropdownlist", undefined, []);
        textLayerDropdown.alignment = "left";
        var shapeLabel = selectSection.add("statictext", undefined, "Shape Layer:");
        shapeLabel.alignment = "left";
        var shapeLayerDropdown = selectSection.add("dropdownlist", undefined, []);
        shapeLayerDropdown.alignment = "left";
        var refreshBtn = selectSection.add("button", undefined, "Refresh Layers");

        // 3- Update Expressions Section
        var updateSection = win.add("panel", undefined, "Update Expressions");
        updateSection.orientation = "column";
        updateSection.alignChildren = ["fill", "center"];
        var applyBtn = updateSection.add("button", undefined, "Apply / Update Expressions");

        // Instructions button at bottom right
        var instrGrp = win.add("group");
        instrGrp.alignment = "right";
        var instrBtn = instrGrp.add("button", undefined, "?");

        win.onResizing = win.onResize = function () { this.layout.resize(); };

        // Create Speech Bubble: generate text & shape layers, set defaults, parent shape to text
        createBtn.onClick = function(){
            app.beginUndoGroup("Create Speech Bubble");
            var comp = app.project.activeItem;
            if(comp && comp instanceof CompItem){
                // Create Text Layer with black text
                var textLayer = comp.layers.addText("Enter your text here...");
                textLayer.name = "Speech Bubble Text";
                var textProp = textLayer.property("ADBE Text Properties").property("ADBE Text Document");
                var textDoc = textProp.value;
                textDoc.fillColor = [0, 0, 0];
                textProp.setValue(textDoc);
                // Create Shape Layer with white fill and no stroke
                var shapeLayer = comp.layers.addShape();
                shapeLayer.name = "Speech Bubble Shape";
                // Parent the shape layer to the text layer so it follows its transforms
                shapeLayer.parent = textLayer;
                // Ensure the shape layer is below the text layer in stacking order
                shapeLayer.moveAfter(textLayer);
                // Add a rectangle shape group
                var contents = shapeLayer.property("ADBE Root Vectors Group");
                var rectGroup = contents.addProperty("ADBE Vector Group");
                rectGroup.name = "Bubble";
                var vectors = rectGroup.property("ADBE Vectors Group");
                var rectPath = vectors.addProperty("ADBE Vector Shape - Rect");
                // Add white fill
                var fill = vectors.addProperty("ADBE Vector Graphic - Fill");
                fill.property("ADBE Vector Fill Color").setValue([1, 1, 1]);
            }
            app.endUndoGroup();
            refreshDropdowns();
        };

        // Refresh dropdowns to update layer lists
        refreshBtn.onClick = function(){
            refreshDropdowns();
        };

        // Apply / Update Expressions: Link shape's rectangle to text layer's sourceRect
        applyBtn.onClick = function(){
            var comp = app.project.activeItem;
            if(!(comp && comp instanceof CompItem)){
                return;
            }
            if(!textLayerDropdown.selection || !shapeLayerDropdown.selection){
                return;
            }
            var textLayerName = textLayerDropdown.selection.text;
            var shapeLayerName = shapeLayerDropdown.selection.text;
            var selTextLayer = comp.layer(textLayerName);
            var selShapeLayer = comp.layer(shapeLayerName);
            app.beginUndoGroup("Apply Expressions");
            applyExpressions(selTextLayer, selShapeLayer);
            app.endUndoGroup();
        };

        // Instructions popup
        instrBtn.onClick = function(){
            showInstructions();
        };

        function refreshDropdowns() {
            var comp = app.project.activeItem;
            if(!(comp && comp instanceof CompItem)){
                return;
            }
            var textLayers = [];
            var shapeLayers = [];
            for(var i = 1; i <= comp.numLayers; i++){
                var lyr = comp.layer(i);
                if(lyr instanceof TextLayer){
                    textLayers.push(lyr);
                } else if(lyr.matchName === "ADBE Vector Layer"){
                    shapeLayers.push(lyr);
                }
            }
            textLayerDropdown.removeAll();
            shapeLayerDropdown.removeAll();
            for(var i = 0; i < textLayers.length; i++){
                textLayerDropdown.add("item", textLayers[i].name);
            }
            for(var i = 0; i < shapeLayers.length; i++){
                shapeLayerDropdown.add("item", shapeLayers[i].name);
            }
            if(textLayerDropdown.items.length > 0) textLayerDropdown.selection = 0;
            if(shapeLayerDropdown.items.length > 0) shapeLayerDropdown.selection = 0;
        }

        function applyExpressions(textLayer, shapeLayer) {
            var effectNames = ["Padding", "OffsetX", "OffsetY", "Roundness"];
            var defaultValues = [10, 0, 0, 5];
            var effects = shapeLayer.property("ADBE Effect Parade");
            for(var i = 0; i < effectNames.length; i++){
                var eff = effects.property(effectNames[i]);
                if(!eff){
                    eff = effects.addProperty("ADBE Slider Control");
                    eff.name = effectNames[i];
                    eff.property("ADBE Slider Control-0001").setValue(defaultValues[i]);
                } else {
                    eff.property("ADBE Slider Control-0001").setValue(defaultValues[i]);
                }
            }
            var contents = shapeLayer.property("ADBE Root Vectors Group");
            var rectGroup = null;
            for(var j = 1; j <= contents.numProperties; j++){
                var grp = contents.property(j);
                if(grp.matchName === "ADBE Vector Group"){
                    rectGroup = grp;
                    break;
                }
            }
            if(!rectGroup) { return; }
            var vectors = rectGroup.property("ADBE Vectors Group");
            var rectPath = vectors.property("ADBE Vector Shape - Rect");
            if(!rectPath) { return; }
            var exprSize = "var t = thisComp.layer('" + textLayer.name + "').sourceRectAtTime();\n" +
                           "var p = effect('Padding')('Slider');\n" +
                           "[ t.width + 2*p, t.height + 2*p ]";
            rectPath.property("ADBE Vector Rect Size").expression = exprSize;
            var exprPos = "var t = thisComp.layer('" + textLayer.name + "').sourceRectAtTime();\n" +
                          "var ox = effect('OffsetX')('Slider');\n" +
                          "var oy = effect('OffsetY')('Slider');\n" +
                          "[ t.left + t.width/2 + ox, t.top + t.height/2 + oy ]";
            rectPath.property("ADBE Vector Rect Position").expression = exprPos;
            var roundProp;
            try {
                roundProp = rectPath.property("ADBE Vector Rect Roundness");
            } catch(e) { roundProp = null; }
            if(!roundProp){
                roundProp = vectors.addProperty("ADBE Vector Rect Roundness");
            }
            if(roundProp){
                roundProp.expression = "effect('Roundness')('Slider')";
            }
        }

        function showInstructions() {
            var instrWin = new Window("dialog", "Instructions", undefined, {resizeable:true});
            instrWin.orientation = "column";
            instrWin.alignChildren = "fill";
            instrWin.spacing = 10;
            instrWin.margins = 10;
            instrWin.preferredSize = [500, 400];
            var summary = instrWin.add("statictext", undefined, "This tool creates a speech bubble effect by linking a shape layer's rectangle to a text layer's content. The shape layer is parented to the text layer so that any transform animations (position, scale, rotation, etc.) applied to the text layer will be followed by the shape layer. You can still animate the shape layer's own transform properties independently.", {multiline:true});
            summary.maximumSize.width = 480;
            var steps = instrWin.add("statictext", undefined,
                "1. Click 'Create Speech Bubble' to generate new text and shape layers.\n" +
                "2. Use 'Refresh Layers' to update the layer lists if new layers are added.\n" +
                "3. Select the appropriate Text and Shape layers from the dropdowns.\n" +
                "4. Click 'Apply / Update Expressions' to link the shape's rectangle to the text layer.\n" +
                "5. Adjust the slider controls on the shape layer's effect controls panel for further customization.\n" +
                "6. Enjoy :) ",
                {multiline:true});
            steps.maximumSize.width = 480;
            var closeGrp = instrWin.add("group");
            closeGrp.alignment = "center";
            var closeBtn = closeGrp.add("button", undefined, "Close");
            closeBtn.onClick = function(){ instrWin.close(); };
            instrWin.onResizing = function(){ instrWin.layout.layout(true); };
            instrWin.center();
            instrWin.show();
        }

        refreshDropdowns();
        if(win instanceof Window){
            win.center();
            win.show();
        } else {
            win.layout.layout(true);
        }
        return win;
    }
    var myPanel = createUI(thisObj);
})(this);