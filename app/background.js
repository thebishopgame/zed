/*global chrome*/

function showProjects() {
    chrome.app.window.create('open.chrome.html', {
        frame: 'chrome',
        width: 400,
        height: 180
    }, function(win) {
        win.focus();
    });
}

chrome.app.runtime.onLaunched.addListener(showProjects);

var ongoingTextAreaEdits = {};

chrome.runtime.onConnectExternal.addListener(function(port) {
    var id = "" + Date.now();
    ongoingTextAreaEdits[id] = port;
    port.onMessage.addListener(function(req) {
        if (req.text !== undefined) {
            chrome.app.window.create('editor.html?id=' + id + '&title=Edit%20Text%20Area&url=textarea:' + encodeURIComponent(req.text), {
                frame: 'none',
                width: 720,
                height: 400
            }, function(win) {
                win.focus();
                win.onClosed.addListener(function() {
                    port.disconnect();
                    delete ongoingTextAreaEdits[id];
                });
            });
        }
    });
    port.onDisconnect.addListener(function() {
        delete ongoingTextAreaEdits[id];
    });
});

window.setTextAreaText = function(id, text) {
    ongoingTextAreaEdits[id].postMessage({
        text: text
    });
};
