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
import * as tu from '../base/test_util';

// All files that are generated.
const InputPath = tu.TestPath.INPUT + 'common/';
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
const NemethFire = true;

/**
 * Loads the base file.
 *
 * @param file The base file.
 * @return The symbol keys in the base.
 */
function loadBaseFile(file: string): string[] {
  const json = tu.TestUtil.loadJson(file);
  return Object.keys(json.tests);
}

/**
 * @param dom
 * @param modality
 * @param loc
 * @param style
 * @param char
 */
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

/**
 * @param dom
 * @param modality
 * @param loc
 * @param style
 * @param unit
 */
function getUnitOutput(
  dom: string, modality: string, loc: string, style: string, unit: string) {
  sre.Grammar.getInstance().pushState({annotation: 'unit'});
  let output = getCharOutput(dom, modality, loc, style, unit);
  sre.Grammar.getInstance().popState();
  return output;
}

/**
 * @param dom
 * @param modality
 * @param loc
 * @param style
 * @param char
 * @param unit
 */
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
  it: ['default', 'mathspeak', 'clearspeak'],
  nemeth: ['default']
};

/**
 * Gets all the expected values for a given locale for the tests in the base
 * file.
 *
 * @param locale The locale.
 * @param keys The keys for symbols to test.
 * @param unit Are the symbols units.
 * @return The test json structure.
 */
function testOutput(locale: string, keys: string[], unit = false): tu.JsonFile {
  let constraints = AllConstraints[locale];
  if (!constraints) {
    return {};
  }
  let output: tu.JsonFile = {};
  let modality = locale === 'nemeth' ? 'braille' : 'speech';
  for (let dom of constraints) {
    let json: tu.JsonFile = {
      'name': '',
      'locale': locale,
      'domain': dom,
      'style': 'default'
    };
    let tests: tu.JsonTests = {};
    for (let key of keys) {
      if (key.match(/^_comment/)) {
        continue;
      }
      let result = getOutput(dom, modality, locale, 'default', key, unit);
      tests[key] = {'expected': result};
    }
    json.tests = tests;
    output[dom] = json;
  }
  return output;
}

/**
 * Test if this is a unit file type.
 *
 * @param kind The type.
 */
function isUnitTest(kind: SymbolType) {
  return kind === SymbolType.UNITS || kind === SymbolType.SIUNITS;
}

/**
 * @param locale
 * @param kind
 */
export function testFromBase(locale: string, kind: SymbolType): tu.JsonFile {
  let file = InputPath + FILES.get(kind);
  if (!file) {
    return [];
  }
  let keys = loadBaseFile(file);
  return testOutput(locale, keys, isUnitTest(kind));
}

// Loads the locale symbol file from mathmaps and generates the actual output.
/**
 * @param locale
 * @param kind
 */
export function testFromLocale(locale: string, kind: SymbolType): tu.JsonFile {
  let file = sre.BaseUtil.makePath(sre.SystemExternal.jsonPath) +
      locale + '.js';
  let json = JSON.parse(sre.MathMap.loadFile(file));
  let keys = getNamesFor(json, kind);
  return testOutput(locale, keys, isUnitTest(kind));
}

/**
 * Gets all the expected values for a given locale for the tests in the base
 * file.
 *
 * @param  locale The locale.
 * @param  kind The kind of symbol for which to generate tests.
 * @param  dir Output directory.
 */
export function testOutputFromExtras(
  locale: string, kind: SymbolType, dir = '/tmp') {
  if (kind === SymbolType.SIUNITS || locale === 'nemeth') {
    return;
  }
  let output = testFromExtras(locale, kind);
  if (!Object.keys(output.tests).length) {
    return;
  }
  let tests = output.tests;
  delete output.tests;
  let singular = (kind === SymbolType.CHARACTERS) ?
    'character' : kind.replace(/s$/, '');
  output.name = `Extra${singular.replace(/^\w/, c => c.toUpperCase())}`;
  output.type = singular;
  output.factory = 'symbol';
  output.active = 'ExtraSymbols';
  output.tests = tests;
  writeOutputToFile(dir, output, locale, 'extras', kind);
}

/**
 * @param locale
 * @param kind
 */
export function testFromExtras(locale: string, kind: SymbolType): tu.JsonFile {
  let file = sre.BaseUtil.makePath(sre.SystemExternal.jsonPath) +
      locale + '.js';
  let json = JSON.parse(sre.MathMap.loadFile(file));
  let extras = getExtrasFor(locale, json, kind);
  return testExtras(locale, extras, kind);
}

