(function() {
    var win = new Window('palette', 'Run Script from Input');
    win.alignChildren = 'left';
    win.spacing = 10;

    var scriptInput = win.add('edittext', undefined, '', {multiline: true});
    scriptInput.size = [300, 200];
    scriptInput.graphics.backgroundColor = scriptInput.graphics.newBrush(scriptInput.graphics.BrushType.SOLID_COLOR, [1, 1, 1]);
    scriptInput.graphics.foregroundColor = scriptInput.graphics.newPen(scriptInput.graphics.PenType.SOLID_COLOR, [0, 0, 0], 1);

    var btnGroup = win.add('group');
    btnGroup.alignChildren = 'center';
    btnGroup.spacing = 10;

    var runScriptBtn = btnGroup.add('button', undefined, 'Run Script');
    runScriptBtn.onClick = function() {
        var scriptToExecute = scriptInput.text;
        
        if (scriptToExecute) {
            try {
                eval(scriptToExecute);
                alert('Script executed successfully!');
            } catch (e) {
                alert('Error executing script: ' + e);
            }
        } else {
            alert('No script entered. Please enter a script in the input field.');
        }
    };

    var clearScriptBtn = btnGroup.add('button', undefined, 'Clear Script');
    clearScriptBtn.onClick = function() {
        scriptInput.text = '';
    };

    win.show();
})();
