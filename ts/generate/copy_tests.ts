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
 * @fileoverview Methods for copying and transformng test files.
 *
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import {Tests} from '../base/tests';
import {JsonFile, TestPath, TestUtil} from '../base/test_util';
import {get as factoryget} from '../classes/test_factory';
import {addMissing} from './fill_tests';

/**
 * Copies and adapts a single test file from one locale to another.
 *
 * @param source The expected source file.
 * @param locale Destination locale (e.g., 'it').
 * @param loc1 Source locale string (e.g., "English").
 * @param loc2 Destination locale string (e.g., "Italian").
 */
export function copyTestLocale(source: string, locale: string,
  loc1: string, loc2: string) {
  let tests = factoryget(source);
  let dst = [TestPath.EXPECTED, locale].concat(
    source.split('/').slice(1)).join('/');
  tests.jsonTests.tests = {};
  tests.jsonTests.locale = locale;
  replaceInTests(tests.jsonTests, 'name', loc1, loc2);
  replaceInTests(tests.jsonTests, 'active', loc1, loc2);
  replaceInTests(tests.jsonTests, 'information', loc1, loc2);
  TestUtil.saveJson(dst, tests.jsonTests);
  addMissing(dst);
}

/**
 * Copies and adapts all test file from one locale directory to another.
 *
 * @param source The expected source directory.
 * @param locale Destination locale (e.g., 'it').
 * @param loc1 Source locale string (e.g., "English").
 * @param loc2 Destination locale string (e.g., "Italian").
 */
export function copyTestLocaleDir(source: string, locale: string,
  loc1: string, loc2: string) {
  let files = TestUtil.readDir(source);
  for (let file of files) {
    copyTestLocale(file, locale, loc1, loc2);
  }
}

/**
 * Replaces content in string field if an entry for a given key exists.
 *
 * @param {JsonFile} tests The test file structure.
 * @param {string} key The key of the field.
 * @param {string} what What should be replaced.
 * @param {string} by By what it should be replaced.
 */
function replaceInTests(
  tests: JsonFile, key: string, what: string, by: string) {
  if (tests[key]) {
    tests[key] = tests[key].replace(what, by);
  }
}

/**
 * Shows the difference in test files between two locales.
 *
 * @param {string} loc1 First locale.
 * @param {string} loc2 Second locale.
 */
export function showDifference(loc1: string, loc2: string) {
  let tests = Tests.allJson();
  let tests1 = cleanLocaleDiffs(tests, loc1);
  let tests2 = cleanLocaleDiffs(tests, loc2);
  console.log(`Missing ${loc1}:`);
  outputDifference(tests2, tests1);
  console.log(`Missing ${loc2}:`);
  outputDifference(tests1, tests2);
}


/**
 * Computes and outputs the difference between two locale test directories.
 *
 * @param {{[name: string]: string[]}} tests1 Test files for locale 1.
 * @param {{[name: string]: string[]}} tests2 Test files for locale 2.
 */
function outputDifference(tests1: {[name: string]: string[]},
                          tests2: {[name: string]: string[]}) {
  for (let block of Object.keys(tests1)) {
    let block2 = tests2[block];
    console.log(`Block ${block}:`);
    if (!block2) {
      console.log(tests1[block]);
      continue;
    }
    console.log(tests1[block].filter(x => !block2.includes(x)));
  }
}

/**
 * Retrieves the files for a particular locale in the set of all test files and
 * collates them by blocks corresponding to their sub-directories.
 *
 * @param {string[]} files The list of all files.
 * @param {string} loc The locale.
 */
function cleanLocaleDiffs(files: string[], loc: string) {
  let regexp = new RegExp(`^${loc}/`);
  let tests = files.filter(x => x.match(regexp))
    .map(x => x.replace(regexp, ''));
  let result: {[name: string]: string[]} = {};
  for (let path of tests) {
    let match = path.match(/^(\w*)\/(.*)/);
    let block = match[1];
    let file = match[2];
    if (result[block]) {
      result[block].push(file);
    } else {
      result[block] = [file];
    }
  }
  return result;
}
