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
import {Tex2Mml} from './tex_transformer';
import {AbstractTransformer, Transformer} from './transformers';

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

/**
 * Splitters filter by some constellation of the semantic tree.
 */
export class Splitter {

  constructor(public name: string,
              public pred: (n: sret.SemanticNode) => boolean) {}

  /**
   * @param tests
   * @param pred
   */
  public split(tests: tu.JsonTests): tu.JsonTests {
    let result: tu.JsonTests = {};
    for (let [key, test] of Object.entries(tests)) {
      let stree = sre.SemanticTree.fromXml(
        sre.DomUtil.parseInput(test.stree)).root;
      if (this.pred(stree)) {
        result[key] = test;
        delete tests[key];
      }
    }
    return result;
  }

}

export namespace SplitterFactory {

  let mapping = new Map();

  export function get(name: string) {
    return mapping.get(name);
  }

  export function set(name: string, pred: (n: sret.SemanticNode) => boolean) {
    mapping.set(name, new Splitter(name, pred));
  }

  SplitterFactory.set('number', (x: sret.SemanticNode) =>
    x.type === 'number' || (x.type === 'prefixop' && x.role === 'negative'));
  SplitterFactory.set('letter', (x: sret.SemanticNode) =>
    x.type === 'identifier' || x.type === 'overscore' ||
    ((x.type === 'subscript' || x.type === 'superscript') &&
      !!x.role.match(/letter/)));
  SplitterFactory.set('script', (x: sret.SemanticNode) =>
        x.type === 'subscript' || x.type === 'superscript');
  SplitterFactory.set('appl', (x: sret.SemanticNode) => x.type === 'appl');
  SplitterFactory.set('function', (x: sret.SemanticNode) =>
    x.type === 'relseq' && x.role === 'equality' &&
    x.childNodes.some(y => y.role === 'simple function'));
  SplitterFactory.set('set', (x: sret.SemanticNode) =>
    x.type === 'relseq' && x.role === 'equality' &&
    x.childNodes.some(y => y.role.match(/^set/)));
  SplitterFactory.set('equality', (x: sret.SemanticNode) =>
    (x.type === 'relseq' || x.type === 'multirel') && x.role === 'equality');
  SplitterFactory.set('element', (x: sret.SemanticNode) =>
    x.textContent === '∈' || x.textContent === '∉' || (
      x.type === 'punctuated' && x.role === 'sequence' &&
        (x.childNodes[x.childNodes.length - 1].textContent === '∈' ||
          x.childNodes[x.childNodes.length - 1].textContent === '∉')));
  SplitterFactory.set('inequality', (x: sret.SemanticNode) =>
    (x.type === 'relseq' || x.type === 'multirel') && x.role === 'inequality');
  SplitterFactory.set('sum', (x: sret.SemanticNode) =>
    x.type === 'infixop' &&
    (x.role === 'addition' || x.role === 'subtraction'));
  SplitterFactory.set(
    'sequence', (x: sret.SemanticNode) => x.type === 'punctuated');
  SplitterFactory.set(
    'fenced', (x: sret.SemanticNode) => x.type === 'fenced');
  SplitterFactory.set(
    'prefix',  (x: sret.SemanticNode) => !!x.querySelectorAll(
      (y: sret.SemanticNode) => y.role === 'prefix function').length);
  SplitterFactory.set('simpequ', (x: sret.SemanticNode) =>
    x.type === 'relseq' && x.role === 'equality' &&
    x.childNodes.every(y => y.type === 'identifier' || y.type === 'number'));
}

const PretextSplitters = new Map([
  ['aata', ['number', 'letter', 'script', 'appl', 'function', 'set',
            'equality', 'element', 'inequality', 'sum', 'sequence']],
  ['acs', ['number', 'letter', 'prefix', 'appl', 'function', 'simpequ',
           'equality', 'inequality', 'sum', 'sequence', 'fenced']]
]);


abstract class AbstractGenerator {

  public kind: string;
  public tests: tu.JsonTests = {};
  public fileBase: tu.JsonFile = {};
  public transformers: Transformer[] = [];
  public remove: string[] = [];
  public splitters: string[] = [];

  /**
   * @param {string} file The filename to use for the generator.
   */
  constructor(public file: string,
              protected basename: string = 'Test',
              protected outdir: string = '/tmp') {
    this.prepare();
  }

  public run() {
    this.transform();
    this.collate();
    this.split();
    this.save(this.tests, this.splitters.length ? 'rest' : '');
  }

  /**
   * Splitting of test files.
   */
  public split() {
    for (let name of this.splitters) {
      let splitter = SplitterFactory.get(name);
      if (splitter) {
        let tests = splitter.split(this.tests);
        this.save(tests, name);
      }
    }
  }

