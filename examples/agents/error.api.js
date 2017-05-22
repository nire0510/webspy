'use strict';

const path = require('path');
const Agent = require('../../main').Agent;

module.exports = Agent.extend({
  id: 'error.api',
  output: path.join(__dirname, 'results'),
  url: 'https://there-is-no-such-api.com/',
  json: true,
  selectors: {
    foo: 'root.foo',
    bar: 'root.bar'
  },
  slack: {
    webhookUri: 'https://hooks.slack.com/services/mywebhook',
    channel: '#general',
    username: 'webspy'
  }
}).run();