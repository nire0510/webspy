# WebSpy
***My name is Spy. WebSpy.***

## Description
**WebSpy** silently sends its agents out there, to the darkest creepiest internet corners,
to keep an eye and let you know if someone messed with web pages you care for...  
(OR, to be less dramatic, use **WebSpy** if you want to be notified on web page changes)

## How To Use WebSpy
1. Create a new directory for the project. The recommended structure is:  
```
/project-root
|-- results
|-- agents
|   |-- agent-1.js
|   |-- agent-2.js
|   |-- ...
|-- operator.js
|-- operator-a.js
```
1. Install **WebSpy** node package:  
`npm install webspy --save`
1. Create as many WebSpy Agent files as you wish, one per URL (read more about agent later)
1. (Optional) - Create WebSpy Operator for managing your agents
1. Run the agent file directly or use the operator (same as you do with any other node file):  
`node ./agents/agent-1.js`

## WebSpy Components

### Agent
The agent module is the most important WebSpy building block, which is merely
a configuration file. Each agent can collect data from a single URL.

#### Agent Sample File

```javascript
'use strict';

var Agent = require('webspy').Agent;

module.exports = Agent.extend({
  // agent's unique identifier. Will be used as job identifier & results file name:
  id: 'My-Unique-Agent-Identifier',
  // path of directory where you want the agent output json file to be saved:
  output: '/path/to/results/files/directory',
  // the target url from which data will be scraped:
  url: 'http://my.target-website.com',
  // indicates whether url output is a JSON file:
  json: false,
  // the data object which defines the selectors of the elements you want to track.
  // notice that there's a different syntax in case of querying a JSON file (read more about how to write selectors in case your output is JSON)[https://www.npmjs.com/package/json-query]
  // and you should refer the main object as `root`:
  selectors: {
    Name: 'title',
    Field1: '.jquery-selector',
    Field2: '#another .jquery-selector',
    Field3: '.get-data-from@attr',
    MyList: ['ul.tasks li'],
    MyJSON: 'data.attr'
  },
  // (Optional) the message text. If empty, WebSpy will automatically generate a message based on the selectors object based on Mustache templates engine.
  // (read more about the templates engine here)[https://www.npmjs.com/package/mustache]:
  text: '',
  // (Optional) Slack message attachments (see more details here - https://api.slack.com/docs/message-attachments).
  // similar to the text property, the attachments' template is based on Mustache templates engine:
  attachments: [
    {
        "footer": "My name is {{Name}}. WebSpy rules!"
    }
  ],
  // (Optional) time to wait (in milliseconds) before scraping the page. Can be handy when scraping dynamic page (AJAX)
  wait: 0,
  // (Optional) slack webhook configuration (read here how to create Slack webhooks - https://api.slack.com/incoming-webhooks).
  // If empty, only the JSON result files will be generated and messages will not be send:
  slack: {
    active: true,
    webhookUri: 'https://hooks.slack.com/services/...',
    channel: '#webspy-channel-name',
    username: 'webhook-username'
  },
  
  // *** OPTIONAL HOOKS *** //
  
  // Occurs before agent begins to scrape data:
  willScrape(url, selectors) {
    return { url, selectors };
  },
  // Occurs after agent finishes the scraping:
  didScrape(current) {
    return current;
  },
  // Occurs before agent begins to compare execution results:
  willCompare(previous, current) {
    return { previous, current };
  },
  // Occurs after agent finishes the comparison:
  didCompare(comparison) {
    return comparison;
  },
  // Occurs before agent sends comparison results:
  willNotify(slack, comparison) {
    return { slack, comparison };
  },
  // Occurs after agent notifies:
  didNotify(status) {
    
  },
  // Occurs before agent saves current execution results to a file:
  willSave(file, current) {
    return { file, current };
  },
  // Occurs after agent saves current execution results to a file:
  didSave(file) {
  
  }
});
```

#### Agent Hooks
Hooks are basically methods that allow you to run code at specific times in a component's life cycle.
Most hooks on WebSpy allow you also to modify arguments which are relevant for the specific hook; for example:
you may change the output file path before WebSpy saves it.
**IMPORTANT TO KNOW** If you do modify the hooks argument, make sure you return them
at the end of the method for the modification to take place.
When hook has more than one argument, you should return all arguments as an object, i.e.  
```javascript
myHook (arg1, arg2) {
    arg1 = 'WebSpy';
    arg2 = 'Is Awesome';
    
    return { arg1, arg2 };
}
```

* `willScrape(url, selectors)` - Occurs before agent begins to scrape data. Arguments can be modified.  
  - `url` {String} The web page URL from which data will be scraped
  - `selectors` {String} selectors The data selectors object


* `didScrape(current)` - Occurs after agent finishes the scraping. Argument can be modified.  
    - `current` {Object} Current execution results


