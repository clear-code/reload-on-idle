'use strict';

/**
 * Last time we reloaded tabs.
 */
var LASTRELOAD = Date.now();

/**
 * Reload tabs if conditions met.
 *
 * @param {Array} tabs An array of <tabs.Tab>s.
 * @return {Promise}
 */
function reload(tabs) {
  var filter = createFilter();
  var reloadBusy = configs.reloadBusyTabs;
  var chain = [];
  for (let tab of tabs) {
    if (!filter.test(tab.url)) continue;
    if (!reloadBusy && tab.status === 'loading') continue;

    var promise = browser.tabs.reload(tab.id);
    chain.push(promise);
    log(`reload tab (id=${tab.id}, url=${tab.url})`);
  }
  return Promise.all(chain);
};

/**
 * A callback function for periodic alarms.
 *
 * @param {alarms.Alarm} alarm The current alarm.
 */
function handleAlarm(alarm) {
  var seconds = Math.max(configs.idleSeconds, 15);

  browser.idle.queryState(seconds)
    .then((state) => {
      log(`check state (${state}, ${seconds}s)`);
      if (state === 'idle' || state === 'locked') {
        var now = Date.now();
        var delta = now - LASTRELOAD;
        if (delta > seconds * 1000) {
          LASTRELOAD = now;
          return browser.tabs.query({});
        }
      }
      return [];
    })
    .then(reload)
    .catch(log);
};

function main() {
  browser.alarms.onAlarm.addListener(handleAlarm);

  browser.alarms.create("idle-reload-alarm", {
    periodInMinutes: 0.1,
  });
};

configs.$loaded.then(main, log);
