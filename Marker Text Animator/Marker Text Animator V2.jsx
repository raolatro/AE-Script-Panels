(function(){
  var win = (this instanceof Panel) ? this : new Window("palette", "Marker Text Updater", undefined, {resizeable:true});
  win.alignChildren = ["fill","top"];

  //────────────────────────────
  // Source Texts Section
  var srcPanel = win.add("panel", undefined, "Source Texts");
  srcPanel.alignChildren = ["fill","top"];

  var srcInputGrp = srcPanel.add("group");
  srcInputGrp.orientation = "row";
  var textInput = srcInputGrp.add("edittext", undefined, "");
  textInput.preferredSize = [150,25];
  var addTextBtn = srcInputGrp.add("button", undefined, "+ Text");

  var updateBtn = srcPanel.add("button", undefined, "Update");

  //────────────────────────────
  // Animation Section
  var animPanel = win.add("panel", undefined, "Animation");
  animPanel.alignChildren = ["fill","top"];

  // Radio buttons: Animated vs Static
  var radioGrp = animPanel.add("group");
  radioGrp.orientation = "row";
  var animatedRadio = radioGrp.add("radiobutton", undefined, "Animated");
  var staticRadio = radioGrp.add("radiobutton", undefined, "Static");
  staticRadio.value = true;

  // Animation settings group (visible only when Animated is selected)
  var animSettingsGrp = animPanel.add("group");
  animSettingsGrp.orientation = "column";
  animSettingsGrp.visible = false;

  // Dropdown for Animation Type
  var typeGrp = animSettingsGrp.add("group");
  typeGrp.orientation = "row";
  typeGrp.add("statictext", undefined, "Animation Type:");
  var animTypeDD = typeGrp.add("dropdownlist", undefined, ["Scale","Opacity","Type"]);
  animTypeDD.selection = 0;

  // Extra dropdown for Typewriter 'By' option (only when Type is selected)
  var typeByGrp = animSettingsGrp.add("group");
  typeByGrp.orientation = "row";
  typeByGrp.add("statictext", undefined, "Type By:");
  var typeByDD = typeByGrp.add("dropdownlist", undefined, ["Character","Word","Lines"]);
  typeByDD.selection = 0;
  typeByGrp.visible = false;

  // Dropdown for In/Out Duration presets
  var durGrp = animSettingsGrp.add("group");
  durGrp.orientation = "row";
  durGrp.add("statictext", undefined, "In/Out Duration (sec):");
  var durOptions = ["0.1","0.25","0.5","0.75","1","1.5","2","3","5"];
  var durDD = durGrp.add("dropdownlist", undefined, durOptions);
  durDD.selection = 1; // default 0.25 sec

  // Dropdown for Easing
  var easeGrp = animSettingsGrp.add("group");
  easeGrp.orientation = "row";
  easeGrp.add("statictext", undefined, "Easing:");
  var easeDD = easeGrp.add("dropdownlist", undefined, ["Linear","Quad","Expo"]);
  easeDD.selection = 0;

  // Animate button
  var animateBtn = animSettingsGrp.add("button", undefined, "Animate");

  //────────────────────────────
  // Bottom explainer and info button
  var bottomGrp = win.add("group");
  bottomGrp.orientation = "row";
  bottomGrp.alignChildren = ["left","center"];
  var explainer = bottomGrp.add("statictext", undefined, "Panel updates text layers based on markers.");
  var infoBtn = bottomGrp.add("button", undefined, "?");
  infoBtn.preferredSize = [25,25];

  //────────────────────────────
  // Responsive behavior
  win.onResizing = win.onResize = function(){ this.layout.resize(); };

  //────────────────────────────
  // UI events
  animatedRadio.onClick = function(){ 
    animSettingsGrp.visible = true; 
    alert("Animated mode selected. Animation settings visible.");
  };
  staticRadio.onClick = function(){ 
    animSettingsGrp.visible = false; 
    alert("Static mode selected. Animation settings hidden.");
  };
  animTypeDD.onChange = function(){
    if(animTypeDD.selection.text === "Type"){
      typeByGrp.visible = true;
      alert("Animation type set to Typewriter. Showing 'Type By' options.");
    } else {
      typeByGrp.visible = false;
      alert("Animation type set to " + animTypeDD.selection.text);
    }
  };

  //────────────────────────────
  // Helper: format time as "MM:SS:FF"
  function formatTime(t, frameRate){
    var totalFrames = Math.round(t * frameRate);
    var minutes = Math.floor(totalFrames/(60*frameRate));
    var seconds = Math.floor((totalFrames/frameRate)%60);
    var frames = totalFrames % Math.round(frameRate);
    function pad(n){ return n < 10 ? "0" + n : ""+n; }
    return pad(minutes)+":"+pad(seconds)+":"+pad(frames);
  }

  //────────────────────────────
  // "+ Text" button functionality
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
    for(var i=0; i<layers.length; i++){
      var layer = layers[i];
      var markerProp = layer.property("Marker");
      if(!markerProp) continue;
      var markerVal = new MarkerValue(textInput.text);
      markerVal.setColor([1,1,0]); // Yellow
      markerProp.setValueAtTime(comp.time, markerVal);
      var timeStr = formatTime(comp.time, comp.frameRate);
      messages.push(timeStr + ": " + textInput.text);
      alert("Marker added on layer: " + layer.name + " at time " + timeStr);
    }
    app.endUndoGroup();
    if(messages.length > 0){
      alert("Markers created:\n" + messages.join("\n"));
    }
  };

  //────────────────────────────
  // "Update" button functionality (Source Text expression)
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
    for(var i=0; i<layers.length; i++){
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
      expr += "  for(i=1;i<=n;i++){\n";
      expr += "    if(i==n){\n";
      expr += "      if(time>=m.key(i).time) txt = m.key(i).comment;\n";
      expr += "    } else {\n";
      expr += "      if(time>=m.key(i).time && time<m.key(i+1).time) txt = m.key(i).comment;\n";
      expr += "    }\n";
      expr += "  }\n";
      expr += "}\n";
      expr += "txt;";
      srcTextProp.expression = expr;
      alert("Source Text expression applied to layer: " + layer.name);
    }
    app.endUndoGroup();
    alert("Source Text expressions updated on all applicable layers.");
  };

  //────────────────────────────
  // "Animate" button functionality
  animateBtn.onClick = function(){
    app.beginUndoGroup("Apply Animation Expression");
    var comp = app.project.activeItem;
    if(!(comp && comp instanceof CompItem)){
      alert("Please select or open a composition.");
      return;
    }
    if(staticRadio.value){
      alert("Static mode is selected. No animation applied.");
      return;
    }
    var layers = comp.selectedLayers;
    if(layers.length === 0){
      alert("Please select at least one layer.");
      return;
    }
    
    // Retrieve animation settings
    var animType = animTypeDD.selection.text;
    var durVal = parseFloat(durDD.selection.text);
    var easing = easeDD.selection.text;
    var typeBy = (animType==="Type") ? typeByDD.selection.text : "";
    alert("Animation settings:\nType: " + animType + "\nDuration: " + durVal + "\nEasing: " + easing + (animType==="Type" ? ("\nType By: " + typeBy) : ""));
    
    // Process each selected layer
    for(var i=0;i<layers.length;i++){
      var layer = layers[i];
      alert("Processing layer: " + layer.name);
      var markerProp = layer.property("Marker");
      if(markerProp.numKeys < 1){
        alert("Layer " + layer.name + " has no markers. Skipping.");
        continue;
      }
      // Adjust markers: ensure each marker has at least 2*durVal duration and set color to yellow
      for(var k=1; k<=markerProp.numKeys; k++){
        var marker = markerProp.keyValue(k);
        alert("Layer " + layer.name + " - Marker " + k + " initial duration: " + marker.duration);
        if(marker.duration < 2 * durVal){
          marker.duration = 2 * durVal;
          marker.setColor([1,1,0]);
          markerProp.setValueAtKey(k, marker);
          alert("Adjusted Marker " + k + " on layer " + layer.name + " to duration: " + marker.duration);
        } else {
          alert("Marker " + k + " on layer " + layer.name + " duration sufficient: " + marker.duration);
        }
      }
      // Build and apply expression based on animation type
      if(animType==="Scale" || animType==="Opacity"){
        var expr = "";
        expr += "m = thisLayer.marker;\n";
        expr += "n = m.numKeys;\n";
        expr += "val = 100;\n";
        expr += "for(i=1;i<=n;i++){\n";
        expr += "  if(time>=m.key(i).time && time < m.key(i).time+m.key(i).duration){\n";
        expr += "    tStart = m.key(i).time;\n";
        expr += "    tEnd = m.key(i).time + m.key(i).duration;\n";
        expr += "    inDur = " + durVal + ";\n";
        expr += "    outDur = " + durVal + ";\n";
        expr += "    if(time < tStart+inDur){\n";
        if(easing==="Linear"){
          expr += "      val = linear(time, tStart, tStart+inDur, 0, 100);\n";
        } else if(easing==="Quad"){
          expr += "      val = ease(time, tStart, tStart+inDur, 0, 100);\n";
        } else if(easing==="Expo"){
          expr += "      nTime = (time-tStart)/inDur;\n";
          expr += "      val = 0 + (100-0)*(Math.pow(2,10*(nTime-1)));\n";
        }
        expr += "    } else if(time > tEnd-outDur){\n";
        if(easing==="Linear"){
          expr += "      val = linear(time, tEnd-outDur, tEnd, 100, 0);\n";
        } else if(easing==="Quad"){
          expr += "      val = ease(time, tEnd-outDur, tEnd, 100, 0);\n";
        } else if(easing==="Expo"){
          expr += "      nTime = (time - (tEnd-outDur))/outDur;\n";
          expr += "      val = 100 - (100-0)*(Math.pow(2,10*(nTime-1)));\n";
        }
        expr += "    } else { val = 100; }\n";
        expr += "  }\n";
        expr += "}\n";
        if(animType==="Scale"){
          expr += "[val, val];"; // Scale expects an array
          layer.transform.scale.expression = expr;
          alert("Applied Scale animation expression to layer: " + layer.name);
        } else {
          expr += "val;";
          layer.transform.opacity.expression = expr;
          alert("Applied Opacity animation expression to layer: " + layer.name);
        }
      } else if(animType==="Type"){
        var expr = "";
        expr += "m = thisLayer.marker;\n";
        expr += "n = m.numKeys;\n";
        expr += "txt = '';\n";
        expr += "for(i=1;i<=n;i++){\n";
        expr += "  if(time>=m.key(i).time && time < m.key(i).time+m.key(i).duration){\n";
        expr += "    fullText = m.key(i).comment;\n";
        expr += "    inDur = " + durVal + ";\n";
        expr += "    outDur = " + durVal + ";\n";
        expr += "    totalDur = m.key(i).duration;\n";
        expr += "    if(time < m.key(i).time+inDur){\n";
        expr += "      progress = linear(time, m.key(i).time, m.key(i).time+inDur, 0, fullText.length);\n";
        expr += "    } else if(time > m.key(i).time+totalDur-outDur){\n";
        expr += "      progress = linear(time, m.key(i).time+totalDur-outDur, m.key(i).time+totalDur, fullText.length, 0);\n";
        expr += "    } else { progress = fullText.length; }\n";
        if(typeBy==="Character"){
          expr += "    txt = fullText.substring(0, Math.round(progress));\n";
        } else if(typeBy==="Word"){
          expr += "    var words = fullText.split(' ');\n";
          expr += "    var count = Math.round(progress);\n";
          expr += "    txt = words.slice(0, count).join(' ');\n";
        } else if(typeBy==="Lines"){
          expr += "    var lines = fullText.split('\\r');\n";
          expr += "    var count = Math.round(progress);\n";
          expr += "    txt = lines.slice(0, count).join('\\r');\n";
        }
        expr += "  }\n";
        expr += "}\n";
        expr += "txt;";
        layer.property("Source Text").expression = expr;
        alert("Applied Typewriter animation expression to layer: " + layer.name);
      }
      alert("Finished processing layer: " + layer.name);
    }
    app.endUndoGroup();
    alert("Animation expressions applied to all selected layers.");
  };

  //────────────────────────────
  // "?" info button functionality
  infoBtn.onClick = function(){
    var infoWin = new Window("dialog", "Panel Explanation");
    infoWin.orientation = "column";
    infoWin.alignChildren = ["fill","top"];
    infoWin.spacing = 10;
    infoWin.margins = 16;
    
    var summary = infoWin.add("statictext", undefined, "Summary: This panel allows you to add yellow markers with custom text to selected layers and update text layers so their content changes based on markers. The Animation section lets you apply preset animated effects (Scale, Opacity, or Typewriter) via expressions.", {multiline:true});
    summary.maximumSize = [300,60];
    
    var bullets = infoWin.add("statictext", undefined, "• Use '+ Text' to add a marker at the current comp time with the input text.\n• Click 'Update' to set text expressions that change with marker timing.\n• In the Animation section, select 'Animated', choose a preset, set In/Out duration and easing, then click 'Animate'.", {multiline:true});
    bullets.maximumSize = [300,80];
    
    var conclusion = infoWin.add("statictext", undefined, "Conclusion: This tool streamlines marker-based text and animation updates in After Effects.", {multiline:true});
    conclusion.maximumSize = [300,40];
    
    var closeBtn = infoWin.add("button", undefined, "Close");
    closeBtn.onClick = function(){ infoWin.close(); };
    infoWin.show();
  };

  if(win instanceof Window){
    win.center();
    win.show();
  }
})();