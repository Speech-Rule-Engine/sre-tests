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

import { TestPath, TestUtil } from '../base/test_util';
import * as fs from 'fs';
import * as path from 'path';


export function visualiseTests(input: string = 'EnrichExamples.json',
                               dir: string = 'visualise') {
  let json = TestUtil.loadJson(TestPath.OUTPUT + input);
  let index = [];
  for (let [filename, entries] of Object.entries(json)) {
    if (!filename) continue;
    let file = path.basename(filename, path.extname(filename));
    index.push(file);
    let output = makeHeader(file);
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
  makeIndex(dir, index);
}


function makeIndex(dir: string, index: string[]) {
  let output = '<html>\n<body>\n<h1>Semantic Tests</h1>\n<ul>\n';
  for (let file of index.sort()) {
    output += `<li><a href="${file}.html">${file}</a></li>\n`;
  }
  output += '</ul>\n</body>\n</html>\n';
  let file = path.join(dir, 'index.html');
  fs.writeFileSync(file, output);
}

function visualiseElement(expr: string, count: number) {
  let output = `<div class="cell">\n`;
  output += `  <span class="counter">${count}</span>\n`;
  output += `  <span class="math">\n     <math>${expr}</math>\n  </span>\n`;
  output += '  <span class="tree"></span>\n';
  output += '</div>\n';
  return output;
}
  

const header = '<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML//EN">\n<html>\n<head>\n' +
  '<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>\n' +
  '<link type="text/css" rel="stylesheet" href="https://speech-rule-engine.github.io/semantic-tree-visualiser/styles/style.css"/>\n' +
  '<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/d3/dist/d3.min.js"></script>\n' +
  '<link type="text/css" rel="stylesheet" href="https://speech-rule-engine.github.io/semantic-tree-visualiser/styles/tree.css"/>\n' +
  '<script src="https://cdn.jsdelivr.net/gh/speech-rule-engine/speech-rule-engine@deploy/lib/sre.js"></script>\n' +
  '<script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>\n' +
  '<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>\n' +
  '<script type="text/javascript" src="https://speech-rule-engine.github.io/semantic-tree-visualiser/lib/visualise.js"></script>';

function makeHeader(title: string): string {
  title = title.replace(/^\w/, x => x.toUpperCase());
  return header + `<title>${title}</title>\n</head>\n\n<body>\n<h1>${title}</h1>`;
}

const footer = '</body>\n<script type="text/javascript">\n' +
  'streeVis.config.expanded = true;\n' +
  'streeVis.renderCells();\n' +
  '</script>\n</html>';

