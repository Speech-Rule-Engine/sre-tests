// Script to setup tests.

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const indir = 'expected/';
const jestdir = 'ts/jest/';
const alldir = 'ts/output/';  // To run tests with output.


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
    result.push(path);
  }
};

let createFile = function(dir, file, content) {
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(dir + '/' + file, content.join('\n'));
};

let createFiles = function() {
  let files = [];
  readDir('', files);
  createJsonTests(files);
  createOutputTests();
};

let createJsonTests = function(files) {
  for (let file of files) {
    let dir = path.dirname(file);
    let depth = dir.match(/\//g);
    let base = Array((depth ? depth.length : 0) + 3).join('../');
    let content = [];
    content.push(`import {runJsonTest} from '${base}jest'`);
    content.push(`import {ExampleFiles} from '${base}classes/abstract_examples'`);
    content.push('ExampleFiles.noOutput = true;');
    content.push(`runJsonTest('${file}');`);
    createFile(jestdir + dir, path.basename(file).replace(/.json$/, '.test.ts'), content);
  }
};

let createOutputTests = function() {
  for (let file of Object.keys(allOutputs)) {
    let files = allOutputs[file];
    let content = [];
    content.push(`import {runJsonTest} from '../jest'`);
    content.push(`import {ExampleFiles} from '../classes/abstract_examples'`);
    content.push('afterAll(() => {ExampleFiles.closeFiles();});');
    files.forEach(x => content.push(`runJsonTest('${x}');`));
    createFile(alldir, file + '.test.ts', content);
  }
};


let cleanFiles = function() {
  fs.rmdirSync(jestdir, {recursive: true});
  fs.rmdirSync(alldir, {recursive: true});
};


let build = function() {
  cleanFiles();
  createFiles();
};

build();
