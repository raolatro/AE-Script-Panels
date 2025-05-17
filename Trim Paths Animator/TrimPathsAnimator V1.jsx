// TrimPathsAnimator.jsx
// Save this script in the ScriptUI Panels folder for After Effects

(function (thisObj) {
    function TrimPathsAnimator(thisObj) {
        var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "TrimPaths Animator", undefined, { resizeable: true });

        win.orientation = "column";
        win.alignChildren = ["fill", "top"];

        // Buttons Group
        var buttonsGroup = win.add("group");
        buttonsGroup.orientation = "row";
        buttonsGroup.alignChildren = ["fill", "fill"];
        buttonsGroup.spacing = 5;

        var inButton = buttonsGroup.add("button", undefined, "IN");
        var outButton = buttonsGroup.add("button", undefined, "OUT");
        var loopButton = buttonsGroup.add("button", undefined, "LOOP");

        // Ensure buttons share equal width
        inButton.preferredSize.width = outButton.preferredSize.width = loopButton.preferredSize.width = 0;

        // Ease Input
        var easeGroup = win.add("group");
        easeGroup.orientation = "row";
        easeGroup.alignChildren = ["fill", "center"];
        easeGroup.spacing = 5;

        var easeLabel = easeGroup.add("statictext", undefined, "Ease:");
        var easeInput = easeGroup.add("edittext", undefined, "70");
        easeInput.characters = 5;
        easeInput.alignment = ["fill", "fill"];

        // Offset Input
        var offsetGroup = win.add("group");
        offsetGroup.orientation = "row";
        offsetGroup.alignChildren = ["fill", "center"];
        offsetGroup.spacing = 5;

        var offsetLabel = offsetGroup.add("statictext", undefined, "Offset:");
        var offsetInput = offsetGroup.add("edittext", undefined, "0");
        offsetInput.characters = 5;
        offsetInput.alignment = ["fill", "fill"];

        // Animate Button
        var animateButton = win.add("button", undefined, "ANIMATE");
        animateButton.alignment = ["fill", "fill"];

        // Event Listeners
        inButton.onClick = function () { addMarker("IN"); };
        outButton.onClick = function () { addMarker("OUT"); };
        loopButton.onClick = function () { addMarker("LOOP"); };
        animateButton.onClick = function () { animate(); };

        // Resize Event Handler
        win.onResizing = win.onResize = function () {
            this.layout.resize();
        };

        // Functions
        function addMarker(markerName) {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                alert("Please select a composition.");
                return;
            }
            var time = comp.time;
            app.beginUndoGroup("Add Marker");
            var layers = comp.selectedLayers;
            if (layers.length === 0) {
                alert("Please select at least one layer.");
                app.endUndoGroup();
                return;
            }
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                var marker = new MarkerValue(markerName);
                marker.duration = 0; // Default duration
                layer.property("Marker").setValueAtTime(time, marker);
            }
            app.endUndoGroup();
        }

        function animate() {
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                alert("Please select a composition.");
                return;
            }
            var easeValue = parseFloat(easeInput.text);
            var offsetValue = parseFloat(offsetInput.text);
            if (isNaN(easeValue)) easeValue = 70;
            if (isNaN(offsetValue)) offsetValue = 0;
            app.beginUndoGroup("Trim Paths Animate");
            var layers = comp.selectedLayers;
            if (layers.length === 0) {
                alert("Please select at least one shape layer.");
                app.endUndoGroup();
                return;
            }
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];

                // Check for existing markers
                var hasMarkers = layer.property("Marker").numKeys > 0;

                // If no markers, add default markers
                if (!hasMarkers) {
                    addDefaultMarkers(layer);
                }

                addTrimPathsAndExpressions(layer, easeValue, offsetValue);
            }
            app.endUndoGroup();
        }

        function addDefaultMarkers(layer) {
            var inPoint = layer.inPoint;

            // IN marker at layer's inPoint with duration 1 second
            var inMarker = new MarkerValue("IN");
            inMarker.duration = 1;
            layer.property("Marker").setValueAtTime(inPoint, inMarker);

            // OUT marker 1 second after inPoint with duration 1 second
            var outMarkerTime = inPoint + 1;
            var outMarker = new MarkerValue("OUT");
            outMarker.duration = 1;
            layer.property("Marker").setValueAtTime(outMarkerTime, outMarker);

            // LOOP marker 2 seconds after the end of OUT marker duration
            var loopMarkerTime = outMarkerTime + outMarker.duration + 2;
            var loopMarker = new MarkerValue("LOOP");
            layer.property("Marker").setValueAtTime(loopMarkerTime, loopMarker);
        }

        function addTrimPathsAndExpressions(layer, easeValue, offsetValue) {
            // Check if layer is a shape layer
            if (!(layer instanceof ShapeLayer)) {
                alert("Layer '" + layer.name + "' is not a shape layer.");
                return;
            }
            // Add Trim Paths operator if it doesn't exist
            var contents = layer.property("Contents");
            var trimPathsGroup = null;

            // Search for existing Trim Paths
            for (var i = 1; i <= contents.numProperties; i++) {
                var prop = contents.property(i);
                if (prop.matchName === "ADBE Vector Filter - Trim") {
                    trimPathsGroup = prop;
                    break;
                }
            }
            // If not found, add it
            if (!trimPathsGroup) {
                trimPathsGroup = contents.addProperty("ADBE Vector Filter - Trim");
                trimPathsGroup.name = "Trim Path (Dynamic Rao)";
                trimPathsGroup.moveTo(1); // Move to top
            } else {
                // Rename the Trim Paths operator
                trimPathsGroup.name = "Trim Path (Dynamic Rao)";
            }

            // Set Offset property
            trimPathsGroup.property("Offset").setValue(offsetValue);

            // Add Slider Control for Ease if it doesn't exist
            var effects = layer.property("ADBE Effect Parade");
            if (!effects) {
                effects = layer.addProperty("ADBE Effect Parade");
            }
            var easeEffect = effects.property("Ease");
            if (!easeEffect) {
                easeEffect = effects.addProperty("ADBE Slider Control");
                easeEffect.name = "Ease";
                easeEffect.property("Slider").setValue(easeValue);
            } else {
                easeEffect.property("Slider").setValue(easeValue);
            }

            // Expressions for Start and End properties
            var startExpr =
                "var markers = thisLayer.marker;\n" +
                "var startValue = 100;\n" +
                "var easePercent = effect(\"Ease\")(\"Slider\") / 100;\n" +
                "function customEaseOut(t) {\n" +
                "    if (easePercent == 0) {\n" +
                "        return t;\n" +
                "    } else if (easePercent == 1) {\n" +
                "        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);\n" +
                "    } else {\n" +
                "        var linearT = t;\n" +
                "        var expoT = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);\n" +
                "        return linearT * (1 - easePercent) + expoT * easePercent;\n" +
                "    }\n" +
                "}\n" +
                "var inMarkers = [];\n" +
                "for (var i = 1; i <= markers.numKeys; i++) {\n" +
                "    var m = markers.key(i);\n" +
                "    if (m.comment == \"IN\") {\n" +
                "        inMarkers.push(m);\n" +
                "    }\n" +
                "}\n" +
                "var loopTime = null;\n" +
                "for (var i = 1; i <= markers.numKeys; i++) {\n" +
                "    var m = markers.key(i);\n" +
                "    if (m.comment == \"LOOP\") {\n" +
                "        loopTime = m.time;\n" +
                "        break;\n" +
                "    }\n" +
                "}\n" +
                "inMarkers.sort(function(a, b) { return a.time - b.time; });\n" +
                "var mStart, mDuration, mEnd;\n" +
                "for (var i = 0; i < inMarkers.length; i++) {\n" +
                "    var m = inMarkers[i];\n" +
                "    mStart = m.time;\n" +
                "    mDuration = m.duration;\n" +
                "    mEnd = mStart + mDuration;\n" +
                "    if (loopTime !== null && mStart >= loopTime) {\n" +
                "        break;\n" +
                "    }\n" +
                "    if (time >= mStart && time <= mEnd) {\n" +
                "        var t = (time - mStart) / mDuration;\n" +
                "        t = Math.min(Math.max(t, 0), 1);\n" +
                "        var easedT = customEaseOut(t);\n" +
                "        startValue = easedT * -100 + 100;\n" +
                "        break;\n" +
                "    } else if (time > mEnd) {\n" +
                "        startValue = 0;\n" +
                "    } else if (time < mStart) {\n" +
                "        startValue = 100;\n" +
                "        break;\n" +
                "    }\n" +
                "}\n" +
                "if (loopTime !== null && time >= loopTime) {\n" +
                "    var lastInMarker = null;\n" +
                "    var lastOutMarker = null;\n" +
                "    for (var i = markers.numKeys; i >= 1; i--) {\n" +
                "        var m = markers.key(i);\n" +
                "        if (m.time < loopTime) {\n" +
                "            if (m.comment == \"OUT\" && lastOutMarker == null) {\n" +
                "                lastOutMarker = m;\n" +
                "            } else if (m.comment == \"IN\" && lastInMarker == null) {\n" +
                "                lastInMarker = m;\n" +
                "            }\n" +
                "            if (lastInMarker && lastOutMarker) {\n" +
                "                break;\n" +
                "            }\n" +
                "        }\n" +
                "    }\n" +
                "    if (lastInMarker && lastOutMarker) {\n" +
                "        var loopDuration = lastOutMarker.time + lastOutMarker.duration - lastInMarker.time;\n" +
                "        var timeInLoop = (time - loopTime) % loopDuration;\n" +
                "        time = lastInMarker.time + timeInLoop;\n" +
                "        mStart = lastInMarker.time;\n" +
                "        mDuration = lastInMarker.duration;\n" +
                "        mEnd = mStart + mDuration;\n" +
                "        if (time >= mStart && time <= mEnd) {\n" +
                "            var t = (time - mStart) / mDuration;\n" +
                "            t = Math.min(Math.max(t, 0), 1);\n" +
                "            var easedT = customEaseOut(t);\n" +
                "            startValue = easedT * -100 + 100;\n" +
                "        } else if (time > mEnd) {\n" +
                "            startValue = 0;\n" +
                "        } else if (time < mStart) {\n" +
                "            startValue = 100;\n" +
                "        }\n" +
                "    }\n" +
                "}\n" +
                "startValue;\n";

            var endExpr =
                "var markers = thisLayer.marker;\n" +
                "var endValue = 100;\n" +
                "var easePercent = effect(\"Ease\")(\"Slider\") / 100;\n" +
                "function customEaseIn(t) {\n" +
                "    if (easePercent == 0) {\n" +
                "        return t;\n" +
                "    } else if (easePercent == 1) {\n" +
                "        return t === 0 ? 0 : Math.pow(2, 10 * (t - 1));\n" +
                "    } else {\n" +
                "        var linearT = t;\n" +
                "        var expoT = t === 0 ? 0 : Math.pow(2, 10 * (t - 1));\n" +
                "        return linearT * (1 - easePercent) + expoT * easePercent;\n" +
                "    }\n" +
                "}\n" +
                "var outMarkers = [];\n" +
                "for (var i = 1; i <= markers.numKeys; i++) {\n" +
                "    var m = markers.key(i);\n" +
                "    if (m.comment == \"OUT\") {\n" +
                "        outMarkers.push(m);\n" +
                "    }\n" +
                "}\n" +
                "var loopTime = null;\n" +
                "for (var i = 1; i <= markers.numKeys; i++) {\n" +
                "    var m = markers.key(i);\n" +
                "    if (m.comment == \"LOOP\") {\n" +
                "        loopTime = m.time;\n" +
                "        break;\n" +
                "    }\n" +
                "}\n" +
                "outMarkers.sort(function(a, b) { return a.time - b.time; });\n" +
                "var mStart, mDuration, mEnd;\n" +
                "for (var i = 0; i < outMarkers.length; i++) {\n" +
                "    var m = outMarkers[i];\n" +
                "    mStart = m.time;\n" +
                "    mDuration = m.duration;\n" +
                "    mEnd = mStart + mDuration;\n" +
                "    if (loopTime !== null && mStart >= loopTime) {\n" +
                "        break;\n" +
                "    }\n" +
                "    if (time >= mStart && time <= mEnd) {\n" +
                "        var t = (time - mStart) / mDuration;\n" +
                "        t = Math.min(Math.max(t, 0), 1);\n" +
                "        var easedT = customEaseIn(t);\n" +
                "        endValue = easedT * -100 + 100;\n" +
                "        break;\n" +
                "    } else if (time > mEnd) {\n" +
                "        endValue = 0;\n" +
                "    } else if (time < mStart) {\n" +
                "        endValue = 100;\n" +
                "        break;\n" +
                "    }\n" +
                "}\n" +
                "if (loopTime !== null && time >= loopTime) {\n" +
                "    var lastInMarker = null;\n" +
                "    var lastOutMarker = null;\n" +
                "    for (var i = markers.numKeys; i >= 1; i--) {\n" +
                "        var m = markers.key(i);\n" +
                "        if (m.time < loopTime) {\n" +
                "            if (m.comment == \"OUT\" && lastOutMarker == null) {\n" +
                "                lastOutMarker = m;\n" +
                "            } else if (m.comment == \"IN\" && lastInMarker == null) {\n" +
                "                lastInMarker = m;\n" +
                "            }\n" +
                "            if (lastInMarker && lastOutMarker) {\n" +
                "                break;\n" +
                "            }\n" +
                "        }\n" +
                "    }\n" +
                "    if (lastInMarker && lastOutMarker) {\n" +
                "        var loopDuration = lastOutMarker.time + lastOutMarker.duration - lastInMarker.time;\n" +
                "        var timeInLoop = (time - loopTime) % loopDuration;\n" +
                "        time = lastInMarker.time + timeInLoop;\n" +
                "        mStart = lastOutMarker.time;\n" +
                "        mDuration = lastOutMarker.duration;\n" +
                "        mEnd = mStart + mDuration;\n" +
                "        if (time >= mStart && time <= mEnd) {\n" +
                "            var t = (time - mStart) / mDuration;\n" +
                "            t = Math.min(Math.max(t, 0), 1);\n" +
                "            var easedT = customEaseIn(t);\n" +
                "            endValue = easedT * -100 + 100;\n" +
                "        } else if (time > mEnd) {\n" +
                "            endValue = 0;\n" +
                "        } else if (time < mStart) {\n" +
                "            endValue = 100;\n" +
                "        }\n" +
                "    }\n" +
                "}\n" +
                "endValue;\n";

            // Apply expressions
            var startProp = trimPathsGroup.property("Start");
            var endProp = trimPathsGroup.property("End");

            startProp.expression = startExpr;
            endProp.expression = endExpr;
        }

        // Show the UI
        if (win instanceof Window) {
            win.center();
            win.show();
        } else {
            win.layout.layout(true);
            win.onResizing = win.onResize = function () {
                this.layout.resize();
            };
        }
    }

    // Run the script
    TrimPathsAnimator(thisObj);

})(this);