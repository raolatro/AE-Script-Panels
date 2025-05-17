{
    var win = (this instanceof Panel) ? this : new Window("palette", "Time Remap Tools", undefined, {resizeable:true});
    win.orientation = "column";
    win.alignChildren = "fill";
  
    // Basic Operations
    var grpBasic = win.add("panel", undefined, "Basic Operations");
    grpBasic.orientation = "column";
    grpBasic.alignChildren = "fill";
    var btnFix = grpBasic.add("button", undefined, "Fix Time Remap Keyframes");
    var btnFreeze = grpBasic.add("button", undefined, "Freeze Layer");
    var btnBatchFreeze = grpBasic.add("button", undefined, "Batch Freeze Layers");
  
    // Reverse & Loop
    var grpRevLoop = win.add("panel", undefined, "Reverse & Loop");
    grpRevLoop.orientation = "column";
    grpRevLoop.alignChildren = "fill";
    var btnReverse = grpRevLoop.add("button", undefined, "Reverse Playback");
    var btnPingPong = grpRevLoop.add("button", undefined, "Apply Ping Pong Loop Expression");
  
    // Easing & Offset
    var grpEaseOffset = win.add("panel", undefined, "Easing & Offset");
    grpEaseOffset.orientation = "column";
    grpEaseOffset.alignChildren = "fill";
    // Easing Controls
    var grpEasing = grpEaseOffset.add("group");
    grpEasing.orientation = "row";
    grpEasing.add("statictext", undefined, "Ease In:");
    var sldEaseIn = grpEasing.add("slider", undefined, 50, 0, 100);
    sldEaseIn.preferredSize.width = 100;
    var txtEaseIn = grpEasing.add("edittext", undefined, "50");
    txtEaseIn.characters = 4;
    var grpEaseOut = grpEaseOffset.add("group");
    grpEaseOut.orientation = "row";
    grpEaseOut.add("statictext", undefined, "Ease Out:");
    var sldEaseOut = grpEaseOut.add("slider", undefined, 50, 0, 100);
    sldEaseOut.preferredSize.width = 100;
    var txtEaseOut = grpEaseOut.add("edittext", undefined, "50");
    txtEaseOut.characters = 4;
    var btnApplyEasing = grpEaseOffset.add("button", undefined, "Apply Easing");
    // Offset Controls
    var grpOffset = grpEaseOffset.add("group");
    grpOffset.orientation = "row";
    grpOffset.add("statictext", undefined, "Offset (sec):");
    var edtOffset = grpOffset.add("edittext", undefined, "0");
    edtOffset.characters = 5;
    var btnOffset = grpEaseOffset.add("button", undefined, "Offset Keyframes");
  
    // Speed & Presets
    var grpSpeedPreset = win.add("panel", undefined, "Speed & Presets");
    grpSpeedPreset.orientation = "column";
    grpSpeedPreset.alignChildren = "fill";
    // Speed Controls
    var grpSpeed = grpSpeedPreset.add("group");
    grpSpeed.orientation = "row";
    grpSpeed.add("statictext", undefined, "Speed Factor:");
    var sldSpeed = grpSpeed.add("slider", undefined, 1, 0.1, 3);
    sldSpeed.preferredSize.width = 100;
    var txtSpeed = grpSpeed.add("edittext", undefined, "1");
    txtSpeed.characters = 4;
    var btnApplySpeed = grpSpeedPreset.add("button", undefined, "Apply Speed");
    // Preset Controls
    var grpPresets = grpSpeedPreset.add("group");
    grpPresets.orientation = "row";
    grpPresets.add("statictext", undefined, "Preset:");
    var ddPresets = grpPresets.add("dropdownlist", undefined, ["Freeze", "Reverse", "Ping Pong", "Ease", "Offset +0.5", "Slow Motion", "Fast Forward"]);
    ddPresets.selection = 0;
    var btnApplyPreset = grpPresets.add("button", undefined, "Apply Preset");
  
    // Sync slider values with edittexts
    sldEaseIn.onChanging = function() { txtEaseIn.text = Math.round(sldEaseIn.value).toString(); };
    sldEaseOut.onChanging = function() { txtEaseOut.text = Math.round(sldEaseOut.value).toString(); };
    sldSpeed.onChanging = function() { txtSpeed.text = sldSpeed.value.toFixed(2).toString(); };
  
    // Utility: Get selected layers
    function getSelectedLayers() {
      var comp = app.project.activeItem;
      if (!(comp && comp instanceof CompItem)) return null;
      return comp.selectedLayers.length > 0 ? comp.selectedLayers : null;
    }
  
    // Fix Time Remap Keyframes
    function fixTimeRemapKeyframes(layer) {
      var inPoint = layer.inPoint, outPoint = layer.outPoint;
      if (!layer.timeRemapEnabled) layer.timeRemapEnabled = true;
      var timeRemap = layer.property("ADBE Time Remapping");
      var keyExistsAtIn = false, keyExistsAtOut = false;
      for (var i = 1; i <= timeRemap.numKeys; i++) {
        var t = timeRemap.keyTime(i);
        if (Math.abs(t - inPoint) < 0.001) keyExistsAtIn = true;
        if (Math.abs(t - outPoint) < 0.001) keyExistsAtOut = true;
      }
      if (!keyExistsAtIn) timeRemap.addKey(inPoint);
      if (!keyExistsAtOut) timeRemap.addKey(outPoint);
      for (var i = timeRemap.numKeys; i >= 1; i--) {
        var t = timeRemap.keyTime(i);
        if (t < inPoint - 0.001 || t > outPoint + 0.001) timeRemap.removeKey(i);
      }
    }
  
    // Freeze Layer (single)
    function freezeLayer(layer, freezeTime) {
      if (!layer.timeRemapEnabled) layer.timeRemapEnabled = true;
      var timeRemap = layer.property("ADBE Time Remapping");
      var exists = false;
      for (var i = 1; i <= timeRemap.numKeys; i++) {
        if (Math.abs(timeRemap.keyTime(i) - freezeTime) < 0.001) { exists = true; break; }
      }
      if (!exists) timeRemap.addKey(freezeTime);
      for (var i = timeRemap.numKeys; i >= 1; i--) {
        if (Math.abs(timeRemap.keyTime(i) - freezeTime) > 0.001) timeRemap.removeKey(i);
      }
    }
  
    // Reverse Playback
    function reversePlayback(layer) {
      if (!layer.timeRemapEnabled) layer.timeRemapEnabled = true;
      var timeRemap = layer.property("ADBE Time Remapping");
      if (timeRemap.numKeys < 2) return;
      var firstVal = timeRemap.keyValue(1);
      var lastVal = timeRemap.keyValue(timeRemap.numKeys);
      for (var i = 1; i <= timeRemap.numKeys; i++) {
        var oldVal = timeRemap.keyValue(i);
        timeRemap.setValueAtKey(i, firstVal + lastVal - oldVal);
      }
    }
  
    // Apply Ping Pong Loop Expression
    function applyPingPong(layer) {
      if (!layer.timeRemapEnabled) layer.timeRemapEnabled = true;
      layer.property("ADBE Time Remapping").expression = "loopOut('pingpong')";
    }
  
    // Apply Easing
    function applyEasing(layer, easeInInfluence, easeOutInfluence) {
      if (!layer.timeRemapEnabled) layer.timeRemapEnabled = true;
      var timeRemap = layer.property("ADBE Time Remapping"), numKeys = timeRemap.numKeys;
      if (numKeys < 1) return;
      for (var i = 1; i <= numKeys; i++) {
        var inEase = [], outEase = [];
        if (i > 1) inEase.push(new KeyframeEase(0, easeInInfluence));
        if (i < numKeys) outEase.push(new KeyframeEase(0, easeOutInfluence));
        timeRemap.setTemporalEaseAtKey(i, inEase, outEase);
      }
    }
  
    // Offset Keyframes
    function offsetKeyframes(layer, offset) {
      if (!layer.timeRemapEnabled) layer.timeRemapEnabled = true;
      var timeRemap = layer.property("ADBE Time Remapping"), numKeys = timeRemap.numKeys;
      if (numKeys < 1) return;
      var keys = [];
      for (var i = 1; i <= numKeys; i++) {
        keys.push({ t: timeRemap.keyTime(i), v: timeRemap.keyValue(i), inEase: timeRemap.keyInTemporalEase(i), outEase: timeRemap.keyOutTemporalEase(i) });
      }
      for (var i = numKeys; i >= 1; i--) timeRemap.removeKey(i);
      for (var i = 0; i < keys.length; i++) {
        var newKey = timeRemap.addKey(keys[i].t + offset);
        timeRemap.setValueAtKey(newKey, keys[i].v);
        timeRemap.setTemporalEaseAtKey(newKey, keys[i].inEase, keys[i].outEase);
      }
    }
  
    // Apply Speed
    function applySpeed(layer, speedFactor) {
      if (!layer.timeRemapEnabled) layer.timeRemapEnabled = true;
      var timeRemap = layer.property("ADBE Time Remapping"), numKeys = timeRemap.numKeys;
      if (numKeys < 1) return;
      var firstVal = timeRemap.keyValue(1);
      for (var i = 1; i <= numKeys; i++) {
        var oldVal = timeRemap.keyValue(i);
        timeRemap.setValueAtKey(i, firstVal + (oldVal - firstVal) / speedFactor);
      }
    }
  
    // Presets
    function applyPreset(presetName, layers) {
      for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        if (presetName === "Freeze") {
          freezeLayer(layer, app.project.activeItem.time);
        } else if (presetName === "Reverse") {
          reversePlayback(layer);
        } else if (presetName === "Ping Pong") {
          applyPingPong(layer);
        } else if (presetName === "Ease") {
          applyEasing(layer, parseFloat(txtEaseIn.text), parseFloat(txtEaseOut.text));
        } else if (presetName === "Offset +0.5") {
          offsetKeyframes(layer, 0.5);
        } else if (presetName === "Slow Motion") {
          applySpeed(layer, 2);
        } else if (presetName === "Fast Forward") {
          applySpeed(layer, 0.5);
        }
      }
    }
  
    // Button Handlers
    btnFix.onClick = function() {
      app.beginUndoGroup("Fix Time Remap");
      var layers = getSelectedLayers();
      if (layers) {
        for (var i = 0; i < layers.length; i++) fixTimeRemapKeyframes(layers[i]);
      }
      app.endUndoGroup();
    };
  
    btnFreeze.onClick = function() {
      app.beginUndoGroup("Freeze Layer");
      var comp = app.project.activeItem;
      if (comp && comp instanceof CompItem && comp.selectedLayers.length === 1) {
        freezeLayer(comp.selectedLayers[0], comp.time);
      }
      app.endUndoGroup();
    };
  
    btnBatchFreeze.onClick = function() {
      app.beginUndoGroup("Batch Freeze Layers");
      var layers = getSelectedLayers();
      if (layers) {
        var freezeTime = app.project.activeItem.time;
        for (var i = 0; i < layers.length; i++) freezeLayer(layers[i], freezeTime);
      }
      app.endUndoGroup();
    };
  
    btnReverse.onClick = function() {
      app.beginUndoGroup("Reverse Playback");
      var layers = getSelectedLayers();
      if (layers) {
        for (var i = 0; i < layers.length; i++) reversePlayback(layers[i]);
      }
      app.endUndoGroup();
    };
  
    btnPingPong.onClick = function() {
      app.beginUndoGroup("Ping Pong Loop");
      var layers = getSelectedLayers();
      if (layers) {
        for (var i = 0; i < layers.length; i++) applyPingPong(layers[i]);
      }
      app.endUndoGroup();
    };
  
    btnApplyEasing.onClick = function() {
      app.beginUndoGroup("Apply Easing");
      var layers = getSelectedLayers();
      if (layers) {
        var easeIn = parseFloat(txtEaseIn.text), easeOut = parseFloat(txtEaseOut.text);
        for (var i = 0; i < layers.length; i++) applyEasing(layers[i], easeIn, easeOut);
      }
      app.endUndoGroup();
    };
  
    btnOffset.onClick = function() {
      app.beginUndoGroup("Offset Keyframes");
      var layers = getSelectedLayers();
      if (layers) {
        var offsetVal = parseFloat(edtOffset.text);
        for (var i = 0; i < layers.length; i++) offsetKeyframes(layers[i], offsetVal);
      }
      app.endUndoGroup();
    };
  
    btnApplySpeed.onClick = function() {
      app.beginUndoGroup("Apply Speed");
      var layers = getSelectedLayers();
      if (layers) {
        var speed = parseFloat(txtSpeed.text);
        for (var i = 0; i < layers.length; i++) applySpeed(layers[i], speed);
      }
      app.endUndoGroup();
    };
  
    btnApplyPreset.onClick = function() {
      app.beginUndoGroup("Apply Preset");
      var layers = getSelectedLayers();
      if (layers) {
        applyPreset(ddPresets.selection.text, layers);
      }
      app.endUndoGroup();
    };
  
    win.layout.layout(true);
    win.layout.resize();
    if (win instanceof Window) { win.center(); win.show(); }
  }