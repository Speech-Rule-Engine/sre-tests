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
import * as tu from '../base/test_util';
import * as TestFactory from '../classes/test_factory';
import * as sret from '../typings/sre';
import {addActual} from './fill_tests';
import {AbstractTransformer, Transformer} from './transformers';
import {Tex2Mml} from './tex_transformer';

/* ********************************************************* */
/*
 * Test generation for multiple expressions.
 *
 * Use case: We have a number of similar expression that represent corner cases
 *           or the tests for a particular issue. They all should be included
 *           with consecutively enumerated base names.
 */
/* ******************************************************** */

/**
 * Generates JSON test entries from lists of data elements. The input JSON is of
 * the form
 *
 * ```javascript
 * {
 *   "foo": [d0, d1, d2, ....],
 *   "bar": [e0, e1, e2, ....],
 *   ...
 * }
 * ```
 *
 * Output will be for the form
 *
 * ```javascript
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
 * ```
 *
 * @param {tu.JsonTest} json The initial JSON input.
 * @param {string=} field The optional field name, defaults to input.
 * @return {tu.JsonTests} The newly transformed JSON.
 */
export function transformInput(
  json: tu.JsonTest, field: string = 'input'): tu.JsonTests {
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
 *
 * @param input Input filename.
 * @param output Output filename.
 * @param field The optional field name, defaults to input.
 */
export function generateTestRequire(
  input: string, output: string, field: string = 'input') {
  let file = require(input);
  let oldJson = file[Object.keys(file)[0]];
  let newJson = transformInput(oldJson, field);
  tu.TestUtil.saveJson(output, newJson);
}

/**
 * Generates test from a json file.
 *
 * @param input Input filename.
 * @param output Output filename.
 * @param field The optional field name, defaults to input.
 */
export function generateTestJson(input: string, output: string,
  field: string = 'input') {
  let oldJson = tu.TestUtil.loadJson(input);
  let newJson = transformInput(oldJson, field);
  tu.TestUtil.saveJson(output, newJson);
}

/**
 * Runs a series of transformers on the given tests object.
 *
 * @param {tu.JsonTest[]} json The JSON tests.
 * @param {Transformer[]} transformers List of transformers.
 * @return {tu.JsonTest[]} The updated json test.
 */
export function transformTests(json: tu.JsonTest[],
  transformers: Transformer[]): tu.JsonTest[] {
  json.forEach(x => transformTest(x, transformers));
  return json;
}

/**
 * Runs a series of transformers on a single test.
 *
 * @param {tu.JsonTest} json The JSON test.
 * @param {Transformer[]} transformers List of transformers.
 * @return {tu.JsonTest} The updated json test.
 */
export function transformTest(
  json: tu.JsonTest, transformers: Transformer[]): tu.JsonTest {
  for (let transformer of transformers) {
    let src = json[transformer.src];
    if (typeof src !== undefined) {
      json[transformer.dst] = transformer.via(src);
    }
  }
  return json;
}

/**
 * Transforms test file in place.
 *
 * @param file File name.
 * @param transformers Transformer list.
 */
export function transformJsonTests(file: string,
  transformers: Transformer[]) {
  let json = tu.TestUtil.loadJson(file);
  transformTests(Object.values(json), transformers);
  tu.TestUtil.saveJson(file, json);
}

/**
 * Transforms test file in place.
 *
 * @param file File name.
 * @param transformers Transformer list.
 */
export function transformTestsFile(file: string,
  transformers: Transformer[]) {
  let json = tu.TestUtil.loadJson(file) as tu.JsonTest[];
  transformTests(json, transformers);
  tu.TestUtil.saveJson(file, json);
}

/* ********************************************************** */
/*
 * Test generation for the PreTeXt project.
 *
 * Use case: We get a list of expressions from a PreTeXt book. The need to be
 *           cleaned by combining duplicates and collating reference
 *           urls. Possibly split into different files.
 *
 * Workflow:
 * Run transformPretextSource('SOURCE.json', 'TARGET_BASENAME')
 *
 * * Loads file: Expects a list of basic tests.
 * * Cleans the sources
 * * Splits the sources into chunks wrt. some predicates.
 *
 * Note, `AddPretextReferences` adds new references to an existing file. This
 * should not be necessary for new files anymore.
 *
 */
/* ********************************************************** */

export class SemanticTransformer extends AbstractTransformer {

  /**
   * @override
   */
  public constructor(src: string = 'input', dst: string = 'stree') {
    super(src, dst);
  }

  /**
   * @override
   */
  public via(src: string) {
    return sre.Semantic.getTreeFromString(
      sre.Enrich.prepareMmlString(src)).xml().toString();
  }

}

// TODO: Convert this into class or namespace.
export let basename: string = '';
export let removeStree: boolean = true;

/**
 * Transforms a PreText source file by cleaning it, removing duplicates,
 * renaming tests, completing entries, and splitting them into smaller elements.
 *
 * @param file The source file.
 * @param name The basename for the output files.
 * @return The list of all transformed tests.
 */
export function transformPretextSource(file: string, name: string) {
  basename = name;
  let json = tu.TestUtil.loadJson(file) as tu.JsonTest[];
  let tests = cleanPretextSource(json);
  let allTests = splitPretextSource(tests);
  saveRenamedTests(allTests, 'rest');
  return allTests;
}

// Prepare: Add ids or insert ids from outside.
// Transform: Add input/stree, etc.
// Cleanup: Remove duplicates as much as possible

/**
 * @param json
 */
function cleanPretextSource(json: tu.JsonTest[]): tu.JsonTests {
  let count = 0;
  let result: tu.JsonTests = {};
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

// TODO: Cleanup.
/**
 * @param tests
 */
function splitPretextSource(tests: tu.JsonTests) {
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

/**
 * @param tests
 * @param pred
 */
function splitOffBySemantics(
  tests: tu.JsonTests, pred: (x: sret.SemanticNode) => boolean): tu.JsonTests {
  let result: tu.JsonTests = {};
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

/**
 * If removeStree is set it removes the stree entry in each test element.
 *
 * @param tests
 * @param prefix
 * @param dir
 */
function saveRenamedTests(
  tests: tu.JsonTests, prefix: string, dir: string = '/tmp') {
  let result: tu.JsonTests = {};
  let name = tu.TestUtil.capitalize(prefix);
  let capBase = tu.TestUtil.capitalize(basename);
  let count = 0;
  for (let test of Object.values(tests)) {
    if (removeStree) {
      delete test.stree;
    }
    result[name + '_' + count++] = test;
  }
  //
  let json: tu.JsonFile = {
    'factory': 'speech',
    'name': `PreTeXt${capBase}${name}Tests`,
    'information': `PreTeXt ${capBase} document ${name} expressions.`,
    'locale': 'nemeth',
    'domain': 'default',
    'style': 'default',
    'modality': 'braille',
    'tests': result
  };
  tu.TestUtil.saveJson(`${dir}/${basename}_${prefix}.json`, json);
  addActual(`${dir}/${basename}_${prefix}.json`);
}


export class PretextGenerator {

  protected basename: string = 'Test';
  public kind: string = 'Pretext';
  public tests: tu.JsonTests = {};
  public fileBase: tu.JsonFile = {
    'factory': 'speech',
    'locale': 'nemeth',
    'domain': 'default',
    'style': 'default',
    'modality': 'braille'
  };
  public transformers: Transformer[] = [
    new Tex2Mml(), new SemanticTransformer()
  ];

  constructor(public file: string) {
    this.prepare();
    this.transform();
  }

  public clean() {
    console.log(Object.keys(this.tests).length);
    let tex = new Map();
    let mml = new Map();
    let stree = new Map();
    for (let [id, test] of Object.entries(this.tests)) {
      // What if tex is snot given?
      let texId = tex.get(test.tex);
      let mmlId = mml.get(test.input);
      let streeId = stree.get(test.stree);
      let id = texId || mmlId || streeId || id;
      tex.set(test.tex, id);
      mml.set(test.input, id);
      stree.set(test.stree, id);
      // very pretext specific
      result[id].reference[test.id] = test.url;
    }
  return result;
}
  }
  
  public transform() {
    transformTests(Object.values(this.json), transformers);
  }
  
  public prepare() {
    let json = tu.TestUtil.loadJson(file) as tu.JsonTest[];
    let count = 0;
    for (let test of json) {
      id = `Test_${count++}`;
      this.tests[id] = test;
      test.reference = {};
    }
  }
  
}


// Auxiliary methods to belatedly add references to an existing pretext file.
/**
 * Adds references from the full PreTeXt document to a partial file. This is
 * done with respect to the semantic tree representation.
 *
 * @param {string} origFile The partial filename wrt. expected directory.
 * @param {string} refFile The path to the reference file.
 */
export function addPretextReferences(origFile: string, refFile: string) {
  let ref = tu.TestUtil.loadJson(refFile) as tu.JsonTest[];
  let refTests = cleanPretextSource(ref);
  let streeRefs: tu.JsonTests = {};
  // Associates references by their semantic trees.
  Object.entries(refTests).forEach(
    ([_x, y]) => streeRefs[y.stree] = y.reference);
  let orig = TestFactory.get(origFile);
  orig.prepare();
  addPretextReference(orig.inputTests, streeRefs);
  tu.TestUtil.saveJson(orig['baseFile'], orig.baseTests);
}

/**
 * Adds the reference to the elements of a test file.
 *
 * @param {tu.JsonTest[]} orig The original test file.
 * @param {tu.JsonTests} ref The references associated via their semantic tree
 * representations.
 */
function addPretextReference(orig: tu.JsonTest[], ref: tu.JsonTests) {
  for (let test of orig) {
    let stree = sre.Semantic.getTreeFromString(
      sre.Enrich.prepareMmlString(test.input)).xml().toString();
    let reference = ref[stree];
    if (reference) {
      test.reference = reference;
    }
    delete test.expected;
    delete test.name;
  }
}

/* ********************************************************** */
/*
 * Test generation from Elsevier experiments.
 *
 */
/* ********************************************************** */

// Specialist cleanup.
