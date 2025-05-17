// 3DCarouselPanel.jsx
(function(thisObj){
    var scriptName = "3D Carousel Panel";

    function buildUI(thisObj){
        var win = (thisObj instanceof Panel) 
            ? thisObj 
            : new Window("palette", scriptName, undefined, {resizeable:true});
        win.orientation = "column";
        win.alignChildren = ["fill","top"];
        win.margins = [10,10,10,10];

        // Controller selection
        var infoTxt = win.add("group");
        infoTxt.orientation = "row";
        infoTxt.add("statictext", undefined, "Create a new Null and to control your animation.");

        var ctrlGroup = win.add("group");
        ctrlGroup.orientation = "row";
        ctrlGroup.add("statictext", undefined, "Select the controller:");
        var ctrlDropdown = ctrlGroup.add("dropdownlist", undefined, []);
        ctrlDropdown.preferredSize.width = 300;

        // Image layers list
        var imgPanel = win.add("panel", undefined, "Image Layers");
        imgPanel.alignChildren = ["fill","top"];
        var imgList = imgPanel.add("listbox", undefined, [], {multiselect:true});
        imgList.preferredSize = [300,150];

        // Apply button
        var applyBtn = win.add("button", undefined, "Apply Carousel");

        // Populate layer lists
        function populateLists(){
            var comp = app.project.activeItem;
            if(!(comp && comp instanceof CompItem)) return;
            ctrlDropdown.removeAll();
            imgList.removeAll();
            for(var i=1; i<=comp.numLayers; i++){
                var L = comp.layer(i);
                ctrlDropdown.add("item", L.name);
                imgList.add("item", L.name);
            }
        }
        win.onShow = populateLists;
        win.onActivate = populateLists;

        // Main handler
        applyBtn.onClick = function(){
            app.beginUndoGroup(scriptName);
            var comp = app.project.activeItem;
            if(!(comp && comp instanceof CompItem)){
                alert("Please open a composition first.");
                app.endUndoGroup();
                return;
            }
            var ctrlItem = ctrlDropdown.selection;
            if(!ctrlItem){
                alert("Please select your Controller.");
                app.endUndoGroup();
                return;
            }
            var selected = imgList.selection;
            if(!selected || selected.length === 0){
                alert("Please select at least one layer to be controlled by.");
                app.endUndoGroup();
                return;
            }

            // Controller null setup
            var ctrl = comp.layer(ctrlItem.text);
            ctrl.threeDLayer = true;

            // Radius slider
            var radEff = ctrl.property("Effects").addProperty("ADBE Slider Control");
            radEff.name = "Radius";
            radEff.property(1).setValue(500);

            // Image Count slider
            var cntEff = ctrl.property("Effects").addProperty("ADBE Slider Control");
            cntEff.name = "Image Count";
            cntEff.property(1).setValue(selected.length);

            // Progression slider (0–100 → 0–360° offset)
            var progEff = ctrl.property("Effects").addProperty("ADBE Slider Control");
            progEff.name = "Progression";
            progEff.property(1).setValue(0);

            // Loop through each image layer
            for(var j=0; j<selected.length; j++){
                var lyr = comp.layer(selected[j].text);
                lyr.threeDLayer = true;

                // **NEW**: parent each image to the CTRL null
                lyr.parent = ctrl;

                // Index slider
                var idxEff = lyr.property("Effects").addProperty("ADBE Slider Control");
                idxEff.name = "Order";
                idxEff.property(1).setValue(j+1);

                // Position expression (X & Z; includes progression offset)
                var posExpr = 
"// radius & count from controller\n" +
"var ctrl = thisComp.layer('" + ctrlItem.text + "');\n" +
"var radius = ctrl.effect('Radius')('Slider');\n" +
"var total  = ctrl.effect('Image Count')('Slider');\n" +
"// my slot index (0-based)\n" +
"var i = effect('Order')('Slider') - 1;\n" +
"// progression offset (0–100 → 0–2π)\n" +
"var prog = ctrl.effect('Progression')('Slider') / 100;\n" +
"var offset = prog * 2 * Math.PI;\n" +
"// final angle\n" +
"var angle = (i/total) * 2 * Math.PI + offset;\n" +
"[\n" +
"  Math.cos(angle) * radius,\n" +
"  value[1],\n" +
"  Math.sin(angle) * radius\n" +
"];";
                lyr.property("Position").expression = posExpr;
            }

            app.endUndoGroup();
        };

        if(win instanceof Window){
            win.center();
            win.show();
        }
    }

    buildUI(thisObj);
})(this);