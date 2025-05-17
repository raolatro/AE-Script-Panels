{
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem)) {
      alert("Please select an active composition.");
    } else {
      var win = (this instanceof Panel) ? this : new Window("palette", "Circular Motion Setup", undefined, {resizeable: true});
      win.orientation = "column";
      win.alignChildren = ["fill", "top"];
  
      var masterLayer = null;
  
      function addSlider(layer, sliderName, initVal) {
        var ef = layer.property("ADBE Effect Parade").property(sliderName);
        if (!ef) {
          ef = layer.Effects.addProperty("ADBE Slider Control");
          ef.name = sliderName;
        }
        ef.property("ADBE Slider Control-0001").setValue(initVal);
        return ef;
      }
      function addPointControl(layer, controlName, initVal) {
        var ef = layer.property("ADBE Effect Parade").property(controlName);
        if (!ef) {
          ef = layer.Effects.addProperty("ADBE Point Control");
          ef.name = controlName;
        }
        ef.property("ADBE Point Control-0001").setValue(initVal);
        return ef;
      }
  
      var setupMasterBtn = win.add("button", undefined, "Setup Master Controller");
      setupMasterBtn.onClick = function () {
        app.beginUndoGroup("Setup Master Controller");
        var layerList = [];
        for (var i = 1; i <= comp.numLayers; i++) {
          layerList.push(comp.layer(i).name);
        }
        var dlg = new Window("dialog", "Select Master Control Layer");
        dlg.orientation = "column";
        dlg.add("statictext", undefined, "Select the Master Control Layer:");
        var dropdown = dlg.add("dropdownlist", undefined, layerList);
        dropdown.selection = 0;
        dlg.add("button", undefined, "OK");
        if (dlg.show() != 1) {
          app.endUndoGroup();
          return;
        }
        var masterLayerName = dropdown.selection.text;
        masterLayer = comp.layer(masterLayerName);
        if (!masterLayer) {
          alert("Master control layer not found.");
          app.endUndoGroup();
          return;
        }
        addSlider(masterLayer, "Radius", 200);
        addSlider(masterLayer, "Progress", 0);
        addSlider(masterLayer, "Spins", 1);
        addSlider(masterLayer, "Layers", 0);
        addSlider(masterLayer, "Delay", 0);
        app.endUndoGroup();
      };
  
      var applyExprBtn = win.add("button", undefined, "Apply Expressions");
      applyExprBtn.onClick = function () {
        if (!masterLayer) {
          alert("Please run Setup Master Controller first.");
          return;
        }
        app.beginUndoGroup("Apply Circular Motion Expressions");
        var selectedLayers = comp.selectedLayers;
        var controlledLayers = [];
        for (var j = 0; j < selectedLayers.length; j++) {
          if (selectedLayers[j] !== masterLayer) {
            controlledLayers.push(selectedLayers[j]);
          }
        }
        addSlider(masterLayer, "Layers", controlledLayers.length);
        for (var k = 0; k < controlledLayers.length; k++) {
          var lyr = controlledLayers[k];
          var chk = lyr.property("ADBE Effect Parade").property("Add to Circular Motion");
          if (!chk) {
            chk = lyr.Effects.addProperty("ADBE Checkbox Control");
            chk.name = "Add to Circular Motion";
            chk.property("ADBE Checkbox Control-0001").setValue(1);
          }
          var posVal = lyr.property("Position").value;
          if (posVal instanceof Array && posVal.length > 2) {
            posVal = [posVal[0], posVal[1]];
          }
          addPointControl(lyr, "Original Position", posVal);
          var orderName = "Order of " + lyr.name;
          var orderSlider = masterLayer.property("ADBE Effect Parade").property(orderName);
          if (!orderSlider) {
            orderSlider = masterLayer.Effects.addProperty("ADBE Slider Control");
            orderSlider.name = orderName;
          }
          orderSlider.property("ADBE Slider Control-0001").setValue(k + 1);
          var expr = ""
            + "var master = thisComp.layer(\"" + masterLayer.name + "\");\n"
            + "var radius = master.effect(\"Radius\")(\"Slider\");\n"
            + "var progress = master.effect(\"Progress\")(\"Slider\")/100;\n"
            + "var spins = master.effect(\"Spins\")(\"Slider\");\n"
            + "var total = master.effect(\"Layers\")(\"Slider\");\n"
            + "var order = master.effect(\"" + orderName + "\")(\"Slider\");\n"
            + "if(total < 1) total = 1;\n"
            + "var offsetAngle = (order - 1) * (360 / total);\n"
            + "var angle = progress * 360 * spins + offsetAngle;\n"
            + "var finalPos = master.position + [Math.cos(degreesToRadians(angle))*radius, Math.sin(degreesToRadians(angle))*radius];\n"
            + "var origPos = effect(\"Original Position\")(\"Point\");\n"
            + "var delay = master.effect(\"Delay\")(\"Slider\")/100;\n"
            + "if (effect(\"Add to Circular Motion\")(\"Checkbox\") == 1) {\n"
            + "    linear(delay, 0, 1, origPos, finalPos);\n"
            + "} else {\n"
            + "    origPos;\n"
            + "}";
          lyr.property("Position").expression = expr;
        }
        app.endUndoGroup();
      };
  
      win.layout.layout(true);
      if (win instanceof Window) {
        win.center();
        win.show();
      }
    }
  }