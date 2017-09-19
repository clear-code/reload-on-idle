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
  debug: false,
});
