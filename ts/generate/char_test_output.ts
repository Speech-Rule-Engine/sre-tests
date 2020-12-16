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
 * @fileoverview Methods for regenerating character tests.
 *
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import * as fs from 'fs';
import {sre} from '../base/test_external';
import {JsonFile, JsonTest, JsonTests, TestPath, TestUtil} from '../base/test_util';

// All files that are generated.
const InputPath = TestPath.INPUT + 'common/';
enum SymbolType {
  CHARACTERS = 'symbols',
  FUNCTIONS = 'functions',
  SIUNITS = 'si_units',
  UNITS = 'units'
}
const FILES = new Map([
  [SymbolType.UNITS, 'units.json'],
  [SymbolType.SIUNITS, 'si_units.json'],
  [SymbolType.CHARACTERS, 'characters.json'],
  [SymbolType.FUNCTIONS, 'functions.json']
]);

/**
 * Loads the base file.
 * @param file The base file.
 * @return The symbol keys in the base.
 */
function loadBaseFile(file: string): string[] {
  console.log(file);
  const json = TestUtil.loadJson(file);
  console.log(Object.keys(json.tests).length);
  return Object.keys(json.tests);
}

function getCharOutput(
  dom: string, modality: string, loc: string, style: string, char: string) {
  let aural = sre.AuralRendering.getInstance();
  sre.SpeechRuleEngine.getInstance().clearCache();
  sre.System.getInstance().setupEngine({
    domain: dom, modality: modality, locale: loc, style: style});
  // let grammar = {translate: true};
  let descrs = [
    sre.AuditoryDescription.create({text: char},
                                   {adjust: true, translate: true})];
  return aural.finalize(aural.markup(descrs));
}

function getUnitOutput(
  dom: string, modality: string, loc: string, style: string, unit: string) {
  sre.Grammar.getInstance().pushState({annotation: 'unit'});
  let output = getCharOutput(dom, modality, loc, style, unit);
  sre.Grammar.getInstance().popState();
  return output;
}

function getOutput(
  dom: string, modality: string, loc: string, style: string,
  char: string, unit = false) {
  return unit ? getUnitOutput(dom, modality, loc, style, char) :
    getCharOutput(dom, modality, loc, style, char);
}

const AllConstraints: {[loc: string]: string[]} = {
  en: ['default', 'mathspeak', 'clearspeak'],
  es: ['default', 'mathspeak'],
  fr: ['default', 'mathspeak', 'clearspeak'],
  de: ['default', 'mathspeak', 'clearspeak'],
  nemeth: ['default']
};

/**
 * Gets all the expected values for a given locale for the tests in the base
 * file.
 * @param locale The locale.
 * @param keys The keys for symbols to test.
 * @param unit Is it his unit tests.
 * @return The test json structure.
 */
function testOutput(locale: string, keys: string[], unit = false): JsonFile {
  let constraints = AllConstraints[locale];
  if (!constraints) {
    return {};
  }
  let output: JsonFile = {};
  let modality = locale === 'nemeth' ? 'braille' : 'speech';
  for (let dom of constraints) {
    let json: JsonFile = {
      'name': '',
      'locale': locale,
      'domain': dom,
      'styles': ['default']
    };
    let tests: JsonTests = {};
    for (let key of keys) {
      if (key.match(/^_comment/)) {
        continue;
      }
      let expected: string[] = [];
      let result = getOutput(dom, modality, locale, 'default', key, unit);
      expected.push(result);
      tests[key] = {'expected': expected};
    }
    json.tests = tests;
    output[dom] = json;
  }
  return output;
}

/**
 * Test if this is a unit file type.
 * @param kind The type.
 */
function isUnitTest(kind: SymbolType) {
  return kind === SymbolType.UNITS || kind === SymbolType.SIUNITS;
}

export function testFromBase(locale: string, kind: SymbolType): JsonFile {
  let file = InputPath + FILES.get(kind);
  if (!file) {
    return [];
  }
  let keys = loadBaseFile(file);
  return testOutput(locale, keys, isUnitTest(kind));
}

// Loads the locale symbol file from mathmaps and generates the actual output.
export function testFromLocale(locale: string, kind: SymbolType): JsonFile {
  let file = sre.BaseUtil.makePath(sre.SystemExternal.jsonPath) +
      locale + '.js';
  let json = JSON.parse(sre.MathMap.loadFile(file));
  let keys = getNamesFor(json, kind);
  return testOutput(locale, keys, isUnitTest(kind));
}

export function testFromExtras(locale: string, kind: SymbolType): JsonFile {
  let file = sre.BaseUtil.makePath(sre.SystemExternal.jsonPath) +
      locale + '.js';
  let json = JSON.parse(sre.MathMap.loadFile(file));
  let extras = getExtrasFor(locale, json, kind);
  console.log('Extras:');
  console.log(extras);
  return testOutput(locale, [], isUnitTest(kind));
}

export function getExtrasFor(
  locale: string, json: JsonTests, kind: SymbolType) {
  let symbols = symbolsfromLocale(json, kind);
  let domains = AllConstraints[locale];
  let extras: JsonTests = {};
  for (let symbol of symbols) {
    if (!symbol.mappings || !symbol.key) {
      continue;
    }
    let mappings = symbol.mappings;
    for (let [domain, styles] of Object.entries(mappings)) {
      if (domains.indexOf(domain) === -1) {
        extras[symbol.key] = mappings;
        continue;
      }
      let result: JsonTest = {};
      for (let [style, _] of Object.entries(styles)) {
        if (style === 'default') {
          continue;
        }
        if (result[domain]) {
          result[domain].push(style);
        } else {
          result[domain] = [style];
        }
      }
      if (Object.keys(result).length) {
        extras[symbol.key] = result;
      }
    }
  }
  return extras;
}

