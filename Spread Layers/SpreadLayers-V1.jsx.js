// SpreadLayers.jsx

{
    function createUI(thisObj) {
        var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Spread Layers", undefined, { resizeable: true });

        var res = 
        "group { \
            orientation:'column', alignment:['fill', 'fill'], alignChildren:['fill', 'top'], \
            btnSpread: Button { text:'Spread Layers', alignment:['fill', 'top'] } \
        }";

        myPanel.grp = myPanel.add(res);

        myPanel.grp.btnSpread.onClick = function () {
            alert("Button clicked");
            app.beginUndoGroup("Spread Layers");
            var comp = app.project.activeItem;
            if (!(comp && comp instanceof CompItem)) {
                alert("Please select a composition.");
                app.endUndoGroup();
                return;
            }
            var selectedLayers = comp.selectedLayers;
            if (selectedLayers.length === 0) {
                alert("Please select at least one layer.");
                app.endUndoGroup();
                return;
            }
            alert("Number of selected layers: " + selectedLayers.length);
            spreadLayers(selectedLayers);
            app.endUndoGroup();
        };

        myPanel.layout.layout(true);
        myPanel.layout.resize();
        return myPanel;
    }

    function getLayerBounds(layer) {
        var comp = layer.containingComp;
        var t = comp.time;
        var points = [
            [0, 0],
            [layer.width, 0],
            [layer.width, layer.height],
            [0, layer.height]
        ];
        var compPoints = [];
        for (var i = 0; i < points.length; i++) {
            var fromPoint = points[i];
            var toPoint = layer.toComp(fromPoint, t);
            compPoints.push(toPoint);
        }
        var minX = compPoints[0][0];
        var maxX = compPoints[0][0];
        var minY = compPoints[0][1];
        var maxY = compPoints[0][1];
        for (var i = 1; i < compPoints.length; i++) {
            minX = Math.min(minX, compPoints[i][0]);
            maxX = Math.max(maxX, compPoints[i][0]);
            minY = Math.min(minY, compPoints[i][1]);
            maxY = Math.max(maxY, compPoints[i][1]);
        }
        var width = maxX - minX;
        var height = maxY - minY;
        var centerX = minX + width / 2;
        var centerY = minY + height / 2;
        return { x: centerX, y: centerY, width: width, height: height };
    }

    function spreadLayers(layers) {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) return;

        var occupiedAreas = [];

        for (var i = 0; i < layers.length; i++) {
            var layer = layers[i];
            alert("Processing layer: " + layer.name);

            var positionProp = layer.property("Position");
            if (positionProp === null || positionProp.isHidden) {
                alert("Layer " + layer.name + " does not have an accessible Position property.");
                continue;
            }

            // Get layer bounds
            var bounds = getLayerBounds(layer);
            var width = bounds.width;
            var height = bounds.height;
            alert("Layer size - Width: " + width + ", Height: " + height);

            var originalPos = [bounds.x, bounds.y];
            var posX, posY;
            var tries = 0;
            var maxMove = comp.width / 5;

            do {
                posX = originalPos[0] + (Math.random() - 0.5) * maxMove;
                posY = originalPos[1] + (Math.random() - 0.5) * maxMove;

                posX = Math.max(width / 2, Math.min(comp.width - width / 2, posX));
                posY = Math.max(height / 2, Math.min(comp.height - height / 2, posY));

                tries++;
            } while (isOverlapping(posX, posY, width, height, occupiedAreas) && tries < 100);

            if (tries < 100) {
                positionProp.setValue([posX, posY]);
                occupiedAreas.push({ x: posX, y: posY, width: width, height: height });
                alert("Layer " + layer.name + " moved to X: " + posX + ", Y: " + posY);
            } else {
                alert("Could not find a non-overlapping position for layer " + layer.name);
            }
        }
    }

    function isOverlapping(x, y, w, h, areas) {
        for (var i = 0; i < areas.length; i++) {
            var area = areas[i];
            if (Math.abs(x - area.x) < (w + area.width) / 2 &&
                Math.abs(y - area.y) < (h + area.height) / 2) {
                return true;
            }
        }
        return false;
    }

    var myScriptPal = createUI(this);

    if (myScriptPal instanceof Window) {
        myScriptPal.center();
        myScriptPal.show();
    } else {
        myScriptPal.layout.layout(true);
    }
}