#!/usr/bin/env node

/*
* @Author: Manraj Singh
* @Date:   2016-07-10 20:00:15
* @Last Modified by:   Manraj Singh
* @Last Modified time: 2016-07-10 20:03:00
*/

'use strict';

const yargs = require('yargs');
const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');
const config = require('./config');

const argv = yargs
  .usage('$0 <command>')
  .command('run', 'Run code on HackerRank server', (yargs) => {
    var argv = yargs
      .usage('Usage: $0 run <options>')
      .demand(['s', 'i', 'o'])
      .alias('s', 'source').describe('s', 'Source Code file path')
      .alias('i', 'input').describe('i', 'Input file path')
      .alias('l', 'language').describe('l', 'Language. Change `config` for default.')
      .alias('o', 'output').describe('o', 'Output file path')
      .example('$0 run -s A.cpp -i Input00.in -o Output.txt -l 2')
      .argv;

    if(config.api_key === ""){
      console.log(chalk.red("Please add API KEY to config. Run `sudo hackerrank config` for this."));
      openIssue();
      process.exit(-1);
    }

    const source = fs.readFileSync(argv.source, 'utf8');
    const input = fs.readFileSync(argv.input, 'utf8');
    const output = argv.output;
    const spinner = ora('Running').start();
    const lang = argv.language === undefined ? config.default_lang : argv.language;
    var data = {
      'api_key': config.api_key,
      'source': source,
      'lang': parseInt(lang),
      'testcases': '['+ JSON.stringify(input) +']'
    };
    request.post({ url : RUN_URL, form : data}, (err,response) => {
      if(err){
        spinner.stop();
        console.log(chalk.red('Error Occured'));
        openIssue();
      }
      else{
        spinner.stop();
        const result = JSON.parse(response.body).result;
        if(result.compilemessage != ''){
          console.log(chalk.red('Compilation Error'));
          console.log(chalk.red(result.compilemessage));
          process.exit(-1);
        }
        var data = result.stdout[0] === undefined ? "" : result.stdout[0];
        fs.writeFileSync(output, data, 'utf8');
        var table = new Table({
          head: ['Message', 'Memory', 'Time'],
          colWidths: [20, 20, 20]
        });
        table.push([ result["message"], result["memory"][0], result["time"][0] ]);
        console.log(table.toString());
        end();
      }
    });
  })
  .command('config', 'Change config file', (yargs) => {
    var argv = yargs
      .usage('Usage: sudo $0 config [options]')
      .alias('l', 'list').describe('l', 'List language and their code').boolean('l')
      .example('sudo $0 config -l')
      .argv;

    if (argv.list){
      const spinner = ora('Getting languages').start();
      request(LANG_URL, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          var languages = JSON.parse(body), 
              names = languages.languages.names, 
              codes = languages.languages.codes;
          spinner.stop();
          var table = new Table({
            head: ['Language', 'Code', 'Number'],
            colWidths: [20, 20, 20]
          });
          for(let name in names){
            table.push([names[name], name, codes[name]]);
          }
          console.log(table.toString());
          end();
        } else {
          spinner.stop();
          console.log(chalk.red(error));
          openIssue();
        }
      });
    }
    else{
      const questions = [{
          type: 'input',
          name: 'api_key',
          message: 'Enter API Key <leave blank incase unchanged>'
        } , {
          type: 'input',
          name: 'default_lang',
          message: 'Enter default language number (Run `sudo hackerrank config -l` to list codes)'
      }];
      inquirer.prompt(questions).then((answers) => {
        var obj = config;
        if (answers.api_key !== ''){
          obj.api_key = answers.api_key;
        }
        if (answers.default_lang !== ''){
          obj.default_lang = answers.default_lang;
        }
        fs.writeFileSync(__dirname+'/config.json', JSON.stringify(obj, null, 2), 'utf8');
      });
    }
  })
  .help('h')
  .alias('h', 'help')
  .argv;