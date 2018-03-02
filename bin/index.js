#!/usr/bin/env node
const ora = require('ora');
const inquirer = require('inquirer');
const CFonts = require('cfonts');
const chalk = require('chalk');
const Table = require('cli-table2');
const axios = require('axios');
const opn = require('opn');
const meow = require('meow');
const VERSION = meow().pkg.version;

const cliHelp = meow(`
  Search domain name via interactive cli
  $ domain-cli

  Or more directly
  $ domain-cli <URL>

  Show current version
  $ domain-cli -v

  Source code of this side project
  $ domain-cli -s
`);

let table = new Table({
  chars: {
    'top': '═',
    'top-mid': '╤',
    'top-left': '╔',
    'top-right': '╗',
    'bottom': '═',
    'bottom-mid': '╧',
    'bottom-left': '╚',
    'bottom-right': '╝',
    'left': '║',
    'left-mid': '╟',
    'mid': '─',
    'mid-mid': '┼',
    'right': '║',
    'right-mid': '╢',
    'middle': '│'
  },
  style: {
    head: [],
    border: []
  },
  colWidths: [30, 30]
});

let questions = [{
  type: 'input',
  name: 'domain',
  message: 'Input domain names you wanna check if registered please (e.g. google.com)'
}];

let search = function (website) {
  const spinner = ora('☕  Take a second ....  ').start();
  const sourceUrl = `https://api.domainsdb.info/search?query=${website}`;
  let domainInfo = [];
  axios.get(sourceUrl)
    .then(function (response) {
      spinner.stop();

      table.push(
        [{
          colSpan: 2,
          hAlign: 'center', 
          content: `📅  ${response.headers.date}`
        }],
        [{hAlign: 'center', content: `🔢  total: ${response.data.total}`}, {hAlign: 'center', content: `🕑  time: ${response.data.time}`}],
        [{
          colSpan: 2,
          hAlign: 'center',
          content: chalk.green('-------- 👀  Domain names list as the following 👇  --------')
        }]
      );

      function addEmoji (input) {
        return `🆔  ${input}`;
      }

      function addZero (input) {
        return `0${input}`;
      }

      function addLaptop (input) {
        return `💻   ${input}`;
      }

      for (let num = 0, leng = response.data.domains.length; num < leng; num ++) {
        domainInfo.push(new Array());
        domainInfo[num].push({
          hAlign: 'center', 
          content: (num + 1) >= 10 ? chalk.rgb(215, 156, 80)(addEmoji(num + 1)) : chalk.white(addEmoji(addZero(num + 1)))
        });
        domainInfo[num].push({
          hAlign: 'center', 
          content: chalk.cyan(addLaptop(response.data.domains[num].domain))
        });
      }

      for (let number = 0, leng = domainInfo.length; number < leng; number++) {
        table.push(domainInfo[number]);
      }

      console.log(table.toString());
    })
    .catch(function (error) {
      spinner.stop();
      console.log(chalk.cyan('👌  Congrats! Seems like an unregistered domain, cheers! 🍾  '));
    });
}

let run = function (obj) {
  if (obj[0] === '-v') {
    console.log(`Current version is ${VERSION}`);
  } else if (obj[0] === '-h') {
    console.log(cliHelp.help);
  } else if (obj[0] === '-s') {
    opn('https://github.com/WeiChiaChang/domain-cli');
  } else if (typeof obj[0] === 'string') {
    search(obj[0]);
  } else {
    CFonts.say('Domain-cli', {
      font: 'block', 
      align: 'left', 
      colors: ['candy'], 
      background: 'Black', 
      letterSpacing: 2, 
      lineHeight: 1, 
      space: true,
      maxLength: '0' 
    });

    inquirer.prompt(questions).then(function (answers) {
      search(answers.domain);
    });
  };
};

run(process.argv.slice(2));
