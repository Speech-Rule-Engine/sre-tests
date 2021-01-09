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
 * @fileoverview Methods for generating tests from single expressions.
 *
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import {sre} from '../base/test_external';
import {JsonTest, JsonTests, TestUtil} from '../base/test_util';
import * as sret from '../typings/sre';
import {Transformer} from './transformers';

/************************************************************/
/*
 * Test generation for multiple expressions.
 *
 * Use case: We have a number of similar expression that represent corner cases
 *           or the tests for a particular issue. They all should be included
 *           with consecutively enumerated base names.
 */
/************************************************************/

/**
 * Generates JSON test entries from lists of data elements. The input JSON is of
 * the form
 *
 * {
 *   "foo": [d0, d1, d2, ....],
 *   "bar": [e0, e1, e2, ....],
 *   ...
 * }
 *
 * Output will be for the form
 *
 * {
 *   "foo_0": {"field": d0},
 *   "foo_1": {"field": d1},
 *   "foo_2": {"field": d2},
 *   ...
 *   "bar_0": {"field": e0},
 *   "bar_1": {"field": e1},
 *   "bar_2": {"field": e2},
 *   ...
 * }
 *
 * @param json The initial JSON input.
 * @param field The optional field name, defaults to input.
 * @return The newly transformed JSON.
 */
export function transformInput(json: JsonTest, field: string = 'input') {
  let result: {[name: string]: {}} = {};
  for (let [name, expressions] of Object.entries(json)) {
    let count = 0;
    if (!expressions.length) {
      continue;
    }
    if (expressions.length === 1) {
      let map: {[name: string]: string} = {};
      map[field] = expressions[0];
      result[name] = map;
      continue;
    }
    for (let expr of expressions) {
      let map: {[name: string]: string} = {};
      map[field] = expr;
      result[`${name}_${count++}`] = map;
    }
  }
  return result;
}

/**
 * Generates test using require to load. Needs to be exposed with
 * module.exports.
 * @param input Input filename.
 * @param output Output filename.
 * @param field The optional field name, defaults to input.
 */
export function generateTestRequire(input: string, output: string,
                                    field: string = 'input') {
  let file = require(input);
  let oldJson = file[Object.keys(file)[0]];
  let newJson = transformInput(oldJson, field);
  TestUtil.saveJson(output, newJson);
}

/**
 * Generates test from a json file.
 * @param input Input filename.
 * @param output Output filename.
 * @param field The optional field name, defaults to input.
 */
export function generateTestJson(input: string, output: string,
                                 field: string = 'input') {
  let oldJson = TestUtil.loadJson(input);
  let newJson = transformInput(oldJson, field);
  TestUtil.saveJson(output, newJson);
}

/**
 * Runs a series of transformers on the given tests.
 * @param json The JSON tests.
 * @param transformers List of transformers.
 */
export function transformTests(json: JsonTest,
                               transformers: Transformer[]) {
  for (let value of Object.values(json)) {
    for (let transformer of transformers) {
      value[transformer.dst] = transformer.via(value[transformer.src]);
    }
  }
  return json;
}

/**
 * Transforms test file in place.
 * @param file File name.
 * @param transformers Transformer list.
 */
export function transformTestsSource(file: string,
                                     transformers: Transformer[]) {
  let json = TestUtil.loadJson(file);
  TestUtil.saveJson(file, transformTests(json, transformers));
}

/************************************************************/
/*
 * Test generation for the PreTeXt project.
 *
 * Use case: We get a list of expressions from a PreTeXt book. The need to be
 *           cleaned by combining duplicates and collating reference
 *           urls. Possibly split into different files.
 */
/************************************************************/

export function transformPretextSource(file: string) {
  let json = TestUtil.loadJson(file) as JsonTest[];
  let tests = cleanPretextSource(json);
  let allTests = splitPretextSource(tests);
  saveRenamedTests(allTests, 'test');
  return allTests;
}

