#!/usr/bin/env node

/*
* @Author: Manraj Singh
* @Date:   2016-07-10 20:00:15
* @Last Modified by:   Manraj Singh
* @Last Modified time: 2016-07-24 22:10:51
*/

'use strict';

const yargs = require('yargs');
const fs = require('fs');
const ora = require('ora');
const chalk = require('chalk');
const config = require('./config');
const path = require('path');
const template = require('./template');
const languages = require('./languages');

/**
 * Returns full path of file
 */
const getPath = (folderPath, name) => {
  return path.resolve(folderPath, name);
}

/**
 * Returns file extension of param
 * @param  {string} lang [Language name]
 * @return {string}      [Extension of param language]
 */
const getExtension = (lang) => {
  return '';
}


/**
 * Returns if language is valid or not
 */
const validLang = (lang) => {

}

/**
 * Generates boiler plate 
 */
const generate = (folderPath, ques, lang) => {
  let files = [ques.toString() + getExtension(lang), 'input.txt', 'output.txt'];
  fs.mkdirSync(folderPath);
  for(let i = 0; i<files.length; i++) {
    fs.writeFileSync(getPath(folderPath, files[i]), '', 'utf8');
  }
}

const argv = yargs
  .usage('sudo $0 <command>')
  .command('gen', 'Generate boilerplate', (yargs) => {
    const argv = yargs
      .usage('Usage: $0 gen <options>')
      .demand(['q'])
      .alias('l', 'lang').describe('l', 'Language. Change `config` for default')
      .alias('q', 'ques').describe('q', 'Number of questions')
      .example('sudo $0 gen') // To-do
      .argv;
    let { l, q } = argv;
    l = l == undefined ? config['lang'] : l;

    for(let i = 1; i <= q; i++) {
      let folderPath = getPath(process.cwd(), i.toString());
      generate(folderPath, i, l);
    }
  })
  .command('add', 'Add default template', (yargs) => {
    const argv = yargs
      .usage('Usage: $0 add <options>')
      .demand(['t', 'l'])
      .alias('t', 'template').describe('t', 'Path to the template')
      .alias('l', 'lang').describe('l', 'Language')
      .example('$0') // To-do
      .argv;
    let { t, l } = argv;
    if( validLang( l ) ) {
      let obj = template;
      let data = fs.readFileSync(getPath(process.cwd(),t), 'utf8');
      obj[l] = data;
      fs.writeFileSync(getPath(__dirname,'template.json'), JSON.stringify(obj, null, 2), 'utf8');
    }
    else{
      console.log('Language entered is not supported.');
    }
  })
  .command('config', 'Change config file', (yargs) => {
    const argv = yargs
      .usage('Usage: $0 config')
      .alias('l', 'list').describe('l', 'List language and their code').boolean('l')
      .example('$0') // To-do
      .argv;

    if (argv.list){
      const spinner = ora('Getting languages').start();
      spinner.stop();
      /*var table = new Table({
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
      }*/
    }
    else {
      const questions = [{
        type: 'input',
        name: 'default_lang',
        message: 'Enter default language code <Leave blank in case unchanged>'
      } , {
        type: 'input',
        name: 'questions',
        message: 'Enter default number of questions <Leave blank in case unchanged>'
      }];
      inquirer.prompt(questions).then((answers) => {

      });
    }
  })
  .help('h')
  .alias('h', 'help')
  .argv;