  /**
   * Save of test files.
   */
  public save(tests: tu.JsonTests, prefix: string = '') {
    let name = tu.TestUtil.capitalize(prefix);
    let basename = tu.TestUtil.capitalize(this.basename);
    let kind = tu.TestUtil.capitalize(this.kind);
    let json: tu.JsonFile = Object.assign({}, this.fileBase);
    json.name = `${kind}${basename}${name}Tests`,
    json.information = `${kind} ${basename} document` +
      (name ? ` ${name} expressions.` : '');
    json.tests = this.clean(tests, name);
    let outfile = `${this.outdir}/${this.basename}` +
      (name ? `_${prefix}` : '') + '.json';
    tu.TestUtil.saveJson(outfile, json);
    this.addExpected(outfile);
  }

  /**
   * Adds expected values to the element.
   * 
   * @param {string} outfile The output file name.
   */
  protected addExpected(outfile: string) {
    addActual(outfile);
  }

  /**
   * Clean tests by removing remove entries. Renames tests if a new name is
   * provided.
   * 
   * @param {tu.JsonTests} tests The list of tests.
   * @param {string = ''} name The new name for the tests.
   * @return {tu.JsonTests} The cleaned list.
   */
  public clean(tests: tu.JsonTests, name: string = ''): tu.JsonTests {
    let result: tu.JsonTests = {};
    let count = 0;
    for (let [id, test] of Object.entries(tests)) {
      for (let remove of this.remove) {
        delete test[remove];
      }
      result[name ? name + '_' + count++ : id] = test;
    }
    return result;
  }

  /**
   * Cleans tests by removing duplicates and collating references.
   */
  public collate() {
    console.log(Object.keys(this.tests).length);
    let stree = new Map();
    let result: tu.JsonTests = {};
    for (let [name, test] of Object.entries(this.tests)) {
      let streeId = stree.get(test.stree);
      if (!streeId) {
        stree.set(test.stree, name);
        streeId = name;
        result[streeId] = test;
      }
      this.collateTest(result[streeId], test);
    }
    this.tests = result;
    console.log(Object.keys(this.tests).length);
  }


  protected abstract collateTest(
    retain: tu.JsonTest, discard: tu.JsonTest): void;
  
  /**
   * Applies the transformers.
   */
  public transform() {
    transformTests(Object.values(this.tests), this.transformers);
  }

  /**
   * Preparation of input tests.
   */
  public prepare() {
    let json = tu.TestUtil.loadJson(this.file) as tu.JsonTest[];
    let count = 0;
    for (let test of json) {
      let id = `${this.basename}_${count++}`;
      this.tests[id] = test;
      this.prepareTest(test);
    }
  }

  protected abstract prepareTest(test: tu.JsonTest): void;
  
}

export class PretextGenerator extends AbstractGenerator {

  public kind: string = 'Pretext';
  public fileBase: tu.JsonFile = {
    'factory': 'speech',
    'locale': 'nemeth',
    'domain': 'default',
    'style': 'default',
    'modality': 'braille'
  };
  protected texTransformer: Tex2Mml;
  public remove: string[] = ['stree'];

  /**
   * Adds expected values to the element.
   * 
   * @param {string} outfile The output file name.
   */
  protected addExpected(outfile: string) {
    addActual(outfile);
  }

  /**
   * Cleans tests by removing duplicates and collating references.
   */
  public collateTest(retain: tu.JsonTest, discard: tu.JsonTest) {
    // This is very pretext specific.
    retain.reference[discard.id] = discard.url;
  }

  /**
   * Applies the transformers.
   */
  public transform() {
    transformTests(Object.values(this.tests), this.transformers);
  }

  /**
   * Preparation of input tests.
   */
  public prepare() {
    this.splitters = PretextSplitters.get(this.basename);
    this.texTransformer = new Tex2Mml();
    this.texTransformer.display = false;
    this.transformers = [this.texTransformer, new SemanticTransformer()];
    super.prepare();
  }

  protected prepareTest(test: tu.JsonTest) {
    test.reference = {};
  }

  // Auxiliary methods to belatedly add references to an existing pretext file.
  /**
   * Adds references from the full PreTeXt document to a partial file. This is
   * done with respect to the semantic tree representation.
   *
   * @param {string} origFile The partial filename wrt. expected directory.
   * @param {string} refFile The path to the reference file.
   */
  public static addPretextReferences(origFile: string, refFile: string) {
    let refTests = new PretextGenerator(refFile);
    refTests.collate();
    let streeRefs: tu.JsonTests = {};
    // Associates references by their semantic trees.
    Object.entries(refTests).forEach(
      ([_x, y]) => streeRefs[y.stree] = y.reference);
    let orig = TestFactory.get(origFile);
    orig.prepare();
    PretextGenerator.addPretextReference(orig.inputTests, streeRefs);
    tu.TestUtil.saveJson(orig['baseFile'], orig.baseTests);
  }

  /**
   * Adds the reference to the elements of a test file.
   *
   * @param {tu.JsonTest[]} orig The original test file.
   * @param {tu.JsonTests} ref The references associated via their semantic tree
   * representations.
   */
  private static addPretextReference(orig: tu.JsonTest[], ref: tu.JsonTests) {
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

}


/* ********************************************************** */
/*
 * Test generation from Elsevier experiments.
 *
 */
/* ********************************************************** */

// Specialist cleanup.
