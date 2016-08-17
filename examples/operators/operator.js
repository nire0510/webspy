var Operator = require('../../main').Operator;

Operator.extend({
  schedule: '30 * * * * *',
  path: '/path/to/agent/files/*.js'
}).run();