// Script to setup tests.

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const indir = 'expected/';
const jsondir = 'ts/json/';
const alldir = 'ts/output/';  // To run tests with output.
const analysedir = 'ts/analyse/';  // To run tests with analytics.
const analysisdir = 'analysis';

const allAnalyse = [];
const allOutputs = {};

let addAllOutputs = function(out, path) {
  if (!allOutputs[out]) {
    allOutputs[out] = [];
  }
  allOutputs[out].push(path);
};

/**
 * Recursively find all files with .json extension under the given path.
 * @param path The top pathname.
 * @param result Accumulator for pathnames.
 */
let readDir = function(path, result) {
  if (typeof path === 'undefined') {
    return;
  }
  let file = indir + path;
  if (fs.lstatSync(file).isDirectory()) {
    let files = fs.readdirSync(file);
    files.forEach(
      x => readDir(path ? path + '/' + x : x, result));
    return;
  }
  if (path.match(/\.json$/)) {
    let grep = cp.spawnSync('grep', ['"active"', file]);
    if (!grep.status) {
      addAllOutputs(
        grep.stdout.toString()
          .match(/\"active\": *\"(.*)\"/)[1],
        file);
    }
    grep = cp.spawnSync('grep', ['"name"', file]);
    if (!grep.status) {
      allAnalyse.push(path);
      // allAnalyse.set(
      //   grep.stdout.toString()
      //     .match(/\"name\": *\"(.*)\"/)[1], path);
    }
    result.push(path);
  }
};

let createFile = function(dir, file, content) {
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(dir + '/' + file, content.join('\n'));
};

let createJsonTests = function(files) {
  for (let file of files) {
    let dir = path.dirname(file);
    let depth = dir.match(/\//g);
    let base = Array((depth ? depth.length : 0) + 3).join('../');
    let content = [];
    content.push(`import {ExampleFiles} from '${base}classes/abstract_examples';`);
    content.push(`import {runJsonTest} from '${base}jest';`);
    content.push('ExampleFiles.noOutput = true;');
    content.push(`runJsonTest('${file}');`);
    content.push(``);
    createFile(jsondir + dir, path.basename(file).replace(/.json$/, '.test.ts'), content);
  }
};

let createOutputTests = function() {
  for (let file of Object.keys(allOutputs)) {
    let files = allOutputs[file];
    let content = [];
    content.push(`import {ExampleFiles} from '../classes/abstract_examples';`);
    content.push(`import {runJsonTest} from '../jest';`);
    content.push('afterAll(() => {\n  ExampleFiles.closeFiles();\n});');
    files.forEach(x => content.push(`runJsonTest('${x}');`));
    content.push(``);
    createFile(alldir, file + '.test.ts', content);
  }
};


let createAnalyseTests = function() {
  for (let file of allAnalyse) {
    let dir = path.dirname(file);
    let depth = dir.match(/\//g);
    let base = Array((depth ? depth.length : 0) + 3).join('../');
    let content = [];
    content.push(`import AnalyticsTest from '${base}analytics/analytics_test';`);
    content.push(`import {ExampleFiles} from '${base}classes/abstract_examples';`);
    content.push(`import {runJsonTest} from '${base}jest';`);
    content.push('AnalyticsTest.deep = true;');
    content.push('ExampleFiles.noOutput = true;');
    content.push('afterAll(() => {\n  AnalyticsTest.output();\n});');
    content.push(`runJsonTest('${file}');`);
    content.push(``);
    createFile(analysedir + dir, path.basename(file).replace(/.json$/, '.test.ts'), content);
  }
};

let createFiles = function() {
  let files = [];
  readDir('', files);
  createJsonTests(files);
  createOutputTests();
  createAnalyseTests(files);
};

let createHtmlFiles = function() {
  let languages = {};
  let tables = {};
  for (let key of Object.keys(allOutputs)) {
    let language = key.match(/^DefaultSymbols(.*)/);
    if (!language || !language[1]) continue;
    languages[language[1]] = allOutputs[key][0].split('/')[1];
    tables[language[1]] = {};
  }
  for (let [language, iso] of Object.entries(languages)) {
    let output = Object.keys(allOutputs).filter(x => x.match(language));
    for (let file of output) {
      let type = allOutputs[file][0].split('/')[2];
      if (tables[language][type]) {
        tables[language][type].push(file);
      } else {
        tables[language][type] = [file];
      }
    }
  }
  let str = '';
  let cap = x => x[0].toUpperCase() + x.slice(1);
  for (let language of Object.keys(tables).sort()) {
    let iso = languages[language];
    str += `<h2 id="${language}">${language}</h2>\n`;
    str += '<table border="2">\n';
    for (let [type, files] of Object.entries(tables[language])) {
      str += `<tr><th>${cap(type)}</th></tr>\n`;
      for (let file of files) {
        str += `<tr><td><a href="${iso}/${file}.html">${file}</a></td></tr>\n`;
      }
    }
    str += '</table>';
    str += '\n\n';
  }
  fs.writeFileSync('output/index.html', '<html>\n<body>\n' + str+ '</body>\n</html>\n');
};

let cleanFiles = function() {
  fs.rmdirSync(jsondir, {recursive: true});
  fs.rmdirSync(alldir, {recursive: true});
  fs.rmdirSync(analysedir, {recursive: true});
};

let build = function() {
  cleanFiles();
  createFiles();
  createHtmlFiles();
};

module.exports.build = build;
module.exports.clean = cleanFiles;
build();
