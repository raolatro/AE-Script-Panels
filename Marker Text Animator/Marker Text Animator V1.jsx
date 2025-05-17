(function(){
    // Helper function to format time in "MM:SS:FF"
    function formatTime(t, frameRate) {
        var totalFrames = Math.round(t * frameRate);
        var minutes = Math.floor(totalFrames / (60 * frameRate));
        var seconds = Math.floor((totalFrames / frameRate) % 60);
        var frames = totalFrames % Math.round(frameRate);
        function pad(n) { return n < 10 ? "0" + n : "" + n; }
        return pad(minutes) + ":" + pad(seconds) + ":" + pad(frames);
    }

    // Main Panel
    var win = (this instanceof Panel) ? this : new Window("palette", "Marker Text Updater", undefined, {resizeable:true});
    win.alignChildren = ["fill", "top"];

    // Input group: text input and "+ Text" button
    var inputGroup = win.add("group");
    inputGroup.orientation = "row";
    inputGroup.alignChildren = ["fill", "center"];
    var textInput = inputGroup.add("edittext", undefined, "");
    textInput.preferredSize = [150, 25];
    var addTextBtn = inputGroup.add("button", undefined, "+ Text");

    // Update Button
    var updateBtn = win.add("button", undefined, "Update");

    // Bottom group: explainer text and "?" info button
    var bottomGroup = win.add("group");
    bottomGroup.orientation = "row";
    bottomGroup.alignChildren = ["left", "center"];
    var explainerText = bottomGroup.add("statictext", undefined, "Panel updates text layers based on markers.");
    var infoBtn = bottomGroup.add("button", undefined, "?");
    infoBtn.preferredSize = [25, 25];

    // Responsive layout
    win.onResizing = win.onResize = function() { this.layout.resize(); };

    // "+ Text" button: adds a new marker with input text at current time on all selected layers.
    addTextBtn.onClick = function(){
        app.beginUndoGroup("Add Marker Text");
        var comp = app.project.activeItem;
        if(!(comp && comp instanceof CompItem)){
            alert("Please select or open a composition.");
            return;
        }
        var layers = comp.selectedLayers;
        if(layers.length === 0){
            alert("Please select at least one layer.");
            return;
        }
        var messages = [];
        for(var i = 0; i < layers.length; i++){
            var layer = layers[i];
            var markerProp = layer.property("Marker");
            if(!markerProp) continue;
            // Add marker at comp's current time
            var markerVal = new MarkerValue(textInput.text);
            markerProp.setValueAtTime(comp.time, markerVal);
            var timeStr = formatTime(comp.time, comp.frameRate);
            messages.push(timeStr + ": " + textInput.text);
        }
        app.endUndoGroup();
        if(messages.length > 0){
            alert(messages.join("\n"));
        }
    };

    // "Update" button: applies an expression to text layers based on markers.
    updateBtn.onClick = function(){
        app.beginUndoGroup("Update Marker Text Expression");
        var comp = app.project.activeItem;
        if(!(comp && comp instanceof CompItem)){
            alert("Please select or open a composition.");
            return;
        }
        var layers = comp.selectedLayers;
        if(layers.length === 0){
            alert("Please select at least one layer.");
            return;
        }
        for(var i = 0; i < layers.length; i++){
            var layer = layers[i];
            var srcTextProp = layer.property("Source Text");
            if(!srcTextProp) continue;
            var markerProp = layer.property("Marker");
            if(markerProp.numKeys < 1) continue;
            var expr = "";
            expr += "m = thisLayer.marker;\n";
            expr += "n = m.numKeys;\n";
            expr += "txt = '';\n";
            expr += "if(n > 0){\n";
            expr += "  for(i = 1; i <= n; i++){\n";
            expr += "    if(i == n){\n";
            expr += "      if(time >= m.key(i).time) txt = m.key(i).comment;\n";
            expr += "    } else {\n";
            expr += "      if(time >= m.key(i).time && time < m.key(i+1).time) txt = m.key(i).comment;\n";
            expr += "    }\n";
            expr += "  }\n";
            expr += "}\n";
            expr += "txt;";
            srcTextProp.expression = expr;
        }
        app.endUndoGroup();
    };

    // "?" button: shows an explanation popup as a separate panel
    infoBtn.onClick = function(){
        var infoWin = new Window("dialog", "Panel Explanation");
        infoWin.orientation = "column";
        infoWin.alignChildren = ["fill", "top"];
        infoWin.spacing = 10;
        infoWin.margins = 16;
        
        var summary = infoWin.add("statictext", undefined, "Summary: This panel lets you add markers with custom text on selected layers at the current time, and update text layers so that their source text changes based on these markers.", {multiline:true});
        summary.maximumSize = [300, 60];
        
        var bulletText = "• Click '+ Text' to add a marker with the text from the input box on all selected layers at the current comp time.\n" +
                         "• Click 'Update' to apply an expression that updates text layers according to marker times and labels.";
        var bullets = infoWin.add("statictext", undefined, bulletText, {multiline:true});
        bullets.maximumSize = [300, 60];
        
        var conclusion = infoWin.add("statictext", undefined, "Conclusion: Use this tool to streamline marker-based text updates in After Effects.", {multiline:true});
        conclusion.maximumSize = [300, 30];
        
        var closeBtn = infoWin.add("button", undefined, "Close");
        closeBtn.onClick = function(){ infoWin.close(); };
        
        infoWin.show();
    };

    if(win instanceof Window){
        win.center();
        win.show();
    }
})();