* `willCompare(previous, current)` - Occurs before agent begins to compare execution results. Arguments can be modified.  
    - `previous` {Object} Previous execution results
    - `current` {Object} Current execution results


* `didCompare(comparison)` - Occurs after agent finishes the comparison. Argument can be modified.  
    - `comparison` {Object} Comparison results


* `willNotify(slack, comparison)` - Occurs before agent sends comparison results. Arguments can be modified.  
    - `slack` {Object} Slack instance configuration
    - `comparison` {Object} Comparison results


* `didNotify(status)` - Occurs after agent sends comparison results.  
    - `status` {Object} Slack sending status


* `willSave(file, current)` - Occurs before agent saves current execution results to a file. Arguments can be modified.  
    - `file` {String} Execution results file path
    - `current` {Object} Current execution results


* `didSave(file)` - Occurs after agent saves current execution results to a file.  
    - `file` {String} Execution results file path


#### Running an Agent
Running an agent is as simple as running any other node module:  
`node ./my-agent.js`  
However, you might want to check out **WebSpy Operator**, which offers advanced 
features, such as agent scheduler (keep reading).

### Operator
WebSpy Operator is an optional component, which basically runs the agents for you on 
specific date and time or even on a recurring basis.  
Notice you can add multiple operators in the same file, just clone the operator variable
and extend it, too. This becomes handy when you want to to run your agents on
different schedules.

#### Agent Sample File

```javascript
'use strict';

var Operator = require('webspy').Operator;

module.exports = Operator.extend({
  // when or on what time basis you wish your agent(s) to run 
  (based on CRON syntax - http://crontab.org/):
  schedule: '30 * * * * *',
  // directory path where agent file is saved. the operator will run
  // every file on directory which matches the pattern:
  path: '/path/to/agent/files/*.js'
  // should operator run immediately without waiting for the next occurence? 
  pronto: true,
  // scheduler timezone (check this link for a list of valid timezones - https://www.vmware.com/support/developer/vc-sdk/visdk400pubs/ReferenceGuide/timezone.html):
  timezone: 'America/Los_Angeles',
  // callback function to execute when the job stops:
  callback: function () {
    console.log('Done!');
  }
});
```

#### CRON Syntax
When specifying your cron values you'll need to make sure that your values fall within the ranges. For instance, some cron's use a 0-7 range for the day of week where both 0 and 7 represent Sunday. We do not:
* **Units**
    * Seconds: 0-59
    * Minutes: 0-59
    * Hours: 0-23
    * Day of Month: 1-31
    * Months: 0-11
    * Day of Week: 0-6

* **Patterns**
    * `*` - any
    * `1-4,7` - range
    * `*/2` - steps
    
#### Examples
* `* * * * * *` - run every second
* `30 * * * * *` - run every 30 seconds
* `0 */5 * * * *` - run every 5 minutes
* `0 0 1 * * 1-5` - run every hour only on working days
* `0 30 14 1 6 *` - run on July 1st, 14:30 (month is 0 based index)

#### Glob Syntax Examples (for path definition)
* `*` Matches 0 or more characters in a single path portion
* `?` Matches 1 character
* `[...]` Matches a range of characters, similar to a RegExp range. If the first character of the range is ! or ^ then it matches any character not in the range.
* `!(pattern|pattern|pattern)` Matches anything that does not match any of the patterns provided.
* `?(pattern|pattern|pattern)` Matches zero or one occurrence of the patterns provided.
* `+(pattern|pattern|pattern)` Matches one or more occurrences of the patterns provided.
* `*(a|b|c)` Matches zero or more occurrences of the patterns provided
* `@(pattern|pat*|pat?erN)` Matches exactly one of the patterns provided
* `**` If a "globstar" is alone in a path portion, then it matches zero or more directories and subdirectories searching for matches. It does not crawl symlinked directories.

## Tips
* WebSpy shines as a productivity tool when it runs constantly. If you have your own
server, you might want to try [PM2](http://pm2.keymetrics.io/) as your operators process manager.
Otherwise, there are some really cool free hosting services, such as [OpenShift](https://www.openshift.com/), 
[Heroku](https://dashboard.heroku.com/) and more.

## Useful Links
* [Mustache Template Engine](https://www.npmjs.com/package/mustache)
* [json-query](https://www.npmjs.com/package/json-query)
* [Slack Webhooks](https://api.slack.com/incoming-webhooks)
* [CRON syntax](http://crontab.org/)
* [Valid timezones](ttps://www.vmware.com/support/developer/vc-sdk/visdk400pubs/ReferenceGuide/timezone.html)
* Free node.js hosting services:
    * [OpenShift](https://www.openshift.com/)
    * [Heroku](https://dashboard.heroku.com/)