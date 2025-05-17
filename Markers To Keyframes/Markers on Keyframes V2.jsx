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
        var propertyLabelMap = {}; // Map property names to label numbers
        var labelCounter = { value: 1 }; // Use an object to pass by reference

        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            try {
                keyframeTimes = keyframeTimes.concat(addMarkersToLayer(layer, propertyLabelMap, labelCounter));
            } catch (err) {
                alert("Error processing layer '" + layer.name + "': " + err.message);
            }
        }

        app.endUndoGroup();

        if (keyframeTimes.length === 0) {
            alert("No keyframes found on the selected layers.");
        }
    }

    function addMarkersToLayer(layer, propertyLabelMap, labelCounter) {
        var keyframeTimes = [];
        try {
            var properties = getAllProperties(layer);
            for (var i = 0; i < properties.length; i++) {
                var prop = properties[i];
                if (prop.numKeys > 1) {
                    var propName = getShortenedPropertyName(prop);
                    if (!propertyLabelMap.hasOwnProperty(propName)) {
                        propertyLabelMap[propName] = labelCounter.value;
                        labelCounter.value = (labelCounter.value % 16) + 1;
                    }
                    var labelNumber = propertyLabelMap[propName];

                    for (var k = 1; k < prop.numKeys; k++) {
                        var keyTime1 = prop.keyTime(k);
                        var keyTime2 = prop.keyTime(k + 1);
                        var duration = keyTime2 - keyTime1;
                        var valueAtKey = prop.keyValue(k);
                        var valueAtNextKey = prop.keyValue(k + 1);

                        var markerComment = propName + ": " + formatPropertyValue(valueAtKey) + " > " + formatPropertyValue(valueAtNextKey);
                        addMarker(layer, keyTime1, duration, markerComment, labelNumber);
                        keyframeTimes.push(formatTime(keyTime1));
                    }
                }
            }
        } catch (err) {
            alert("Error in addMarkersToLayer for layer '" + layer.name + "': " + err.message);
        }
        return keyframeTimes;
    }

    function addMarker(layer, time, duration, comment, labelNumber) {
        try {
            var markerProperty = layer.property("Marker");
            var newMarker = new MarkerValue(comment);
            newMarker.duration = duration;
            newMarker.label = labelNumber;
            markerProperty.setValueAtTime(time, newMarker);
        } catch (err) {
            alert("Error adding marker at time " + time + " on layer '" + layer.name + "': " + err.message);
        }
    }

    function getAllProperties(layer) {
        var properties = [];

        function collectProperties(group) {
            try {
                for (var i = 1; i <= group.numProperties; i++) {
                    var prop = group.property(i);

                    if (prop.propertyType === PropertyType.PROPERTY) {
                        if (prop.numKeys > 0) {
                            // Exclude combined Position if dimensions are separated
                            if (prop.matchName === "ADBE Position" && layer.transform.position.dimensionsSeparated) {
                                continue;
                            }
                            // Exclude individual dimensions if dimensions are not separated
                            if (!layer.transform.position.dimensionsSeparated && (prop.matchName === "ADBE Position_0" || prop.matchName === "ADBE Position_1" || prop.matchName === "ADBE Position_2")) {
                                continue;
                            }
                            properties.push(prop);
                        }
                    } else if (prop.propertyType === PropertyType.INDEXED_GROUP || prop.propertyType === PropertyType.NAMED_GROUP) {
                        collectProperties(prop);
                    }
                }
            } catch (err) {
                alert("Error in collectProperties: " + err.message);
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

    function getShortenedPropertyName(prop) {
        var fullName = prop.name;
        var matchName = prop.matchName;

        var nameMap = {
            // Position properties
            "Position": "P",
            "X Position": "X P",
            "Y Position": "Y P",
            "Z Position": "Z P",
            "ADBE Position_0": "X P",
            "ADBE Position_1": "Y P",
            "ADBE Position_2": "Z P",
            // Rotation properties
            "Rotation": "R",
            "X Rotation": "X R",
            "Y Rotation": "Y R",
            "Z Rotation": "Z R",
            "ADBE Rotate X": "X R",
            "ADBE Rotate Y": "Y R",
            "ADBE Rotate Z": "Z R",
            // Other common properties
            "Scale": "S",
            "Opacity": "O",
            "Anchor Point": "A",
            "Source Text": "Txt",
            "Skew": "Skew",
            "Skew Axis": "SkewA",
            "Start": "Start",
            "End": "End",
            "Offset": "Offset",
            "Fill Color": "FillC",
            "Stroke Color": "StrkC",
            "Text Opacity": "TxtO",
            "Scale Width": "S W",
            "Tracking Amount": "Track",
            "Stroke Width": "StrkW",
            "Stroke Opacity": "StrkO",
            "Fill Opacity": "FillO",
            "Mask Path": "MaskP",
            "Mask Opacity": "MaskO",
            "Mask Expansion": "MaskE",
            "Mask Feather": "MaskF",
            "Audio Levels": "AudL",
            "Time Remap": "TimeR",
            "Brightness": "Brght",
            "Contrast": "Cntrst",
            "Hue": "Hue",
            "Saturation": "Sat",
            "Lightness": "Light",
            "Blur Radius": "BlurR",
            "Shadow Depth": "ShadD",
            "Shadow Color": "ShadC",
            "Shadow Opacity": "ShadO",
            "Glow Intensity": "GlowI",
            "Glow Radius": "GlowR",
            "Volume": "Vol",
            "Balance": "Bal",
            "Tint": "Tint",
            "Exposure": "Exp",
            "Gamma": "Gamma",
            "Vibrance": "Vib",
            "Temperature": "Temp",
            "Sharpness": "Sharp",
            "Opacity (Mask)": "MaskO",
            "Expansion": "Exp",
            "Feather": "Feath",
            "Amount": "Amt",
            // Add more properties as needed
        };

        var shortenedName = nameMap[fullName] || nameMap[matchName] || fullName;
        return shortenedName;
    }

    function formatPropertyValue(value) {
        try {
            if (value === null || value === undefined) {
                return "null";
            } else if (typeof value === 'object' && typeof value.length === 'number') {
                // It's an array
                var roundedValues = [];
                for (var i = 0; i < value.length; i++) {
                    roundedValues.push(Math.round(value[i]));
                }
                return roundedValues.join(", ");
            } else if (typeof value === "number") {
                return Math.round(value);
            } else if (typeof value === "string") {
                return '"' + value + '"';
            } else if (typeof value === "object") {
                if (value.toString) {
                    return value.toString();
                } else {
                    return Object.prototype.toString.call(value);
                }
            } else {
                return String(value);
            }
        } catch (err) {
            alert("Error in formatPropertyValue: " + err.message);
            return "Unknown Value";
        }
    }

    function createUI(thisObj) {
        var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Add Markers", undefined, { resizeable: true });

        var res = "group { \
            orientation: 'column', \
            alignment: ['fill', 'fill'], \
            alignChildren: ['fill', 'fill'], \
            button: Button { text: 'Add Markers at Keyframes' } \
        }";

        myPanel.grp = myPanel.add(res);

        myPanel.layout.layout(true);

        myPanel.grp.button.onClick = function() {
            try {
                addMarkersAtKeyframes();
            } catch (err) {
                alert("An error occurred: " + err.message);
            }
        };

        return myPanel;
    }

    var myScriptPal = createUI(this);
    if (myScriptPal instanceof Window) {
        myScriptPal.center();
        myScriptPal.show();
    }
}
