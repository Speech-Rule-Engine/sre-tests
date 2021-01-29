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
