(function(){
  // Use Popup controls instead of Dropdown controls for custom naming
  var win = (this instanceof Panel) ? this : new Window("palette", "Marker Text Updater", undefined, {resizeable:true});
  win.alignChildren = ["fill", "top"];

  //────────────────────────────
  // Source Texts Section
  var srcPanel = win.add("panel", undefined, "Source Texts");
  srcPanel.alignChildren = ["fill", "top"];
  var updateExprBtn = srcPanel.add("button", undefined, "Update Expressions");

  //────────────────────────────
  // Animation Section
  var animPanel = win.add("panel", undefined, "Animation");
  animPanel.alignChildren = ["fill", "top"];

  // Mode: Animated vs Static
  var animModeGrp = animPanel.add("group");
  animModeGrp.orientation = "row";
  animModeGrp.alignChildren = ["left", "center"];
  var animatedRadio = animModeGrp.add("radiobutton", undefined, "Animated");
  var staticRadio = animModeGrp.add("radiobutton", undefined, "Static");
  staticRadio.value = true;

  // Settings Group – arranged with labels left, selections right
  var animSettingsGrp = animPanel.add("group");
  animSettingsGrp.orientation = "column";
  animSettingsGrp.visible = false;
  animSettingsGrp.alignChildren = ["fill", "top"];

  // Animation Preset row (using Popup Control)
  var presetGrp = animSettingsGrp.add("group");
  presetGrp.orientation = "row";
  presetGrp.alignChildren = ["left", "center"];
  presetGrp.add("statictext", undefined, "Animation Preset:");
  var animTypeDD = presetGrp.add("dropdownlist", undefined, ["Scale", "Opacity", "Type"]);
  animTypeDD.selection = 0;

  // Type By row (only for Type preset) using Popup style later in effect controls
  var typeByGrp = animSettingsGrp.add("group");
  typeByGrp.orientation = "row";
  typeByGrp.alignChildren = ["left", "center"];
  typeByGrp.add("statictext", undefined, "Type By:");
  var typeByDD = typeByGrp.add("dropdownlist", undefined, ["Character", "Word", "Lines"]);
  typeByDD.selection = 0;
  typeByGrp.visible = false;

  // Easing row (using Popup Control)
  var easeGrp = animSettingsGrp.add("group");
  easeGrp.orientation = "row";
  easeGrp.alignChildren = ["left", "center"];
  easeGrp.add("statictext", undefined, "Easing:");
  var easeDD = easeGrp.add("dropdownlist", undefined, ["Linear", "Quad", "Expo"]);
  easeDD.selection = 0;

  var animateBtn = animSettingsGrp.add("button", undefined, "Apply Animation");

  //────────────────────────────
  // Edit Markers Section
  var editPanel = win.add("panel", undefined, "Edit Markers");
  editPanel.alignChildren = ["fill", "top"];

  var layerSelectGrp = editPanel.add("group");
  layerSelectGrp.orientation = "row";
  layerSelectGrp.alignChildren = ["left", "center"];
  layerSelectGrp.add("statictext", undefined, "Text Layer:");
  var textLayerDD = layerSelectGrp.add("dropdownlist", undefined, []);
  textLayerDD.preferredSize.width = 150;
  var reloadMarkersBtn = layerSelectGrp.add("button", undefined, "Reload Markers");

  var markerList = editPanel.add("listbox", undefined, "", {multiselect:false});
  markerList.preferredSize = [300, 100];

  var markerEditGrp = editPanel.add("group");
  markerEditGrp.orientation = "row";
  markerEditGrp.alignChildren = ["left", "center"];
  markerEditGrp.add("statictext", undefined, "Marker Text:");
  var markerEdit = markerEditGrp.add("edittext", undefined, "");
  markerEdit.preferredSize = [200, 25];

  var saveMarkerBtn = editPanel.add("button", undefined, "Save Marker");

  //────────────────────────────
  // Bottom Info Section
  var bottomGrp = win.add("group");
  bottomGrp.orientation = "row";
  bottomGrp.alignChildren = ["left", "center"];
  var explainer = bottomGrp.add("statictext", undefined, "Updates text layers, applies animation expressions using marker durations and effect controls, and allows marker editing.");
  var infoBtn = bottomGrp.add("button", undefined, "?");
  infoBtn.preferredSize = [25,25];

  //────────────────────────────
  // Responsive layout
  win.onResizing = win.onResize = function(){ this.layout.resize(); };

  //────────────────────────────
  // UI Events

  animatedRadio.onClick = function(){
    animSettingsGrp.visible = true;
    alert("Animated mode selected. Animation settings visible.");
  };
  staticRadio.onClick = function(){
    animSettingsGrp.visible = false;
    alert("Static mode selected. Animation settings hidden.");
  };

  animTypeDD.onChange = function(){
    alert("Animation Preset changed to: " + animTypeDD.selection.text);
    if(animTypeDD.selection.text === "Type"){
      typeByGrp.visible = true;
      alert("Type By dropdown visible.");
    } else {
      typeByGrp.visible = false;
      alert("Type By dropdown hidden.");
    }
  };

  function formatTime(t, frameRate){
    var totalFrames = Math.round(t * frameRate);
    var minutes = Math.floor(totalFrames/(60*frameRate));
    var seconds = Math.floor((totalFrames/frameRate)%60);
    var frames = totalFrames % Math.round(frameRate);
    function pad(n){ return n < 10 ? "0" + n : ""+n; }
    return pad(minutes)+":"+pad(seconds)+":"+pad(frames);
  }

  function populateTextLayerDropdown(){
    textLayerDD.removeAll();
    var comp = app.project.activeItem;
    if(!(comp && comp instanceof CompItem)){
      alert("Please select or open a composition.");
      return;
    }
    for(var i = 1; i <= comp.numLayers; i++){
      var layer = comp.layer(i);
      if(layer.property("Source Text")){
        var markerProp = layer.property("Marker");
        var hasValid = false;
        if(markerProp && markerProp.numKeys > 0){
          for(var k = 1; k <= markerProp.numKeys; k++){
            if(markerProp.keyValue(k).comment != ""){
              hasValid = true;
              break;
            }
          }
        }
        if(hasValid){
          textLayerDD.add("item", layer.name);
          alert("Text layer added to dropdown: " + layer.name);
        }
      }
    }
    if(textLayerDD.items.length > 0){
      textLayerDD.selection = 0;
      alert("Text layer dropdown populated with " + textLayerDD.items.length + " item(s).");
    }
  }
  populateTextLayerDropdown();

  textLayerDD.onChange = function(){
    alert("Text layer selected: " + textLayerDD.selection.text);
    loadMarkers();
  };

  function loadMarkers(){
    markerList.removeAll();
    var comp = app.project.activeItem;
    if(!(comp && comp instanceof CompItem)){
      alert("Please select or open a composition.");
      return;
    }
    if(!textLayerDD.selection){
      alert("Select a text layer from the dropdown.");
      return;
    }
    var selName = textLayerDD.selection.text, selLayer;
    for(var i = 1; i <= comp.numLayers; i++){
      var layer = comp.layer(i);
      if(layer.name === selName && layer.property("Source Text")){
        selLayer = layer;
        break;
      }
    }
    if(!selLayer){
      alert("Selected text layer not found.");
      return;
    }
    var markerProp = selLayer.property("Marker");
    if(markerProp.numKeys < 1){
      alert("Selected layer has no markers.");
      return;
    }
    for(var k = 1; k <= markerProp.numKeys; k++){
      var marker = markerProp.keyValue(k);
      if(marker.comment != ""){
        var tStr = formatTime(markerProp.keyTime(k), comp.frameRate);
        markerList.add("item", tStr + " : " + marker.comment);
      }
    }
    alert("Markers loaded for layer: " + selLayer.name);
  }

  reloadMarkersBtn.onClick = function(){
    alert("Reload Markers button clicked.");
    loadMarkers();
  };

  markerList.onChange = function(){
    if(markerList.selection){
      var parts = markerList.selection.text.split(" : ");
      markerEdit.text = parts[1] || "";
      alert("Marker selected with text: " + markerEdit.text);
    }
  };

  saveMarkerBtn.onClick = function(){
    alert("Save Marker button clicked.");
    var comp = app.project.activeItem;
    if(!(comp && comp instanceof CompItem)){
      alert("Please select or open a composition.");
      return;
    }
    if(!textLayerDD.selection){
      alert("Select a text layer from the dropdown.");
      return;
    }
    var selName = textLayerDD.selection.text, selLayer;
    for(var i = 1; i <= comp.numLayers; i++){
      var layer = comp.layer(i);
      if(layer.name === selName && layer.property("Source Text")){
        selLayer = layer;
        break;
      }
    }
    if(!selLayer){
      alert("Selected text layer not found.");
      return;
    }
    var markerProp = selLayer.property("Marker");
    if(!markerList.selection){
      alert("No marker selected.");
      return;
    }
    var index = markerList.selection.index + 1;
    var marker = markerProp.keyValue(index);
    marker.comment = markerEdit.text;
    markerProp.setValueAtKey(index, marker);
    alert("Marker " + index + " updated with new text: " + marker.comment);
    loadMarkers();
  };

  updateExprBtn.onClick = function(){
    alert("Update Expressions button clicked.");
    app.beginUndoGroup("Update Marker Text Expression");
    var comp = app.project.activeItem;
    if(!(comp && comp instanceof CompItem)){
      alert("Please select or open a composition.");
      return;
    }
    var layers = comp.selectedLayers;
    if(layers.length === 0){
      alert("Select at least one layer.");
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
      alert("Updated expression on layer: " + layer.name);
    }
    app.endUndoGroup();
    alert("Source Text expressions updated.");
  };

  animateBtn.onClick = function(){
    alert("Apply Animation button clicked.");
    app.beginUndoGroup("Apply Animation Expression");
    var comp = app.project.activeItem;
    if(!(comp && comp instanceof CompItem)){
      alert("Select or open a composition.");
      return;
    }
    if(staticRadio.value){
      alert("Static mode selected. No animation applied.");
      return;
    }
    var layers = comp.selectedLayers;
    if(layers.length === 0){
      alert("Select at least one layer.");
      return;
    }
    var presetIndex = animTypeDD.selection.index; // 0: Scale, 1: Opacity, 2: Type
    var easingIndex = easeDD.selection.index; // 0: Linear, 1: Quad, 2: Expo
    var typeByIndex = typeByDD.selection.index; // only for Type
    alert("Panel selections:\nPreset: " + animTypeDD.selection.text + "\nEasing: " + easeDD.selection.text + "\nType By: " + typeByDD.selection.text);

    for(var i = 0; i < layers.length; i++){
      var layer = layers[i];
      alert("Processing layer: " + layer.name);
      var effects = layer.property("ADBE Effect Parade");
      if(!effects){
        effects = layer;
        alert("No effect group found; using layer properties directly.");
      }
      // Add In Duration slider
      var inDurCtrl = effects.property("In Duration");
      if(!inDurCtrl){
        inDurCtrl = effects.addProperty("ADBE Slider Control");
        inDurCtrl.name = "In Duration";
        alert("In Duration control added.");
      } else {
        alert("In Duration control exists.");
      }
      inDurCtrl.property("Slider").setValue(1);

      // Add Out Duration slider
      var outDurCtrl = effects.property("Out Duration");
      if(!outDurCtrl){
        outDurCtrl = effects.addProperty("ADBE Slider Control");
        outDurCtrl.name = "Out Duration";
        alert("Out Duration control added.");
      } else {
        alert("Out Duration control exists.");
      }
      outDurCtrl.property("Slider").setValue(1);

      // Add Enable In Animation checkbox
      var enableInCtrl = effects.property("Enable In Animation");
      if(!enableInCtrl){
        enableInCtrl = effects.addProperty("ADBE Checkbox Control");
        enableInCtrl.name = "Enable In Animation";
        alert("Enable In Animation checkbox added.");
      } else {
        alert("Enable In Animation checkbox exists.");
      }
      enableInCtrl.property("Checkbox").setValue(1);

      // Add Enable Out Animation checkbox
      var enableOutCtrl = effects.property("Enable Out Animation");
      if(!enableOutCtrl){
        enableOutCtrl = effects.addProperty("ADBE Checkbox Control");
        enableOutCtrl.name = "Enable Out Animation";
        alert("Enable Out Animation checkbox added.");
      } else {
        alert("Enable Out Animation checkbox exists.");
      }
      enableOutCtrl.property("Checkbox").setValue(1);

      // Add Animation Preset popup control
      var animPresetCtrl = effects.property("Animation Preset");
      if(!animPresetCtrl){
        animPresetCtrl = effects.addProperty("ADBE Popup Control");
        animPresetCtrl.name = "Animation Preset";
        alert("Animation Preset control added.");
      } else {
        alert("Animation Preset control exists.");
      }
      // Set options via the Popup property
      var apProp = animPresetCtrl.property("Popup");
      if(apProp){
        apProp.setPropertyParameters(["Scale", "Opacity", "Type"]);
        apProp.setValue(presetIndex + 1);
        alert("Animation Preset value set to: " + apProp.value);
      } else {
        alert("Animation Preset Popup property not found.");
      }

      // Add Easing popup control
      var easingCtrl = effects.property("Easing");
      if(!easingCtrl){
        easingCtrl = effects.addProperty("ADBE Popup Control");
        easingCtrl.name = "Easing";
        alert("Easing control added.");
      } else {
        alert("Easing control exists.");
      }
      var eProp = easingCtrl.property("Popup");
      if(eProp){
        eProp.setPropertyParameters(["Linear", "Quad", "Expo"]);
        eProp.setValue(easingIndex + 1);
        alert("Easing value set to: " + eProp.value);
      } else {
        alert("Easing Popup property not found.");
      }

      // For Type preset, add Type By popup control
      if(presetIndex === 2){
        var typeByCtrl = effects.property("Type By");
        if(!typeByCtrl){
          typeByCtrl = effects.addProperty("ADBE Popup Control");
          typeByCtrl.name = "Type By";
          alert("Type By control added.");
        } else {
          alert("Type By control exists.");
        }
        var tbProp = typeByCtrl.property("Popup");
        if(tbProp){
          tbProp.setPropertyParameters(["Character", "Word", "Lines"]);
          tbProp.setValue(typeByIndex + 1);
          alert("Type By value set to: " + tbProp.value);
        } else {
          alert("Type By Popup property not found.");
        }
      }

      var markerProp = layer.property("Marker");
      if(markerProp.numKeys < 1){
        alert("Layer " + layer.name + " has no markers. Skipping animation expression.");
        continue;
      }

      // Build expression based on preset
      if(presetIndex === 0 || presetIndex === 1){ // Scale or Opacity
        var expr = "";
        expr += "m = thisLayer.marker;\n";
        expr += "n = m.numKeys;\n";
        expr += "val = 100;\n";
        expr += "inDur = effect(\"In Duration\")(\"Slider\");\n";
        expr += "outDur = effect(\"Out Duration\")(\"Slider\");\n";
        expr += "enableIn = effect(\"Enable In Animation\")(\"Checkbox\");\n";
        expr += "enableOut = effect(\"Enable Out Animation\")(\"Checkbox\");\n";
        expr += "easeVal = effect(\"Easing\")(\"Popup\");\n";
        expr += "for(i = 1; i <= n; i++){\n";
        expr += "  if(time >= m.key(i).time && time < m.key(i).time + m.key(i).duration){\n";
        expr += "    tStart = m.key(i).time;\n";
        expr += "    tEnd = m.key(i).time + m.key(i).duration;\n";
        expr += "    if(enableIn == 1 && inDur > 0 && time < tStart + inDur){\n";
        expr += "      if(easeVal == 1){ val = linear(time, tStart, tStart + inDur, 0, 100); }\n";
        expr += "      else if(easeVal == 2){ val = ease(time, tStart, tStart + inDur, 0, 100); }\n";
        expr += "      else if(easeVal == 3){ nTime = (time - tStart) / inDur; val = 0 + (100 - 0) * (Math.pow(2, 10 * (nTime - 1))); }\n";
        expr += "    } else if(enableOut == 1 && outDur > 0 && time > tEnd - outDur){\n";
        expr += "      if(easeVal == 1){ val = linear(time, tEnd - outDur, tEnd, 100, 0); }\n";
        expr += "      else if(easeVal == 2){ val = ease(time, tEnd - outDur, tEnd, 100, 0); }\n";
        expr += "      else if(easeVal == 3){ nTime = (time - (tEnd - outDur)) / outDur; val = 100 - (100 - 0) * (Math.pow(2, 10 * (nTime - 1))); }\n";
        expr += "    } else { val = 100; }\n";
        expr += "  }\n";
        expr += "}\n";
        if(presetIndex === 0){
          expr += "[val, val];";
          layer.transform.scale.expression = expr;
          alert("Scale expression applied to layer: " + layer.name);
        } else {
          expr += "val;";
          layer.transform.opacity.expression = expr;
          alert("Opacity expression applied to layer: " + layer.name);
        }
      } else if(presetIndex === 2){ // Typewriter
        var expr = "";
        expr += "m = thisLayer.marker;\n";
        expr += "n = m.numKeys;\n";
        expr += "txt = '';\n";
        expr += "inDur = effect(\"In Duration\")(\"Slider\");\n";
        expr += "outDur = effect(\"Out Duration\")(\"Slider\");\n";
        expr += "enableIn = effect(\"Enable In Animation\")(\"Checkbox\");\n";
        expr += "enableOut = effect(\"Enable Out Animation\")(\"Checkbox\");\n";
        expr += "for(i = 1; i <= n; i++){\n";
        expr += "  if(time >= m.key(i).time && time < m.key(i).time + m.key(i).duration){\n";
        expr += "    fullText = m.key(i).comment;\n";
        expr += "    totalDur = m.key(i).duration;\n";
        expr += "    if(enableIn == 1 && inDur > 0 && time < m.key(i).time + inDur){\n";
        expr += "      progress = linear(time, m.key(i).time, m.key(i).time + inDur, 0, fullText.length);\n";
        expr += "    } else if(enableOut == 1 && outDur > 0 && time > m.key(i).time + totalDur - outDur){\n";
        expr += "      progress = linear(time, m.key(i).time + totalDur - outDur, m.key(i).time + totalDur, fullText.length, 0);\n";
        expr += "    } else { progress = fullText.length; }\n";
        expr += "    txt = fullText.substring(0, Math.round(progress));\n";
        expr += "  }\n";
        expr += "}\n";
        expr += "txt;";
        layer.property("Source Text").expression = expr;
        alert("Typewriter expression applied to layer: " + layer.name);
      }
      alert("Finished processing layer: " + layer.name);
    }
    app.endUndoGroup();
    alert("Animation expressions applied to all selected layers.");
  };

  infoBtn.onClick = function(){
    var infoWin = new Window("dialog", "Panel Explanation");
    infoWin.orientation = "column";
    infoWin.alignChildren = ["fill", "top"];
    infoWin.spacing = 10;
    infoWin.margins = 16;

    var topPara = infoWin.add("statictext", undefined, "This panel updates text layers based on markers, applies animation expressions using marker durations and effect controls, and enables marker editing. Effect controls for In/Out durations, enable toggles, Animation Preset, Easing and (if applicable) Type By are added automatically.", {multiline:true});
    topPara.maximumSize = [300,60];

    var steps = infoWin.add("statictext", undefined, "Steps:\n1. Select text layers and click 'Update Expressions' to refresh Source Text expressions.\n2. In Animation, choose 'Animated', select a preset and easing, then click 'Apply Animation' (all effect controls are added/updated automatically).\n3. In Edit Markers, select a text layer (only those with markers having non-empty comments are listed). Markers load automatically; edit a marker’s text and click 'Save Marker'.", {multiline:true});
    steps.maximumSize = [300,120];

    var bottomPara = infoWin.add("statictext", undefined, "Conclusion: This tool streamlines workflows for updating and animating text via markers and enables efficient marker editing.", {multiline:true});
    bottomPara.maximumSize = [300,60];

    var closeBtn = infoWin.add("button", undefined, "Close");
    closeBtn.onClick = function(){ infoWin.close(); };
    infoWin.show();
  };

  if(win instanceof Window){
    win.center();
    win.show();
  }
})();