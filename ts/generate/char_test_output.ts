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
const CharPath = TestPath.INPUT + 'common/';
const FILES = new Map([
  ['units', CharPath + 'units.json'],
  ['si_units', CharPath + 'si_units.json'],
  ['characters', CharPath + 'characters.json'],
  ['functions', CharPath + 'functions.json']
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

const AllConstraints: {[loc: string]: {[dom: string]: string[]}} = {
    en: {
      default: ['default'],
      mathspeak: ['default', 'brief', 'sbrief'],
      clearspeak: ['default']
    },
    es: {
      default: ['default'],
      mathspeak: ['default', 'brief', 'sbrief']
    },
    fr: {
      default: ['default'],
      mathspeak: ['default', 'brief', 'sbrief'],
      clearspeak: ['default']
    },
    de: {
      default: ['default'],
      mathspeak: ['default', 'brief', 'sbrief'],
      clearspeak: ['default']
    },
    nemeth: {
      default: ['default']
    }
  };

/**
 * Gets all the expected values for a given locale for the tests in the base
 * file.
 * @param locale The locale.
 * @param keys The keys for symbols to test.
 * @param unit Is it his unit tests.
 * @return The test json structure.
 */
function testOutput(locale: string, keys: string[], unit = false): JsonTests {
  let constraints = AllConstraints[locale];
  if (!constraints) {
    return {};
  }
  let output: JsonFile = {};
  let modality = locale === 'nemeth' ? 'braille' : 'speech';
  for (let dom of Object.keys(constraints)) {
    let json: JsonFile = {
      'name': '',
      'locale': locale,
      'domain': dom,
      'styles': constraints[dom]
    };
    let tests: JsonTests = {};
    for (let key of keys) {
      if (key.match(/^_comment/)) {
        continue;
      }
      let expected: string[] = [];
      for (let style of constraints[dom]) {
        let result = getOutput(dom, modality, locale, style, key, unit);
        expected.push(result);
      }
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
function isUnitTest(kind: string) {
  return kind === 'units' || kind === 'si_units';
}

function testFromBase(locale: string, kind: string): JsonFile {
  let file = FILES.get(kind);
  if (!file) {
    return [];
  }
  let keys = loadBaseFile(file);
  return testOutput(locale, keys, isUnitTest(kind));
}

// Loads the locale symbol file from mathmaps.
function testFromLocale(locale: string, kind: string) {
  let file = sre.BaseUtil.makePath(sre.SystemExternal.jsonPath) +
      locale + '.js';
  let json = JSON.parse(sre.MathMap.loadFile(file));
  let keys = getNamesFor(json, kind);
  return testOutput(locale, keys, isUnitTest(kind));

};

// Run with e.g.:
// testOutputFromBase('de', 'units');
/**
 * Gets all the expected values for a given locale for the tests in the base
 * file.
 * @param  locale The locale.
 * @param  kind The kind of symbol for which to generate tests.
 * @param  dir Output directory.
 */
export function testOutputFromBase(locale: string, kind: string, dir = '/tmp') {
  let output = testFromBase(locale, kind);
  for (let [dom, json] of Object.entries(output)) {
    writeOutputToFile(dir, json, locale, dom, kind);
  }
}

export function testOutputFromLocale(
  locale: string, kind: string, dir = '/tmp') {
  let output = testFromLocale(locale, kind);
  for (let [dom, json] of Object.entries(output)) {
    writeOutputToFile(dir, json, locale, dom, kind);
  }
}

export function testOutputFromBoth(locale: string, kind: string, dir = '/tmp') {
  let output = testFromBase(locale, kind);
  let comp = diffBaseVsLocale(locale, kind);
  for (let [dom, json] of Object.entries(output)) {
    let [base, loc] = comp[dom];
    if (Object.keys(base).length && kind !== 'characters') {
      json.exclude = Object.keys(base);
    }
    Object.assign(json.tests, loc);
    writeOutputToFile(dir, json, locale, dom, kind);
  }
}

function writeOutputToFile(
  dir: string, json: JsonFile, locale: string, dom: string, kind: string) {
  TestUtil.saveJson(`${dir}/${locale}/${dom}_${kind}.json`, json);
}


// TODO: the si units!
function getNamesFor(json: JsonTest, kind: string) {
  let keys = Object.keys(json);
  let si = kind === 'si_units';
  let symbols = keys.filter(j => j.match(RegExp(`^.+/${si ? 'units' : kind}/.+\.js`)));
  let prefixes = json[keys.find(j => j.match(/^.+\/si\/prefixes\.js/))][0];
  let result: string[] = [];
  for (let key of symbols) {
    for (let obj of Object.values(json[key]) as JsonTest[]) {
      if (si && obj.names && obj.si) {
        result = result.concat(getSINamesFor(prefixes, obj.names));
        continue;
      }
      if (!si && obj.names && !obj.si) {
        result = result.concat(obj.names);
      }
    }
  }
  return result;
}

// Generates the SI unit names
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
function diffBaseVsLocale(locale: string, kind: string): JsonTest {
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
  let symbols = ['characters', 'functions', 'units', 'si_units'];
  for (let loc of sre.Variables.LOCALES) {
    symbols.forEach(x => testOutputFromBoth(loc, x, dir));
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
