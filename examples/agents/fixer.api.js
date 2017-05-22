'use strict';

const path = require('path');
const Agent = require('../../main').Agent;

module.exports = Agent.extend({
  id: 'fixer.api',
  output: path.join(__dirname, 'results'),
  url: 'https://api.fixer.io/latest',
  json: true,
  selectors: {
    currencies: 'root.base',
    date: 'root.date',
    usd: 'root.rates[USD]'
  },
  slack: {
    webhookUri: 'https://hooks.slack.com/services/mywebhook',
    channel: '#webspy',
    username: 'webspy'
  }
}).run();