function cleanPretextSource(json: JsonTest[]) {
  let count = 0;
  let result: JsonTests = {};
  let tex = new Map();
  let mml = new Map();
  let stree = new Map();
  for (let test of json) {
    if (test.input) {
      // Possibly use the tex transformer here if input is missing.
      test.input = test.input.replace(/>[ \f\n\r\t\v​]+</g, '><').trim();
    }
    test.stree = sre.Semantic.getTreeFromString(test.input).xml().toString();
    let texId = tex.get(test.tex);
    let mmlId = mml.get(test.input);
    let streeId = stree.get(test.stree);
    let id = texId || mmlId || streeId;
    if (!id) {
      id = `Test_${count++}`;
      result[id] = test;
      test.reference = {};
    }
    tex.set(test.tex, id);
    mml.set(test.input, id);
    stree.set(test.stree, id);
    result[id].reference[test.id] = test.url;
  }
  return result;
}

function splitPretextSource(tests: JsonTests) {
  let numbers = splitOffBySemantics(
    tests, (x: sret.SemanticNode) =>
      x.type === 'number' || (x.type === 'prefixop' && x.role === 'negative'));
  saveRenamedTests(numbers, 'number');

  let letters = splitOffBySemantics(
    tests, (x: sret.SemanticNode) =>
      x.type === 'identifier' || x.type === 'overscore' ||
      ((x.type === 'subscript' || x.type === 'superscript') &&
        !!x.role.match(/letter/)));
  saveRenamedTests(letters, 'letter');

  let scripts = splitOffBySemantics(
    tests, (x: sret.SemanticNode) =>
      x.type === 'subscript' || x.type === 'superscript');
  saveRenamedTests(scripts, 'script');

  let appls = splitOffBySemantics(
    tests, (x: sret.SemanticNode) => x.type === 'appl');
  saveRenamedTests(appls, 'appl');

  let functions = splitOffBySemantics(
    tests, (x: sret.SemanticNode) =>
      x.type === 'relseq' && x.role === 'equality' &&
      x.childNodes.some(y => y.role === 'simple function'));
  saveRenamedTests(functions, 'function');

  let sets = splitOffBySemantics(
    tests, (x: sret.SemanticNode) =>
      x.type === 'relseq' && x.role === 'equality' &&
      x.childNodes.some(y => y.role.match(/^set/)));
  saveRenamedTests(sets, 'set');

  let equalities = splitOffBySemantics(
    tests, (x: sret.SemanticNode) =>
      (x.type === 'relseq' || x.type === 'multirel') && x.role === 'equality');
  saveRenamedTests(equalities, 'equality');

  let elements = splitOffBySemantics(
    tests, (x: sret.SemanticNode) =>
      x.textContent === '∈' || x.textContent === '∉' || (
        x.type === 'punctuated' && x.role === 'sequence' &&
          (x.childNodes[x.childNodes.length - 1].textContent === '∈' ||
            x.childNodes[x.childNodes.length - 1].textContent === '∉')
    ));
  saveRenamedTests(elements, 'element');

  let inequalities = splitOffBySemantics(
    tests, (x: sret.SemanticNode) =>
      (x.type === 'relseq' || x.type === 'multirel') &&
      x.role === 'inequality');
  saveRenamedTests(inequalities, 'inequality');

  let sums = splitOffBySemantics(
    tests, (x: sret.SemanticNode) =>
      x.type === 'infixop' &&
      (x.role === 'addition' || x.role === 'subtraction'));
  saveRenamedTests(sums, 'sum');

  let sequences = splitOffBySemantics(
    tests, (x: sret.SemanticNode) => x.type === 'punctuated');
  saveRenamedTests(sequences, 'sequence');

  return tests;
}

function splitOffBySemantics(
  tests: JsonTests, pred: (x: sret.SemanticNode) => boolean): JsonTests {
  let result: JsonTests = {};
  for (let [key, test] of Object.entries(tests)) {
    let stree = sre.SemanticTree.fromXml(
      sre.DomUtil.parseInput(test.stree)).root;
    if (pred(stree)) {
      result[key] = test;
      delete tests[key];
    }
  }
  return result;
}

function saveRenamedTests(tests: JsonTests, prefix: string, dir: string = '/tmp') {
  let result: JsonTests = {};
  let name = TestUtil.capitalize(prefix) + '_';
  let count = 0;
  for (let test of Object.values(tests)) {
    result[name + count++] = test;
  }
  TestUtil.saveJson(`${dir}/${prefix}.json`, result);
}
