(function(global) {
  var Cc = Components.classes;
  var Ci = Components.interfaces;
  var Cu = Components.utils;
  var Cr = Components.results;

  function free() {
    free =
      Cc = Ci = Cu = Cr =
      messageListener =
        undefined;
  }

  var messageListener = function(aMessage) {
    switch (aMessage.json.command)
    {
      case 'reload':
        // This affects only on Firefox 42 and later...
        // See: https://bugzilla.mozilla.org/show_bug.cgi?id=1188665
        content.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils).disableDialogs();
        docShell.QueryInterface(Ci.nsIWebNavigation).reload(Ci.nsIWebNavigation.LOAD_FLAGS_NONE);
        return;

      case 'shutdown':
        global.removeMessageListener('reload-on-idle@clear-code.com', messageListener);
        free();
        return;
    }
  };
  global.addMessageListener('reload-on-idle@clear-code.com', messageListener);
})(this);
