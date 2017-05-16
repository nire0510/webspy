'use strict';

const path = require('path');
var Agent = require('../../main').Agent;

module.exports = Agent.extend({
  // id: '',
  output: path.join(__dirname, 'results'),
  // url: '',
  selectors: {
    Name: 'title',
    Version: '.last-publisher~li>strong',
    'Daily Downloads': '.daily-downloads',
    'Weekly Downloads': '.weekly-downloads',
    'Monthly Downloads': '.monthly-downloads'
  },
  slack: {
    webhookUri: 'https://hooks.slack.com/services/mywebhook',
    channel: '#webspy',
    username: 'webspy'
  }
});