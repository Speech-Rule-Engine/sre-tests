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
  makeHeader(true);
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

let header = '';

function makeHeader(local: boolean = false) {
  // TODO: compute correct local node_modules directory from base.
  let prefix = local ? '../node_modules' : 'https://cdn.jsdelivr.net/npm';
  header = '<!DOCTYPE html>';
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
  'streeVis.config.expanded = true;\n' +
  'streeVis.renderCells();\n' +
  '</script>\n</html>';
