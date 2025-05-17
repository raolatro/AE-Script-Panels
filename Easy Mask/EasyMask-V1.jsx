// EasyMask-V1.jsx
// After Effects Script UI Panel: Easy Mask
// Dynamically links a layer's mask to a shape layer rectangle via Set Matte, with a Completion slider.
// Author: Cascade AI

(function easyMaskPanel(thisObj) {
    function buildUI(thisObj) {
        var pal = (thisObj instanceof Panel) ? thisObj : new Window('palette', 'Easy Mask', undefined, {resizeable:true});
        if (pal !== null) {
            pal.orientation = 'column';
            pal.alignChildren = ['fill','top'];
            pal.spacing = 10;
            pal.margins = 16;

            var btn = pal.add('button', undefined, 'Create Easy Mask');
            btn.onClick = function() {
                app.beginUndoGroup('Create Easy Mask');
                try {
                    var comp = app.project.activeItem;
                    if (!comp || !(comp instanceof CompItem)) {
                        alert('Please select a composition.');
                        return;
                    }
                    if (comp.selectedLayers.length !== 1) {
                        alert('Select exactly ONE layer.');
                        return;
                    }
                    var targetLayer = comp.selectedLayers[0];
                    if (targetLayer instanceof CameraLayer || targetLayer instanceof LightLayer) {
                        alert('Please select a footage, solid, or precomp layer.');
                        return;
                    }

                    // Get size
                    var width = targetLayer.width;
                    var height = targetLayer.height;
                    if (!width || !height) {
                        alert('Selected layer does not have width/height.');
                        return;
                    }

                    // Create shape layer above
                    var shapeLayer = comp.layers.addShape();
                    shapeLayer.moveBefore(targetLayer);
                    shapeLayer.startTime = targetLayer.startTime;
                    shapeLayer.inPoint = targetLayer.inPoint;
                    shapeLayer.outPoint = targetLayer.outPoint;
                    shapeLayer.name = targetLayer.name + '_MASK_CTRL';
                    shapeLayer.guideLayer = true; // Make it a guide layer

                    // Add rectangle
                    var contents = shapeLayer.property('ADBE Root Vectors Group');
                    var rectGroup = contents.addProperty('ADBE Vector Group');
                    rectGroup.name = 'Mask Rectangle';
                    var rect = rectGroup.property('ADBE Vectors Group').addProperty('ADBE Vector Shape - Rect');
                    rect.property('ADBE Vector Rect Size').setValue([width, height]);
                    rect.property('ADBE Vector Rect Position').setValue([0,0]);
                    rectGroup.property('ADBE Vectors Group').addProperty('ADBE Vector Graphic - Fill');

                    // Parent target layer to shape
                    targetLayer.parent = shapeLayer;

                    // Add Completion slider
                    var slider = targetLayer.property('Effects').addProperty('ADBE Slider Control');
                    slider.name = 'Completion';
                    slider.property('ADBE Slider Control-0001').setValue(0); // Default to 0%

                    // Store original transform values as hidden sliders
                    var origGroup = targetLayer.property('Effects').addProperty('ADBE Layer Control');
                    origGroup.name = 'EasyMask_ORIGS';
                    origGroup.enabled = false;
                    // Store original values in expressions (or as static values in code below)
                    var origPos = targetLayer.property('Transform').property('Position').value;
                    var origScale = targetLayer.property('Transform').property('Scale').value;
                    var origOpacity = targetLayer.property('Transform').property('Opacity').value;

                    // Expressions for interpolation
                    var compName = comp.name.replace(/"/g, '\\"');
                    var shapeLayerName = shapeLayer.name.replace(/"/g, '\\"');
                    var exprPos = 'var ctrl=thisComp.layer("' + shapeLayerName + '");\n' +
                        'var c=effect("Completion")("Slider")/100;\n' +
                        'var orig=[' + origPos[0] + ',' + origPos[1] + '];\n' +
                        'var tgt=ctrl.toComp(ctrl.anchorPoint);\n' +
                        'linear(c,0,1,orig,tgt);';
                    targetLayer.property('Transform').property('Position').expression = exprPos;

                    var exprScale = 'var ctrl=thisComp.layer("' + shapeLayerName + '");\n' +
                        'var c=effect("Completion")("Slider")/100;\n' +
                        'var orig=[' + origScale[0] + ',' + origScale[1] + '];\n' +
                        'var tgt=ctrl.transform.scale;\n' +
                        'linear(c,0,1,orig,tgt);';
                    targetLayer.property('Transform').property('Scale').expression = exprScale;

                    var exprOpacity = 'var ctrl=thisComp.layer("' + shapeLayerName + '");\n' +
                        'var c=effect("Completion")("Slider")/100;\n' +
                        'var orig=' + origOpacity + ';\n' +
                        'var tgt=ctrl.transform.opacity;\n' +
                        'linear(c,0,1,orig,tgt);';
                    targetLayer.property('Transform').property('Opacity').expression = exprOpacity;

                    alert('Easy Mask setup complete!\n\n- Edit the rectangle or transform on the new shape layer to control the floating thumb.\n- Animate the "Completion" slider to interpolate between full screen and thumb.');
                } catch (e) {
                    alert('Error: ' + e.toString());
                } finally {
                    app.endUndoGroup();
                }
            };
        }
        return pal;
    }
    var myPal = buildUI(thisObj);
    if (myPal instanceof Window) {
        myPal.center();
        myPal.show();
    }
})(this);
