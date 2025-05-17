(function () {
    function createMarkerPanel() {
        var win = new Window("palette", "Edit Markers", undefined, {resizeable: true});
        win.alignChildren = ["fill", "fill"];
        win.spacing = 10;
        
        // One-liner explainer at the very top
        var headerText = win.add("statictext", undefined, "This panel lets you bulk-edit marker comments on text layers.");
        headerText.alignment = "fill";
        
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }
        
        // Dropdown: list all text layers in the comp
        var textLayerDropdown = win.add("dropdownlist", undefined, []);
        textLayerDropdown.alignment = "fill";
        var textLayers = [];
        for (var i = 1; i <= comp.numLayers; i++) {
            var layer = comp.layer(i);
            if (layer.property("Source Text") !== null) {
                textLayers.push(layer);
                textLayerDropdown.add("item", layer.name);
            }
        }
        if (textLayers.length === 0) {
            alert("No text layers found in the composition.");
            return;
        }
        textLayerDropdown.selection = 0;
        var currentLayer = textLayers[textLayerDropdown.selection.index];
        
        // Main container
        var mainGroup = win.add("group", undefined);
        mainGroup.orientation = "column";
        mainGroup.alignChildren = ["fill", "fill"];
        
        // Marker list panel
        var markerList = mainGroup.add("panel", undefined, "Markers");
        markerList.alignChildren = ["fill", "fill"];
        markerList.orientation = "column";
        markerList.margins = [10, 10, 10, 10];
        
        var markerFields = [];
        function getMarkerProperty(layer) {
            return layer.property("ADBE Marker");
        }
        function populateMarkers() {
            while (markerList.children.length > 0) {
                markerList.remove(markerList.children[0]);
            }
            markerFields = [];
            var markerProperty = getMarkerProperty(currentLayer);
            if (!markerProperty || markerProperty.numKeys === 0) {
                markerList.add("statictext", undefined, "No markers found on this layer.");
                return;
            }
            for (var i = 1; i <= markerProperty.numKeys; i++) {
                var group = markerList.add("group");
                group.orientation = "row";
                group.alignChildren = ["fill", "center"];
                group.spacing = 10;
                var timeText = group.add("statictext", undefined, "T: " + markerProperty.keyTime(i).toFixed(2) + "s");
                timeText.preferredSize.width = 70;
                var markerValue = markerProperty.keyValue(i);
                var commentField = group.add("edittext", undefined, markerValue.comment);
                commentField.alignment = "fill";
                commentField.minimumSize = [100, 20];
                markerFields.push({ index: i, field: commentField });
            }
        }
        populateMarkers();
        
        // Buttons group (side by side)
        var buttonGroup = mainGroup.add("group", undefined);
        buttonGroup.orientation = "row";
        buttonGroup.alignChildren = ["fill", "fill"];
        buttonGroup.spacing = 10;
        
        var applyButton = buttonGroup.add("button", undefined, "Apply Marker Changes");
        var updateButton = buttonGroup.add("button", undefined, "Refresh Marker Data");
        
        applyButton.onClick = function () {
            var markerProperty = getMarkerProperty(currentLayer);
            app.beginUndoGroup("Update Markers");
            for (var j = 0; j < markerFields.length; j++) {
                var index = markerFields[j].index;
                var newComment = markerFields[j].field.text;
                var oldMarker = markerProperty.keyValue(index);
                var newMarker = new MarkerValue(newComment);
                newMarker.duration = oldMarker.duration;
                newMarker.chapter = oldMarker.chapter;
                newMarker.url = oldMarker.url;
                newMarker.frameTarget = oldMarker.frameTarget;
                newMarker.eventCuePoint = oldMarker.eventCuePoint;
                newMarker.label = oldMarker.label;
                markerProperty.setValueAtKey(index, newMarker);
            }
            app.endUndoGroup();
            alert("Markers Updated!");
        };
        
        updateButton.onClick = function () {
            populateMarkers();
            win.layout.layout(true);
        };
        
        // How-To section: one-liner explainer and a button to open detailed instructions
        var howToGroup = mainGroup.add("group", undefined);
        howToGroup.orientation = "row";
        howToGroup.alignChildren = ["fill", "center"];
        howToGroup.spacing = 10;
        
        var howToOneLiner = howToGroup.add("statictext", undefined, "For instructions, click here:");
        howToOneLiner.alignment = "fill";
        
        var howToButton = howToGroup.add("button", undefined, "[?]");
        howToButton.onClick = function () {
            var popup = new Window("dialog", "How-To Instructions", undefined, {resizeable: true});
            popup.alignChildren = ["fill", "fill"];
            popup.spacing = 10;
            // Detailed explanation paragraph at the top followed by steps
            var detailedInstructions = "This panel provides an interface to view and bulk-edit all markers on a chosen text layer in the active composition. " +
                                       "It allows you to update marker comments quickly without having to modify each marker individually.\n\n" +
                                       "Step 1: Select a text layer from the dropdown.\n" +
                                       "Step 2: The markers from the selected layer will be displayed in the marker list.\n" +
                                       "Step 3: Edit the marker comments in the fields provided.\n" +
                                       "Step 4: Click 'Apply Marker Changes' to save your edits.\n" +
                                       "Step 5: Click 'Refresh Marker Data' to reload markers if external changes occur.";
            var instructionText = popup.add("statictext", undefined, detailedInstructions, {multiline: true});
            instructionText.alignment = "fill";
            instructionText.minimumSize = [300, 150];
            var closeBtn = popup.add("button", undefined, "Close");
            closeBtn.onClick = function () { popup.close(); };
            popup.onResizing = popup.onResize = function () { popup.layout.resize(); }
            popup.layout.layout(true);
            popup.center();
            popup.show();
        };
        
        // Update current layer on dropdown change
        textLayerDropdown.onChange = function () {
            currentLayer = textLayers[textLayerDropdown.selection.index];
            populateMarkers();
            win.layout.layout(true);
        };
        
        win.onResizing = win.onResize = function () { win.layout.resize(); }
        win.layout.layout(true);
        win.show();
    }
    createMarkerPanel();
})();