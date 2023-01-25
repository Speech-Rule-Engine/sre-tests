// Copyright 2020 Volker Sorge
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @file Visualising semantic tree tests systematically.
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import * as fs from 'fs';
import * as path from 'path';

import * as Enrich from '../../speech-rule-engine/js/enrich_mathml/enrich';

import { TestPath, TestUtil } from '../base/test_util';

/**
 * Visulisases the content of the a JSON file with examples per filename.
 *
 * @param dir Output directory.
 * @param input Input file with examples.
*/
export function visualiseTests(dir: string = '',
                               input: string = 'EnrichExamples.json') {
  dir = path.join(TestPath.VISUALISE, dir);
  makeHeader(dir);
  let json = TestUtil.loadJson(TestPath.OUTPUT + input);
  let index = [];
  for (let [filename, entries] of Object.entries(json)) {
    if (!filename) continue;
    let file = path.basename(filename, path.extname(filename));
    index.push(file);
    let output = makeTitle(file);
    let count = 1;
    for (let entry of entries) {
      output += visualiseElement(entry, count);
      count++;
    }
    output += '\n' + footer;
    file = path.join(dir, file);
    TestUtil.makeDir(file);
    fs.writeFileSync(file + '.html', output);
  }
  makeIndexOld(dir, index);
}

/**
 *
 * @param {string} file
 */
export function visualiseTest(file: string, base: string) {
  file = path.relative(base, file);
  const dir = path.join(TestPath.VISUALISE, path.dirname(file));
  makeHeader(dir);
  const title = path.basename(file, path.extname(file));
  const input = TestUtil.fileExists(file, base);
  const tests = input ? TestUtil.loadJson(input) : {tests: {}};
  if (!tests.tests || tests.tests === 'ALL') {
    return;
  }
  let output = '';
  let count = 1;
  for (let entry of Object.values(tests.tests)) {
    if (!entry.input) continue;
    output += visualiseElement(entry.input, count);
    count++;
  }
  if (!output) {
    return;
  }
  output = makeTitle(title) + output + '\n' + footer;
  const outfile = path.join(dir, title + '.html');
  TestUtil.makeDir(outfile);
  fs.writeFileSync(outfile, output);
}

export function visualiseInputs() {
  let files = TestUtil.readDir('', TestPath.INPUT);
  // files.forEach(file => visualiseInput(path.relative(TestPath.INPUT, file)));
  files.forEach(file => visualiseTest(file, TestPath.INPUT));
}

export function visualiseExpected() {
  let files = TestUtil.readDir('nemeth', TestPath.EXPECTED);
  files.forEach(file => visualiseTest(file, TestPath.EXPECTED));
  // files.forEach(file => visualiseInput(path.relative(TestPath.EXPECTED, file)));
}

export function visualise() {
  visualiseInputs();
  visualiseExpected();
  makeIndex();
}


function makeIndexOld(dir: string, index: string[]) {
  let output = '<html>\n<body>\n<h1>Semantic Tests</h1>\n<ul>\n';
  for (let file of index.sort()) {
    output += `<li><a href="${file}.html">${file}</a></li>\n`;
  }
  output += '</ul>\n</body>\n</html>\n';
  let file = path.join(dir, 'index.html');
  fs.writeFileSync(file, output);
}

function makeIndex() {
  let files = TestUtil.readDir('', TestPath.VISUALISE, /\.html$/);
  let slotted = new Map();
  for (let file of files) {
    let base = path.relative(TestPath.VISUALISE, file);
    if (base.match(/index\.html$/)) continue;
    let dir = path.basename(path.dirname(file));
    slotted.has(dir) ?
      slotted.get(dir).push(base) :
      slotted.set(dir, [base]);
  }
  let output = '<html>\n<body>\n';
  for (let [dir, files] of slotted.entries()) {
    output += `<h1>${TestUtil.capitalize(dir)}</h1>\n`;
    output += '<ul>\n';
    for (let file of files.sort()) {
      output += `<li><a href="${file}">${path.basename(file, '.html')}</a></li>\n`;
    }
    output += '</ul>\n';
  }
  output += '</body>\n</html>\n';
  fs.writeFileSync(path.join(TestPath.VISUALISE, 'index.html'), output);
}

function visualiseElement(expr: string, count: number) {
  let output = `<div class="cell">\n`;
  output += `  <span class="counter">${count}</span>\n`;
  output += `  <span class="math">\n     ${Enrich.prepareMmlString(expr)}\n  </span>\n`;
  output += '  <span class="tree"></span>\n';
  output += '</div>\n';
  return output;
}

export let LOCAL = false;

let header = '';

function makeHeader(dir: string = '') {
  let basedir = path.join('..', path.relative(dir, TestPath.VISUALISE));
  let prefix = LOCAL ? `${basedir}/node_modules` : 'https://cdn.jsdelivr.net/npm';
  header = '<!DOCTYPE html>\n<html>\n<head>\n';
  header += '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>\n';
  header += `<link type="text/css" rel="stylesheet" href="${prefix}/sre-visualiser/styles/style.css"/>\n`
  header += `<script type="text/javascript" src="${prefix}/d3/dist/d3.min.js"></script>\n`;
  header += `<link type="text/css" rel="stylesheet" href="${prefix}/sre-visualiser/styles/tree.css"/>\n`;
  header += `<script src="${prefix}/speech-rule-engine/lib/sre.js"></script>\n`;
  header += `<script async src="${prefix}/mathjax-full/es5/tex-mml-chtml.js"></script>\n`;
  header += `<script type="text/javascript" src="${prefix}/sre-visualiser/lib/visualise.js"></script>`;

}

function makeTitle(title: string) {
  title = title.replace(/^\w/, x => x.toUpperCase());
  return header + `<title>${title}</title>\n</head>\n\n<body>\n<h1>${title}</h1>`;
}

const footer = '</body>\n<script type="text/javascript">\n' +
  'streeVis.HOVER_INFO.font = true;\n' +
  'streeVis.config.expanded = true;\n' +
  'streeVis.renderCells();\n' +
  '</script>\n</html>';
