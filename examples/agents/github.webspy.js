'use strict';

var agent = require('./github.repository.template.js');

agent.id = 'github.webspy';
agent.url = 'https://github.com/nire0510/webspy';
agent.attachments = [
  {
    "color": "#36a64f",
    "footer": "Slack API"
  }
];
agent.text = "the github repo name is {{Name}} and is watched by {{Watchers}} users";
agent.run();