const glob = require('glob');
const CronJob = require('cron').CronJob;
const execFile = require('child_process').execFile;

/**
 * WebSpy Operator Class
 * @type {{pronto: boolean, timezone: string, schedule: string, callback: null, path: string, extend: ((literal?)), run: (())}}
 */
module.exports = {
  /**
   * Indicates whether agent(s) should start immediately
   * @property
   */
  pronto: true,
  /**
   * Operator timezone
   * @property
   */
  timezone: 'America/Los_Angeles',
  /**
   * Agent execution schedule. Uses [CRON](http://crontab.org/) syntax
   * @property
   */
  schedule: '* * * * * *',
  /**
   * Callback function to execute when the job stops
   * @property
   */
  callback: null,
  /**
   * Path of directory where all agent files are stored
   * @property
   */
  path: '',

  /**
   * Extends Agent class
   * @param {Object} literal Class configuration
   * @returns {Object}
   */
  extend(literal) {
    var result = Object.create(this);

    Object.keys(literal).forEach(function(key) {
      result[key] = literal[key];
    });

    return result;
  },

  /**
   * Operator runner method
   */
  run() {
    new CronJob(this.schedule, function onTick() {
      glob(this.path, null, function (er, files) {
        files.forEach((file) => {
          execFile('node', [file], (error, stdout, stderr) => {
            if (error) {
              throw error;
            }

            console.log(stdout);
          });
        })
      });
    }, this.callback, true, this.timezone, this, this.pronto);
  }
};