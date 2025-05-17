var comp = app.project.activeItem;
// loop through all selected layers
for (var i = 0; i < comp.selectedLayers.length; i++) {
    var layer = comp.selectedLayers[i];
    
    // recursively check all properties of the layer
    checkProperties(layer);
}
function checkProperties(group) {
    for (var i = 1; i <= group.numProperties; i++) {
        var prop = group.property(i);
        
        // if the property is a group, check its child properties
        if (prop.propertyType === PropertyType.INDEXED_GROUP || prop.propertyType === PropertyType.NAMED_GROUP) {
            checkProperties(prop);
        }
        // if the property has an expression, remove it but keep the current value
        else if (prop.canSetExpression && prop.expression) {
            // get the current value
            var currentValue = prop.value;
            
            // clear the expression
            prop.expression = "";
            
            // set the value to the current value
            prop.setValue(currentValue);
        }
    }
}