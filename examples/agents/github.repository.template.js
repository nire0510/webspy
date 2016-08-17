'use strict';

var path = require('path');
var Agent = require('../../main').Agent;

module.exports = Agent.extend({
  // id: '',
  output: path.join(__dirname, 'results'),
  // url: '',
  selector: {
    Name: 'title',
    Watchers: '.social-count.js-social-count',
    Stars: '.starring-container .social-count.js-social-count',
    Forks: '.btn-with-count ~ .social-count',
    Issues: '.octicon-issue-opened ~ .counter',
    'Pull Requests': '.octicon-git-pull-request ~ .counter'
  },
  slack: {
    webhookUri: 'https://hooks.slack.com/services/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',
    channel: '#webspy',
    username: 'webspy'
  },

  didScrape(current) {
    ['Watchers', 'Stars', 'Forks', 'Issues', 'Pull Requests'].forEach((field) => {
      if (current.data[field]) {
        current.data[field] = parseInt(current.data[field].replace(/[\n,]/g, '').trim());
      }
    });

    return current;
  }
});