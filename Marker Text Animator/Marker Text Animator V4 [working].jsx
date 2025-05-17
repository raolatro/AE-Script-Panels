(function(){
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

  var animModeGrp = animPanel.add("group");
  animModeGrp.orientation = "row";
  var animatedRadio = animModeGrp.add("radiobutton", undefined, "Animated");
  var staticRadio = animModeGrp.add("radiobutton", undefined, "Static");
  staticRadio.value = true;

  var animSettingsGrp = animPanel.add("group");
  animSettingsGrp.orientation = "column";
  animSettingsGrp.visible = false;

  var typeGrp = animSettingsGrp.add("group");
  typeGrp.orientation = "row";
  typeGrp.add("statictext", undefined, "Animation Type:");
  var animTypeDD = typeGrp.add("dropdownlist", undefined, ["Scale", "Opacity", "Type"]);
  animTypeDD.selection = 0;

  var typeByGrp = animSettingsGrp.add("group");
  typeByGrp.orientation = "row";
  typeByGrp.add("statictext", undefined, "Type By:");
  var typeByDD = typeByGrp.add("dropdownlist", undefined, ["Character", "Word", "Lines"]);
  typeByDD.selection = 0;
  typeByGrp.visible = false;

  var durGrp = animSettingsGrp.add("group");
  durGrp.orientation = "row";
  durGrp.add("statictext", undefined, "Default Duration (sec):");
  var durOptions = ["0.1", "0.25", "0.5", "0.75", "1", "1.5", "2", "3", "5"];
  var durDD = durGrp.add("dropdownlist", undefined, durOptions);
  durDD.selection = 1;

  var easeGrp = animSettingsGrp.add("group");
  easeGrp.orientation = "row";
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
  var loadMarkersBtn = layerSelectGrp.add("button", undefined, "Reload Markers");

  var markerList = editPanel.add("listbox", undefined, "", {multiselect:false});
  markerList.preferredSize = [300, 100];

  var markerEditGrp = editPanel.add("group");
  markerEditGrp.orientation = "row";
  markerEditGrp.add("statictext", undefined, "Marker Text:");
  var markerEdit = markerEditGrp.add("edittext", undefined, "");
  markerEdit.preferredSize = [200, 25];

  var saveMarkerBtn = editPanel.add("button", undefined, "Save Marker");

  //────────────────────────────
  // Bottom Info Section
  var bottomGrp = win.add("group");
  bottomGrp.orientation = "row";
  bottomGrp.alignChildren = ["left", "center"];
  var explainer = bottomGrp.add("statictext", undefined, "Updates text layers, applies animation expressions using marker durations, and allows marker editing.");
  var infoBtn = bottomGrp.add("button", undefined, "?");
  infoBtn.preferredSize = [25,25];

  //────────────────────────────
  // Responsive layout
  win.onResizing = win.onResize = function(){ this.layout.resize(); };

  //────────────────────────────
  // UI Events

  // Toggle animation settings visibility
  animatedRadio.onClick = function(){
    animSettingsGrp.visible = true;
  };
  staticRadio.onClick = function(){
    animSettingsGrp.visible = false;
  };
  animTypeDD.onChange = function(){
    if(animTypeDD.selection.text === "Type"){
      typeByGrp.visible = true;
    } else {
      typeByGrp.visible = false;
    }
  };

  // Helper: Format time as "MM:SS:FF"
  function formatTime(t, frameRate){
    var totalFrames = Math.round(t * frameRate);
    var minutes = Math.floor(totalFrames / (60 * frameRate));
    var seconds = Math.floor((totalFrames / frameRate) % 60);
    var frames = totalFrames % Math.round(frameRate);
    function pad(n){ return n < 10 ? "0" + n : "" + n; }
    return pad(minutes) + ":" + pad(seconds) + ":" + pad(frames);
  }

  // Populate textLayerDD with text layers that have at least one marker with a non-empty comment
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
        var hasValidMarker = false;
        if(markerProp && markerProp.numKeys > 0){
          for(var k = 1; k <= markerProp.numKeys; k++){
            var marker = markerProp.keyValue(k);
            if(marker.comment != ""){
              hasValidMarker = true;
              break;
            }
          }
        }
        if(hasValidMarker){
          textLayerDD.add("item", layer.name);
        }
      }
    }
    if(textLayerDD.items.length > 0){
      textLayerDD.selection = 0;
    }
  }
  populateTextLayerDropdown();

  // Automatically load markers when a text layer is selected
  textLayerDD.onChange = function(){
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
      alert("Please select a text layer from the dropdown.");
      return;
    }
    var selLayerName = textLayerDD.selection.text;
    var selLayer;
    for(var i = 1; i <= comp.numLayers; i++){
      var layer = comp.layer(i);
      if(layer.name === selLayerName && layer.property("Source Text")){
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
        var timeStr = formatTime(markerProp.keyTime(k), comp.frameRate);
        markerList.add("item", timeStr + " : " + marker.comment);
      }
    }
  }

  loadMarkersBtn.onClick = function(){
    loadMarkers();
  };

  markerList.onChange = function(){
    if(markerList.selection){
      var parts = markerList.selection.text.split(" : ");
      markerEdit.text = parts[1] || "";
    }
  };

  saveMarkerBtn.onClick = function(){
    var comp = app.project.activeItem;
    if(!(comp && comp instanceof CompItem)){
      alert("Please select or open a composition.");
      return;
    }
    if(!textLayerDD.selection){
      alert("Please select a text layer from the dropdown.");
      return;
    }
    var selLayerName = textLayerDD.selection.text;
    var selLayer;
    for(var i = 1; i <= comp.numLayers; i++){
      var layer = comp.layer(i);
      if(layer.name === selLayerName && layer.property("Source Text")){
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
      alert("No marker selected from the list.");
      return;
    }
    var index = markerList.selection.index + 1;
    var marker = markerProp.keyValue(index);
    marker.comment = markerEdit.text;
    markerProp.setValueAtKey(index, marker);
    loadMarkers();
  };

  // "Update Expressions" button: update Source Text expressions for selected layers
  updateExprBtn.onClick = function(){
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
    alert("Source Text expressions updated.");
  };

  // "Apply Animation" button: add effect controls and apply animation expressions
  animateBtn.onClick = function(){
    app.beginUndoGroup("Apply Animation Expression");
    var comp = app.project.activeItem;
    if(!(comp && comp instanceof CompItem)){
      alert("Please select or open a composition.");
      return;
    }
    if(staticRadio.value){
      alert("Static mode selected. No animation applied.");
      return;
    }
    var layers = comp.selectedLayers;
    if(layers.length === 0){
      alert("Please select at least one layer.");
      return;
    }
    var animType = animTypeDD.selection.text;
    var defaultDur = parseFloat(durDD.selection.text);
    var easing = easeDD.selection.text;
    var typeBy = (animType === "Type") ? typeByDD.selection.text : "";
    
    for(var i = 0; i < layers.length; i++){
      var layer = layers[i];
      // Add effect controls if not present
      var effects = layer.property("ADBE Effect Parade");
      if(!effects) { effects = layer; }
      var inDurCtrl = effects.property("In Duration");
      if(!inDurCtrl){
        inDurCtrl = effects.addProperty("ADBE Slider Control");
        inDurCtrl.name = "In Duration";
        inDurCtrl.property("Slider").setValue(defaultDur);
      }
      var outDurCtrl = effects.property("Out Duration");
      if(!outDurCtrl){
        outDurCtrl = effects.addProperty("ADBE Slider Control");
        outDurCtrl.name = "Out Duration";
        outDurCtrl.property("Slider").setValue(defaultDur);
      }
      var enableInCtrl = effects.property("Enable In Animation");
      if(!enableInCtrl){
        enableInCtrl = effects.addProperty("ADBE Checkbox Control");
        enableInCtrl.name = "Enable In Animation";
        enableInCtrl.property("Checkbox").setValue(1);
      }
      var enableOutCtrl = effects.property("Enable Out Animation");
      if(!enableOutCtrl){
        enableOutCtrl = effects.addProperty("ADBE Checkbox Control");
        enableOutCtrl.name = "Enable Out Animation";
        enableOutCtrl.property("Checkbox").setValue(1);
      }
      
      var markerProp = layer.property("Marker");
      if(markerProp.numKeys < 1) continue;
      
      if(animType === "Scale" || animType === "Opacity"){
        var expr = "";
        expr += "m = thisLayer.marker;\n";
        expr += "n = m.numKeys;\n";
        expr += "val = 100;\n";
        expr += "inDur = effect(\"In Duration\")(\"Slider\");\n";
        expr += "outDur = effect(\"Out Duration\")(\"Slider\");\n";
        expr += "enableIn = effect(\"Enable In Animation\")(\"Checkbox\");\n";
        expr += "enableOut = effect(\"Enable Out Animation\")(\"Checkbox\");\n";
        expr += "for(i = 1; i <= n; i++){\n";
        expr += "  if(time >= m.key(i).time && time < m.key(i).time + m.key(i).duration){\n";
        expr += "    tStart = m.key(i).time;\n";
        expr += "    tEnd = m.key(i).time + m.key(i).duration;\n";
        expr += "    if(enableIn == 1 && inDur > 0 && time < tStart + inDur){\n";
        if(easing === "Linear"){
          expr += "      val = linear(time, tStart, tStart + inDur, 0, 100);\n";
        } else if(easing === "Quad"){
          expr += "      val = ease(time, tStart, tStart + inDur, 0, 100);\n";
        } else if(easing === "Expo"){
          expr += "      nTime = (time - tStart) / inDur;\n";
          expr += "      val = 0 + (100 - 0) * (Math.pow(2, 10 * (nTime - 1)));\n";
        }
        expr += "    } else if(enableOut == 1 && outDur > 0 && time > tEnd - outDur){\n";
        if(easing === "Linear"){
          expr += "      val = linear(time, tEnd - outDur, tEnd, 100, 0);\n";
        } else if(easing === "Quad"){
          expr += "      val = ease(time, tEnd - outDur, tEnd, 100, 0);\n";
        } else if(easing === "Expo"){
          expr += "      nTime = (time - (tEnd - outDur)) / outDur;\n";
          expr += "      val = 100 - (100 - 0) * (Math.pow(2, 10 * (nTime - 1)));\n";
        }
        expr += "    } else { val = 100; }\n";
        expr += "  }\n";
        expr += "}\n";
        if(animType === "Scale"){
          expr += "[val, val];";
          layer.transform.scale.expression = expr;
        } else {
          expr += "val;";
          layer.transform.opacity.expression = expr;
        }
      } else if(animType === "Type"){
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
        if(typeBy === "Character"){
          expr += "    txt = fullText.substring(0, Math.round(progress));\n";
        } else if(typeBy === "Word"){
          expr += "    var words = fullText.split(' ');\n";
          expr += "    var count = Math.round(progress);\n";
          expr += "    txt = words.slice(0, count).join(' ');\n";
        } else if(typeBy === "Lines"){
          expr += "    var lines = fullText.split('\\r');\n";
          expr += "    var count = Math.round(progress);\n";
          expr += "    txt = lines.slice(0, count).join('\\r');\n";
        }
        expr += "  }\n";
        expr += "}\n";
        expr += "txt;";
        layer.property("Source Text").expression = expr;
      }
    }
    app.endUndoGroup();
    alert("Animation expressions applied.");
  };

  // "?" Info button: Detailed explanation
  infoBtn.onClick = function(){
    var infoWin = new Window("dialog", "Panel Explanation");
    infoWin.orientation = "column";
    infoWin.alignChildren = ["fill", "top"];
    infoWin.spacing = 10;
    infoWin.margins = 16;
    
    var topPara = infoWin.add("statictext", undefined, "This panel updates text layers based on markers, applies animation expressions using marker durations and custom effect controls, and allows marker editing. Effect controls (two sliders for In/Out Duration and two checkboxes for enabling In/Out Animation) are added automatically.", {multiline:true});
    topPara.maximumSize = [300, 60];
    
    var steps = infoWin.add("statictext", undefined, "Steps:\n1. Select text layers and click 'Update Expressions' to refresh Source Text expressions.\n2. In Animation, choose 'Animated', select a preset, set default duration and easing, then click 'Apply Animation' (effect controls are added automatically).\n3. In Edit Markers, choose a text layer (only layers with markers having non-empty comments are listed). Markers load automatically; edit a marker’s text and click 'Save Marker'.", {multiline:true});
    steps.maximumSize = [300, 120];
    
    var bottomPara = infoWin.add("statictext", undefined, "Conclusion: This tool streamlines workflows for updating and animating text based on markers and enables quick marker editing on chosen text layers.", {multiline:true});
    bottomPara.maximumSize = [300, 60];
    
    var closeBtn = infoWin.add("button", undefined, "Close");
    closeBtn.onClick = function(){ infoWin.close(); };
    infoWin.show();
  };

  if(win instanceof Window){
    win.center();
    win.show();
  }
})();