/**
 * Gets all the expected values for a given locale for the tests in the base
 * file.
 *
 * @param locale The locale.
 * @param extras The keys for symbols to test.
 * @param unit Is the symbol a unit.
 * @param kind
 * @return The test json structure.
 */
function testExtras(
  locale: string, extras: tu.JsonTests, kind: SymbolType): tu.JsonFile {
  let json: tu.JsonFile = {'locale': locale};
  let tests: tu.JsonTests = {};
  for (let [key, constr] of Object.entries(extras)) {
    if (key.match(/^_comment/)) {
      continue;
    }
    for (let [dom, styles] of Object.entries(constr)) {
      for (let style of styles) {
        let char = kind === SymbolType.CHARACTERS ?
          String.fromCodePoint(parseInt(key, 16)) : key;
        let result = getOutput(
          dom, 'speech', locale, style, char, isUnitTest(kind));
        tests[`${key}-${dom}-${style}`] = {
          'key': char,
          'domain': dom,
          'style': style,
          'expected': result
        };
      }
    }
  }
  json.tests = tests;
  return json;
}

/**
 * @param locale
 * @param json
 * @param kind
 */
export function getExtrasFor(
  locale: string, json: tu.JsonTests, kind: SymbolType) {
  let symbols = symbolsfromLocale(json, kind);
  let domains = AllConstraints[locale];
  let extras: tu.JsonTests = {};
  for (let symbol of symbols) {
    if (!symbol.mappings || !symbol.key) {
      continue;
    }
    let mappings = symbol.mappings;
    for (let [domain, styles] of Object.entries(mappings)) {
      if (domains.indexOf(domain) === -1) {
        // extras[symbol.key] = mappings;
        continue;
      }
      let result: tu.JsonTest = {};
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
 *
 * @param  locale The locale.
 * @param  kind The kind of symbol for which to generate tests.
 * @param  dir Output directory.
 */
export function testOutputFromBase(
  locale: string, kind: SymbolType, dir = '/tmp') {
  let output = testFromBase(locale, kind);
  for (let [_dom, json] of Object.entries(output)) {
    writeOutputToFile(dir, json, locale, json.domain, kind);
  }
}

/**
 * @param locale
 * @param kind
 * @param dir
 */
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
 *
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
    if (locale === 'nemeth' && kind === SymbolType.CHARACTERS && NemethFire) {
      splitNemethForFire(dir, json);
    } else {
      writeOutputToFile(dir, json, locale, json.domain, kind);
    }
  }
}

/**
 * @param dir
 * @param json
 */
export function splitNemethForFire(dir: string, json: tu.JsonFile) {
  let tests = json.tests as tu.JsonTests;
  splitNemethByAlphabet(dir, tests);
  let file = sre.BaseUtil.makePath(sre.SystemExternal.jsonPath) +
    'nemeth.js';
  let locale = JSON.parse(sre.MathMap.loadFile(file));
  splitNemethByFile(dir, locale, tests, 'math_symbols');
  splitNemethByFile(dir, locale, tests, 'latin-lower-phonetic');
  splitNemethByFile(dir, locale, tests, 'math_geometry');
  writeNemethSymbolOutput(dir, tests, 'Characters', 'rest');
}

/**
 * @param dir
 * @param locale
 * @param json
 * @param file
 */
function splitNemethByFile(dir: string, locale: tu.JsonTests,
  json: tu.JsonTests, file: string) {
  let keys = [];
  let entries = locale[`nemeth/symbols/${file}.js`] as tu.JsonTest[];
  for (let entry of entries) {
    if (entry.key) {
      keys.push(entry.key);
    }
  }
  writeNemethSymbolOutput(dir, splitOffKeys(json, keys), 'Characters', file);
}

/**
 * @param dir
 * @param json
 */
function splitNemethByAlphabet(dir: string, json: tu.JsonTests) {
  let intervals = sre.AlphabetGenerator.INTERVALS;
  let byFonts: {[name: string]: tu.JsonTests} = {};
  for (let value of Object.values(sre.AlphabetGenerator.Font)) {
    byFonts[value as string] = {};
  }
  for (let value of Object.values(sre.AlphabetGenerator.Embellish)) {
    byFonts[value as string] = {};
  }
  for (let i = 0, int: tu.JsonTest; int = intervals[i]; i++) {
    let keys = sre.AlphabetGenerator.makeInterval(int.interval, int.subst);
    splitOffKeys(json, keys, byFonts[int.font]);
  }
  for (let [key, values] of Object.entries(byFonts)) {
    writeNemethSymbolOutput(dir, values, 'Alphabet', key);
  }
  return byFonts;
}

/**
 * Splits of tests from a Json structure for a given set of keys into the
 * results.
 *
 * @param {JsonTests} json The Json structure.
 * @param {string[]} keys A list of keys.
 * @param {JsonTests} result The result structure.
 */
function splitOffKeys(
  json: tu.JsonTests, keys: string[], result: tu.JsonTests = {}) {
  keys.forEach(function(x: string) {
    let letter = sre.SemanticUtil.numberToUnicode(parseInt(x, 16));
    result[letter] = json[letter];
    delete json[letter];
  });
  console.log(Object.keys(result).length);
  return result;
}

/**
 * @param dir
 * @param json
 * @param base
 * @param key
 */
function writeNemethSymbolOutput(
  dir: string, json: tu.JsonTests, base: string, key: string) {
  let name = key.split(/_|-/g).map(tu.TestUtil.capitalize).join('');
  let file: tu.JsonFile = {
    name: `NemethDefault${base}${name}`,
    locale: 'nemeth',
    domain: 'default',
    modality: 'braille',
    style: 'default',
    compare: true,
    active: 'DefaultSymbolsNemeth',
    type: 'character',
    factory: 'symbol',
    information: `Nemeth Default ${base} ${key} tests.`,
    tests: json
  };
  tu.TestUtil.saveJson(
    `${dir}/nemeth/default_${base.toLowerCase()}_` +
      `${key.replace(/-/g, '_')}.json`, file);
}

/**
 * Writes JSON output to a file.
 *
 * @param {string} dir The target directory.
 * @param {JsonFile} json The JSON structure to output.
 * @param {string} locale The locale.
 * @param {string} dom The domain name for the tests.
 * @param {SymbolType} kind The type of symbols.
 */
function writeOutputToFile(
  dir: string, json: tu.JsonFile, locale: string, dom: string,
  kind: SymbolType) {
  tu.TestUtil.saveJson(`${dir}/${locale}/${dom}_${FILES.get(kind)}`, json);
}

/**
 * @param json
 * @param kind
 */
function symbolsfromLocale(json: tu.JsonTest, kind: SymbolType): tu.JsonTest[] {
  let keys = Object.keys(json);
  let si = kind === SymbolType.SIUNITS;
  let symbols = keys.filter(
    j => j.match(RegExp(`^.+/${si ? 'units' : kind}/.+\.js`)));
  let result: tu.JsonTest[] = [];
  for (let key of symbols) {
    result = result.concat(json[key]);
  }
  return result;
}

/**
 * Computes a list of all names available in the JSON structure for the
 * particular symbol type. Note, that the JSON structure is the locale one,
 * mapping filenames to symbol mappings. This also takes care of SI units.
 *
 * @param {tu.JsonTest} json The locale JSON structure.
 * @param {SymbolType} kind The type of symbol.
 * @return {string[]} The list of names.
 */
function getNamesFor(json: tu.JsonTest, kind: SymbolType): string[] {
  let symbols = symbolsfromLocale(json, kind);
  let si = kind === SymbolType.SIUNITS;
  let prefixes = json[Object.keys(json)
    .find(j => j.match(/^.+\/si\/prefixes\.js/))][0];
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
 *
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
/**
 * @param locale
 * @param kind
 */
export function diffBaseVsLocale(
  locale: string, kind: SymbolType): tu.JsonTest {
  let output1 = testFromBase(locale, kind);
  let output2 = testFromLocale(locale, kind);
  let result: tu.JsonTest = {};
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

/**
 * @param dir
 */
export function allTests(dir = '/tmp/symbols') {
  for (let loc of sre.Variables.LOCALES) {
    for (const kind of Object.values(SymbolType)) {
      testOutputFromBoth(loc, kind, dir);
      testOutputFromExtras(loc, kind, dir);
    }
  }
}

/**
 * @param dir
 */
export function replaceTests(dir = '/tmp/symbols') {
  let locales = fs.readdirSync(dir);
  for (let loc of locales) {
    let files = fs.readdirSync(`${dir}/${loc}`);
    for (let file of files) {
      console.log(file);
      let oldJson: tu.JsonTest =
        tu.TestUtil.loadJson(`${tu.TestPath.EXPECTED}/${loc}/symbols/${file}`);
      let newJson: tu.JsonTest =
        tu.TestUtil.loadJson(`${dir}/${loc}/${file}`);
      oldJson.tests = newJson.tests;
      tu.TestUtil.saveJson(`${tu.TestPath.EXPECTED}/${loc}/symbols/${file}`,
                           oldJson);
    }
  }
}
