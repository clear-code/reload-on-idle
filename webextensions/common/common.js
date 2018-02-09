/*
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/
'use strict';

var configs;

function log(aMessage, ...aArgs) {
  if (!configs || !configs.debug)
    return;
  console.log('reload-on-idle: ' + aMessage, ...aArgs);
};

function createFilter() {
  try {
    return new RegExp(configs.filter, 'i');
  } catch (e) {
    log(`"${configs.filter}" is not a valid expression.`);
    return /./;
  }
};

configs = new Configs({
  idleSeconds: 600,
  filter: '.',
  reloadBusyTabs: false,
  ignoreConfirmation: false,
  debug: false,
});