// Run with e.g.:
// testOutputFromBase('de', 'units');
/**
 * Gets all the expected values for a given locale for the tests in the base
 * file.
 * @param  locale The locale.
 * @param  kind The kind of symbol for which to generate tests.
 * @param  dir Output directory.
 */
export function testOutputFromBase(locale: string, kind: SymbolType, dir = '/tmp') {
  let output = testFromBase(locale, kind);
  for (let [_dom, json] of Object.entries(output)) {
    writeOutputToFile(dir, json, locale, json.domain, kind);
  }
}

export function testOutputFromLocale(
  locale: string, kind: SymbolType, dir = '/tmp') {
  let output = testFromLocale(locale, kind);
  for (let [_dom, json] of Object.entries(output)) {
    writeOutputToFile(dir, json, locale, json.domain, kind);
  }
}

/**
 * Compiles test output using both the locale and base file as input and writes
 * it to the destination directory.
 * @param {string} locale The locale.
 * @param {SymbolType} kind The type of symbol that is considered.
 * @param {string = '/tmp'} dir The output directory.
 */
export function testOutputFromBoth(
  locale: string, kind: SymbolType, dir: string = '/tmp') {
  let output = testFromBase(locale, kind);
  let comp = diffBaseVsLocale(locale, kind);
  for (let [_dom, json] of Object.entries(output)) {
    let [base, loc] = comp[json.domain];
    if (Object.keys(base).length && kind !== SymbolType.CHARACTERS) {
      json.exclude = Object.keys(base);
    }
    Object.assign(json.tests, loc);
    writeOutputToFile(dir, json, locale, json.domain, kind);
  }
}

/**
 * Writes JSON output to a file.
 * @param {string} dir The target directory.
 * @param {JsonFile} json The JSON structure to output.
 * @param {string} locale The locale.
 * @param {string} dom The domain name for the tests.
 * @param {SymbolType} kind The type of symbols.
 */
function writeOutputToFile(
  dir: string, json: JsonFile, locale: string, dom: string, kind: SymbolType) {
  TestUtil.saveJson(`${dir}/${locale}/${dom}_${FILES.get(kind)}`, json);
}

function symbolsfromLocale(json: JsonTest, kind: SymbolType): JsonTest[] {
  let keys = Object.keys(json);
  let si = kind === SymbolType.SIUNITS;
  let symbols = keys.filter(j => j.match(RegExp(`^.+/${si ? 'units' : kind}/.+\.js`)));
  let result: JsonTest[] = [];
  for (let key of symbols) {
    result = result.concat(json[key]);
  }
  return result;
}

/**
 * Computes a list of all names available in the JSON structure for the
 * particular symbol type. Note, that the JSON structure is the locale one,
 * mapping filenames to symbol mappings. This also takes care of SI units.
 * @param {JsonTest} json The locale JSON structure.
 * @param {SymbolType} kind The type of symbol.
 * @return {string[]} The list of names.
 */
function getNamesFor(json: JsonTest, kind: SymbolType): string[] {
  let symbols = symbolsfromLocale(json, kind);
  let si = kind === SymbolType.SIUNITS;
  let prefixes = json[Object.keys(json).find(j => j.match(/^.+\/si\/prefixes\.js/))][0];
  let result: string[] = [];
  for (let obj of symbols) {
    if (si && obj.names && obj.si) {
      result = result.concat(getSINamesFor(prefixes, obj.names));
      continue;
    }
    if (!si && obj.names && !obj.si) {
      result = result.concat(obj.names);
    }
  }
  return result;
}

/**
 * Generates the SI unit names.
 * @param {string[]} prefixes The list of prefixes.
 * @param {string} names The base unit name.
 * @return {string[]} The list of SI units with prefixes.
 */
function getSINamesFor(prefixes: string[], names: string): string[] {
  let result: string[] = [];
  prefixes = Object.keys(prefixes);
  for (const name of names) {
    result = result.concat(prefixes.map(p => p + name));
    result.push(name);
  }
  return result;
}

// Difference between base file and locale. Returns only elements that are not
// in both.
//
// One is from base tests
// Two is from locale
export function diffBaseVsLocale(locale: string, kind: SymbolType): JsonTest {
  let output1 = testFromBase(locale, kind);
  let output2 = testFromLocale(locale, kind);
  let result: JsonTest = {};
  for (const dom of Object.keys(output1)) {
    let tests1 = output1[dom].tests;
    let tests2 = output2[dom].tests;
    for (const key of Object.keys(tests1)) {
      if (tests2[key]) {
        delete tests2[key];
        delete tests1[key];
      }
    }
    result[dom] = [tests1, tests2];
  }
  return result;
}

export function allTests(dir = '/tmp/symbols') {
  for (let loc of sre.Variables.LOCALES) {
    for (const kind of Object.values(SymbolType)) {
      testOutputFromBoth(loc, kind, dir);
    }
  }
}

export function replaceTests(dir = '/tmp/symbols') {
  let locales = fs.readdirSync(dir);
  for (let loc of locales) {
    let files = fs.readdirSync(`${dir}/${loc}`);
    for (let file of files) {
      console.log(file);
      let oldJson: JsonTest = TestUtil.loadJson(`${TestPath.EXPECTED}/${loc}/symbols/${file}`);
      let newJson: JsonTest = TestUtil.loadJson(`${dir}/${loc}/${file}`);
      oldJson.tests = newJson.tests;
      TestUtil.saveJson(`${TestPath.EXPECTED}/${loc}/symbols/${file}`, oldJson);
    }
  }
}

// Rewrite:
// Constraints by default
// Everything else into extra?
