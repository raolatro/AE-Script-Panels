(function(){
  function buildUI(thisObj){
    var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "Counter Panel", undefined, {resizeable:true});
    win.orientation = "column";
    win.alignChildren = "fill";

    var numGroup = win.add("group");
    numGroup.orientation = "row";
    numGroup.add("statictext", undefined, "Start:");
    var startInput = numGroup.add("edittext", undefined, "0");
    startInput.characters = 12;
    numGroup.add("statictext", undefined, "End:");
    var endInput = numGroup.add("edittext", undefined, "100");
    endInput.characters = 12;

    var affixGroup = win.add("group");
    affixGroup.orientation = "row";
    affixGroup.add("statictext", undefined, "Prefix:");
    var prefixInput = affixGroup.add("edittext", undefined, "");
    prefixInput.characters = 10;
    affixGroup.add("statictext", undefined, "Suffix:");
    var suffixInput = affixGroup.add("edittext", undefined, "");
    suffixInput.characters = 10;

    var btn = win.add("button", undefined, "Create Counter");
    btn.onClick = function(){
      var comp = app.project.activeItem;
      if(!(comp && comp instanceof CompItem)){
        alert("Please select a composition.");
        return;
      }
      if(comp.selectedLayers.length !== 1){
        alert("Select a single layer.");
        return;
      }
      var layer = comp.selectedLayers[0];
      if(!layer.property("Source Text")){
        alert("Selected layer is not a text layer.");
        return;
      }
      
      var sNum = parseFloat(startInput.text),
          eNum = parseFloat(endInput.text),
          prefix = prefixInput.text,
          suffix = suffixInput.text;
      
      app.beginUndoGroup("Create Counter");

      function updateOrAddSlider(layer, name, val){
        var effects = layer.property("Effects");
        var slider = effects.property(name);
        if(slider != null){
          slider.property("Slider").setValue(val);
        } else {
          slider = effects.addProperty("ADBE Slider Control");
          slider.name = name;
          slider.property("Slider").setValue(val);
        }
        return slider;
      }
      
      updateOrAddSlider(layer, "Start Number", sNum);
      updateOrAddSlider(layer, "End Number", eNum);
      
      var cpSlider = updateOrAddSlider(layer, "Counter Progress", 0);
      cpSlider.property("Slider").setValueAtTime(layer.inPoint, 0);
      cpSlider.property("Slider").setValueAtTime(layer.inPoint + 1, 100);
      
      var expr = "";
      expr += "s = effect(\"Start Number\")(\"Slider\");\n";
      expr += "e = effect(\"End Number\")(\"Slider\");\n";
      expr += "p = effect(\"Counter Progress\")(\"Slider\")/100;\n";
      expr += "num = Math.round(linear(p, 0, 1, s, e));\n";
      expr += "prefix = \"" + prefix.replace(/"/g, '\\"') + "\";\n";
      expr += "suffix = \"" + suffix.replace(/"/g, '\\"') + "\";\n";
      expr += "prefix + num + suffix;";
      
      layer.property("Source Text").expression = expr;
      app.endUndoGroup();
    };
    
    if(win instanceof Window){
      win.center();
      win.show();
    } else {
      win.layout.layout(true);
    }
    return win;
  }
  buildUI(this);
})();