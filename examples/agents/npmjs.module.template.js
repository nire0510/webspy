'use strict';

var path = require('path');
var Agent = require('../../main').Agent;

module.exports = Agent.extend({
  // id: '',
  output: path.join(__dirname, 'results'),
  // url: '',
  selector: {
    Name: 'title',
    Version: '.last-publisher~li>strong',
    'Daily Downloads': '.daily-downloads',
    'Weekly Downloads': '.weekly-downloads',
    'Monthly Downloads': '.monthly-downloads'
  },
  slack: {
    webhookUri: 'https://hooks.slack.com/services/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',
    channel: '#webspy',
    username: 'webspy'
  }
});