{
  var win = (this instanceof Panel) ? this : new Window("palette", "Cascade Layers", undefined, {resizeable:true});
  
  win.add("statictext", undefined, "Frames offset:");
  var frameInput = win.add("edittext", undefined, "5");
  frameInput.characters = 5;
  var applyBtn = win.add("button", undefined, "Apply Cascade");
  
  applyBtn.onClick = function(){
    var frames = parseInt(frameInput.text,10);
    if(isNaN(frames)){
      alert("Enter a valid number");
      return;
    }
    var comp = app.project.activeItem;
    if(!(comp instanceof CompItem)){
      alert("Select a composition.");
      return;
    }
    if(comp.selectedLayers.length < 1){
      alert("Select at least one layer.");
      return;
    }
    app.beginUndoGroup("Cascade Layers");
    var offset = frames * comp.frameDuration;
    for(var i=0; i < comp.selectedLayers.length; i++){
      comp.selectedLayers[i].startTime += offset * i;
    }
    app.endUndoGroup();
  }
  
  if(win instanceof Window){
    win.center();
    win.show();
  } else {
    win.layout.layout(true);
  }
}