'use strict';

/**
 * Last time we reloaded tabs.
 */
var gLastReload = Date.now();

/**
 * Reload tabs if conditions met.
 *
 * @param {Array} aTabs An array of <tabs.Tab>s.
 * @return {Promise}
 */
function reload(aTabs) {
  var filter = createFilter();
  var reloadBusy = configs.reloadBusyTabs;
  var chain = [];
  for (let tab of aTabs) {
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
 * @param {alarms.Alarm} aAlarm The current alarm.
 */
function handleAlarm(aAlarm) {
  var seconds = Math.max(configs.idleSeconds, 15);

  browser.idle.queryState(seconds)
    .then((state) => {
      log(`check state (${state}, ${seconds}s)`);
      if (state === 'idle' || state === 'locked') {
        var now = Date.now();
        var delta = now - gLastReload;
        if (delta > seconds * 1000) {
          gLastReload = now;
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
