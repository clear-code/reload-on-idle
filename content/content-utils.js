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
        content.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowUtils).disableDialogs();
        // aTab.linkedBrowser.reloadWithFlags(Ci.nsIWebNavigation.LOAD_FLAGS_NONE);
        content.location.reload();
        return;

      case 'shutdown':
        global.removeMessageListener('reload-on-idle@clear-code.com', messageListener);
        free();
        return;
    }
  };
  global.addMessageListener('reload-on-idle@clear-code.com', messageListener);
})(this);
