/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

var BASE = 'extensions.reload-on-idle@piro.sakura.ne.jp.';
var prefs = require('lib/prefs').prefs;
var WM = require('lib/WindowManager').WindowManager;

var MINUTE_IN_SECONDS = 60;
var HOUR_IN_MINUTES = 60;
var DAY_IN_HOURS = 24;
var DAY_IN_SECONDS = DAY_IN_HOURS * HOUR_IN_MINUTES * MINUTE_IN_SECONDS;
{
  prefs.setDefaultPref(BASE + 'debug', false);
  prefs.setDefaultPref(BASE + 'filter', '.');
  prefs.setDefaultPref(BASE + 'idleSeconds', 10 * MINUTE_IN_SECONDS);
}

var timer = Cu.import('resource://gre/modules/Timer.jsm', {});
var { Promise } = Cu.import('resource://gre/modules/Promise.jsm', {});

var reloader = {
  onTimeout: function() {
    this.reloadTabs()
      .then((function() {
        var interval = Math.max(1, prefs.getPref(BASE + 'idleSeconds'));
        this.lastTimeout = timer.setTimeout(this.onTimeout.bind(this), interval * 1000);
      }).bind(this))
      .catch(function(error) {
        Cu.reportError(error);
      });
  },

  reloadTabs: function() {
    return new Promise((function(resolve, reject) {
      try {
        var filter = new RegExp(prefs.getPref(BASE + 'filter'), 'i');
        var browsers = WM.getWindows('navigator:browser');
        browsers.forEach(function(aWindow) {
          Array.forEach(aWindow.gBrowser.tabContainer.childNodes, function(aTab) {
            if (filter.test(aTab.linkedBrowser.currentURI.spec))
              aTab.linkedBrowser.reloadWithFlags(Ci.nsIWebNavigation.LOAD_FLAGS_NONE);
          });
        });
        resolve();
      }
      catch(error) {
        reject(error);
      }
    }).bind(this));
  },

  start: function() {
    this.stop();
    this.onTimeout();
  },

  stop: function() {
    if (this.lastTimeout)
      timer.clearTimeout(this.lastTimeout);
    this.lastTimeout = null;
  },

  observe: function(aSubject, aTopic, aData) {
    // console.log([aSubject, aTopic, aData]);
    switch (aTopic) {
      case 'idle':
        if (prefs.getPref(BASE + 'debug'))
          console.log('idle: start to reload');
        this.start();
        break;

      case 'active':
        if (prefs.getPref(BASE + 'debug'))
          console.log('active: stop to reload');
        this.stop();
        break;
    }
  }
};

var idleService = Cc['@mozilla.org/widget/idleservice;1']
                    .getService(Ci.nsIIdleService);
var idleSeconds = Math.max(10, prefs.getPref(BASE + 'idleSeconds'));
idleService.addIdleObserver(reloader, idleSeconds);

function shutdown() {
  idleService.removeIdleObserver(reloader, idleSeconds);
  reloader.stop();

  timer = Promise = prefs = WM =
    idleService = reloader =
      undefined;
}
