/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
'use strict';

/**
 * Last time we reloaded tabs.
 */
var gLastReload = Date.now();

/**
 * Reload tabs if conditions met.
 */
async function reloadTabs() {
  var tabs = await browser.tabs.query({});
  var filter = createFilter();

  for (let tab of tabs) {
    if (!filter.test(tab.url))
      continue;
    if (!configs.reloadBusyTabs && tab.status === 'loading')
      continue;

    if (configs.ignoreConfirmation) {
      try {
        await browser.tabs.executeScript(tab.id, {
          allFrames: true,
          code: 'addEventListener("beforeunload", (e) => {e.returnValue = ""})'
        });
      } catch (e) {
        log(`failed to execute script on "${tab.url}" (${e})`);
      }
    }
    log(`reload tab (id=${tab.id}, url=${tab.url})`);
    browser.tabs.reload(tab.id).catch(log);
  }
};

/**
 * A callback function for periodic alarms.
 *
 * @param {alarms.Alarm} aAlarm The current alarm.
 */
async function handleAlarm(aAlarm) {
  var seconds = Math.max(configs.idleSeconds, 15);
  var state = await browser.idle.queryState(seconds);

  log(`check state (${state}, ${seconds}s)`);
  if (state === 'idle' || state === 'locked') {
    var now = Date.now();
    var delta = now - gLastReload;
    if (delta > seconds * 1000) {
      gLastReload = now;
      reloadTabs();
    }
  }
};

function main() {
  browser.alarms.onAlarm.addListener(handleAlarm);

  browser.alarms.create("idle-reload-alarm", {
    periodInMinutes: 0.1,
  });
};

configs.$loaded.then(main, log);
