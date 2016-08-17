'use strict';

var diff = require('deep-diff').diff;
var fs = require('fs');
var path = require('path');
var Slack = require('slack-node');
var x = require('x-ray')();

/**
 * WebSpy Agent Class
 * @type {{notifier: *, extend: ((literal:Object)=>Object), _isOutputDirectoryExists: ((directory:string, current:Object)=>Promise), _isFileExists: ((file:String)=>Promise), _getLastResults: ((file:String, exists:Boolean)=>Promise), willScrape: ((url:String, selector:String)), _scrape: ((overrides:Object)=>Promise), didScrape: ((current:Object)), willCompare: ((previous:Object, current:Object)), _compare: ((overrides:Object)), didCompare: ((comparison:Object)), _preWillNotify: ((comparison:Object)), willNotify: ((slack:Object, comparison:Object)), _notify: ((overrides:Object)=>Promise), didNotify: ((status:Object)), willSave: ((file:Object, current:Object)), _save: ((file?, overrides:Object)=>Promise), didSave: ((file:String)), run: (())}}
 */
var Agent = {
  /**
   * Slack instance
   * @property
   */
  notifier: new Slack(),

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
   * Checks if output directory exists and if not - it creates one
   * @param {string} directory Output directory path
   * @param {Object} current Current execution results (used by hook)
   * @returns {Promise}
   * @private
   */
  _isOutputDirectoryExists(directory, current) {
    // override values sent from didScrape by the user:
    if (current) {
      this.current = current;
    }

    return new Promise((resolve, reject) => {
      fs.access(directory, (err) => {
        if (err) {
          fs.mkdir(directory, function (err) {
            if (err) {
              return reject(err);
            }

            return resolve(true);
          });
        }

        resolve(true);
      });
    });
  },

  /**
   * Checks if file exists
   * @param {String} file File path
   * @returns {Promise}
   * @private
   */
  _isFileExists(file) {
    return new Promise((resolve/*, reject*/) => {
      fs.access(file, (err) => {
        if (err) {
          return resolve(false);
        }

        resolve(true);
      });
    });
  },

  /**
   * Extracts last agent run results
   * @param {String} file Results file path
   * @param {Boolean} exists Indicates whether file exists (previous promise output)
   * @returns {Promise}
   * @private
   */
  _getLastResults(file, exists) {
    return new Promise((resolve, reject) => {
      if (exists) {
        fs.readFile(file, 'utf8', (err, data) => {
          if (err) {
            return reject(err);
          }

          this.previous = JSON.parse(data);
          resolve(this.previous);
        });
      }
      else {
        resolve({});
      }
    });
  },

  /**
   * Hook: Occurs before agent begins the scraping. User can modify arguments.
   * In this case, method should return the arguments in an object (i.e. { url, selector })
   * @param {String} url The web page URL from which data will be scraped
   * @param {String} selector The data selector
   */
  willScrape(url, selector) {
    // console.log('willScrape', arguments);
  },

  /**
   * Scrapes data from web page
   * @param {Object} overrides Object which contains parameters to override (used by hook)
   * @returns {Promise}
   * @private
   */
  _scrape(overrides) {
    // console.log('scrape', arguments);

    // override values sent from willScrape by the user:
    ['url', 'selector'].forEach((prop) => {
      if (overrides && overrides.hasOwnProperty(prop)) {
        this[prop] = overrides[prop];
      }
    });

    console.log(`Scraping data from ${this.url}...`);
    return new Promise((resolve, reject) => {
      x(this.url, this.selector)((err, output) => {
        if (err) {
          return reject(err);
        }

        let results = {};
        results.data = output;
        results.url = this.url;
        results.selector = this.selector;
        results.timestamp = new Date().valueOf();
        this.current = results;

        resolve(results);
      });
    });
  },

  /**
   * Hook: Occurs after agent finishes the scraping. User can modify arguments.
   * In this case, method should return the argument.
   * @param {Object} current Current execution results
   */
  didScrape(current) {
    // console.log('didScrape', arguments);
  },

  /**
   * Hook: Occurs before agent begins to compare execution results. User can modify arguments.
   * In this case, method should return the arguments in an object (i.e. { previous, current })
   * @param {Object} previous Previous execution results
   * @param {Object} current Current execution results
   */
  willCompare(previous, current) {
    // console.log('willCompare', arguments);
  },

  /**
   * Compares previous & current execution results
   * @param {Object} overrides Object which contains parameters to override (used by hook)
   * @private
   */
  _compare(overrides) {
    // console.log('compare', arguments);

    // override values sent from willCompare by the user:
    ['previous', 'current'].forEach((prop) => {
      if (overrides && overrides.hasOwnProperty(prop)) {
        this[prop] = overrides[prop];
      }
    });

    console.log(`Comparing current data with previous, if exist...`);
    this.comparison = diff(this.previous && this.previous.data || {}, this.current.data);
  },

  /**
   * Hook: Occurs after agent finishes the comparison. User can modify arguments.
   * In this case, method should return the argument.
   * @param {Object} comparison Comparison results
   */
  didCompare(comparison) {
    // console.log('didCompare', arguments);
  },

  /**
   * Helper method to deal with the didCompare modifications, if any
   * @param {Object} comparison Comparison results
   * @private
   */
  _preWillNotify(comparison) {
    // console.log('_preWillNotify', arguments);

    // override values sent from didScrape by the user:
    if (comparison) {
      this.comparison = comparison;
    }
  },

  /**
   * Hook: Occurs before agent sends comparison results. User can modify arguments.
   * In this case, method should return the arguments in an object (i.e. { slack, comparison })
   * @param {Object} slack Slack instance configuration
   * @param {Object} comparison Current execution resultsComparison results
   */
  willNotify(slack, comparison) {
    // console.log('willNotify', arguments);
  },

  /**
   * Sends comparison results to Slack
   * @param {Object} overrides Object which contains parameters to override (used by hook)
   * @returns {Promise}
   * @private
   */
  _notify(overrides) {
    // console.log('notify', arguments);

    // override values sent from willCompare by the user:
    ['slack', 'comparison'].forEach((prop) => {
      if (overrides && overrides.hasOwnProperty(prop)) {
        this[prop] = overrides[prop];
      }
    });

    if (this.slack && this.slack.webhookUri && this.slack.channel && this.slack.username) {
      if (this.comparison && this.comparison.length > 0) {
        var message = `*${this.id.toUpperCase()}* AGENT RESULTS\n`;

        console.log(`Sending notification...`);

        this.comparison.forEach((item) => {
          switch (item.kind) {
            case 'N':
              message += `• ${item.path ? item.path.join('-') : ''}: *${item.rhs}* _(new)_\n`;
              break;
            case 'D':
              message += `• ${item.path ? item.path.join('-') : ''} _removed_\n`;
              break;
            case 'E':
              message += `• ${item.path ? item.path.join('-') : ''}: *${item.lhs}* >> *${item.rhs}* _(updated)_\n`;
              break;
          }
        });
        message += '\n';

        Agent.notifier.setWebhook(this.slack.webhookUri);
        return new Promise((resolve, reject) => {
          Agent.notifier.webhook({
            channel: this.slack.channel,
            username: this.slack.username,
            text: message
          }, function (err, response) {
            if (err) {
              return reject(err);
            }

            resolve(response);
          });
        });
      }
      else {
        console.log(`Nothing has changed. Quiting...`);
      }
    }
    else {
      console.log(`Slack configuration is missing. Quiting...`);
    }
  },

  /**
   * Hook: Occurs after agent sends comparison results.
   * @param {Object} status Slack sending status
   */
  didNotify(status) {
    // console.log('didNotify', arguments);
  },

  /**
   * Hook: Occurs before agent saves current execution results to file. User can modify arguments.
   * In this case, method should return the arguments in an object (i.e. { file, current })
   * @param {string} file Execution results file path
   * @param {Object} current Current execution results
   */
  willSave(file, current) {
    // console.log('willSave', arguments);
  },

  /**
   * Saves current execution results to file
   * @param file Execution results file path
   * @param {Object} overrides Object which contains parameters to override (used by hook)
   * @returns {Promise}
   * @private
   */
  _save(file, overrides) {
    // console.log('save', arguments);

    // override values sent from willCompare by the user:
    ['file', 'current'].forEach((prop) => {
      if (overrides && overrides.hasOwnProperty(prop)) {
        (prop === 'file') ? file = overrides.file : this[prop] = overrides[prop];
      }
    });

    console.log(`Saving current data...`);
    return new Promise((resolve, reject) => {
      fs.writeFile(file, JSON.stringify(this.current, null, '  '),
        function (err) {
          if (err) {
            return reject(err);
          }

          resolve();
        }
      );
    });
  },

  /**
   * Hook: Occurs after agent saves current execution results to file.
   * @param {String} file Execution results file path
   */
  didSave(file) {
    // console.log('didSave', arguments);
    console.log(`Job done!`);
  },

  /**
   * Agent runner method
   */
  run() {
    let file = path.join(this.output, `${this.id}.json`);

    Promise.resolve()
      .then(this.willScrape && this.willScrape.bind(this, this.url, this.selector))
      .then(Agent._scrape.bind(this))
      .then(this.didScrape && this.didScrape.bind(this))
      .then(Agent._isOutputDirectoryExists.bind(this, this.output))
      .then(Agent._isFileExists.bind(this, file))
      .then(Agent._getLastResults.bind(this, file))
      .then((previous) => {
        this.willCompare && this.willCompare.call(this, previous, this.current);
      })
      .then(Agent._compare.bind(this))
      .then(() => {
        this.didCompare && this.didCompare.call(this, this.comparison);
      })
      .then(Agent._preWillNotify.bind(this))
      .then(this.willNotify && this.willNotify.bind(this, this.slack))
      .then(Agent._notify.bind(this))
      .then(this.didNotify && this.didNotify.bind(this))
      .then(() => {
        this.willSave && this.willSave.call(this, file, this.current);
      })
      .then(Agent._save.bind(this, file))
      .then(this.didSave && this.didSave.bind(this, file))
      .catch(function (err) {
        console.error(err);
      });
  }
};

module.exports = {
  extend: Agent.extend,
  run: Agent.run
};