{
    function addMarkersAtKeyframes() {
        var comp = app.project.activeItem;
        if (!(comp && comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }

        var layers = comp.selectedLayers;
        if (layers.length === 0) {
            alert("Please select at least one layer.");
            return;
        }

        app.beginUndoGroup("Add Markers at Keyframes");

        var keyframeTimes = [];

        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            keyframeTimes = keyframeTimes.concat(addMarkersToLayer(layer));
        }

        app.endUndoGroup();

        if (keyframeTimes.length > 0) {
            alert("Markers added successfully!");
        } else {
            alert("No keyframes found on the selected layers.");
        }
    }

    function addMarkersToLayer(layer) {
        var properties = getAllProperties(layer);
        var keyframeTimes = [];

        for (var i = 0; i < properties.length; i++) {
            var prop = properties[i];
            if (prop.numKeys > 0) {
                for (var k = 1; k <= prop.numKeys; k++) {
                    var keyTime = prop.keyTime(k);
                    var markerComment = prop.name;
                    addMarker(layer, keyTime, markerComment);
                    keyframeTimes.push(formatTime(keyTime));
                }
            }
        }
        return keyframeTimes;
    }

    function addMarker(layer, time, comment) {
        var markerProperty = layer.property("Marker");
        var newMarker = new MarkerValue(comment);
        markerProperty.setValueAtTime(time, newMarker);
    }

    function getAllProperties(layer) {
        var properties = [];
        function collectProperties(group) {
            for (var i = 1; i <= group.numProperties; i++) {
                var prop = group.property(i);
                if (prop instanceof PropertyGroup || prop instanceof MaskPropertyGroup) {
                    collectProperties(prop);
                } else if (prop.canSetExpression) {
                    properties.push(prop);
                }
            }
        }
        collectProperties(layer);
        return properties;
    }

    function formatTime(time) {
        var t = time.toFixed(2).split(".");
        var frames = (t[1] * 1.0).toFixed(0);
        return t[0] + ":" + (frames.length < 2 ? "0" : "") + frames;
    }

    function createUI(thisObj) {
        var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Add Markers", undefined, { resizeable: true });

        var res = "group { \
            orientation: 'column', \
            alignment: ['fill', 'fill'], \
            alignChildren: ['fill', 'fill'], \
            button: Button { text: 'Add Markers at Keyframes' }, \
        }";

        myPanel.grp = myPanel.add(res);

        myPanel.layout.layout(true);

        myPanel.grp.button.onClick = addMarkersAtKeyframes;

        return myPanel;
    }

    var myScriptPal = createUI(this);
    if (myScriptPal instanceof Window) {
        myScriptPal.center();
        myScriptPal.show();
    }
}
