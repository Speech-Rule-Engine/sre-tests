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
 * @fileoverview Methods for generating missing expected values.
 *
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import {AbstractJsonTest, JsonTest} from '../classes/abstract_test';
import {get as factoryget} from '../classes/test_factory';
import {TestUtil} from '../base/test_util';
import * as fs from 'fs';


/**
 * Runs all missing tests for the given expected file and records their actual
 * output.
 * @param expected Relative file name of the expected file.
 * @return Pair of JSON structure with expected output and the test object.
 */
function runMissing(expected: string): [JsonTest, AbstractJsonTest] {
  let tests = factoryget(expected);
  tests.prepare();
  let result: JsonTest = {};
  let base = tests.baseTests.tests;
  try {
    tests.setUpTest();
  } catch (e) {}
  for (let miss of tests.warn) {
    let test = base[miss];
    test.expected = '';
    try {
      tests.method.apply(tests, tests.pick(test));
    } catch (e) {
      result[miss] = {'expected': e.actual};
    }
  }
  try {
    tests.tearDownTest();
  } catch (e) {}
  return [result, tests]; // Return tests for post-processing.
}

/**
 * Prints all output for missing tests to console.
 * @param expected Relative file name of the expected file.
 */
export function printMissing(expected: string) {
  let [result] = runMissing(expected);
  console.log(JSON.stringify(result, null, 2));
}

/**
 * Generates expected values for all missing tests and writes them to the given
 * expected file.
 * @param expected Relative file name of the expected file.
 */
export function addMissing(expected: string) {
  let [result, tests] = runMissing(expected);
  let file = tests['jsonFile'];
  let oldJson: JsonTest = TestUtil.loadJson(file);
  Object.assign(oldJson.tests, result);
  fs.writeFileSync(file,
                   JSON.stringify(oldJson, null, 2) + '\n');
}

/**
 * Runs all tests for the given expected file and collates the failing ones.
 * @param expected Relative file name of the expected file.
 * @return The JSON structure with all expected values for failed tests.
 */
export function runTests(expected: string): JsonTest {
  let obj = factoryget(expected);
  obj.prepare();
  let result: JsonTest = {};
  try {
    obj.setUpTest();
  } catch (e) {}
  let tests = obj.baseTests.tests;
  for (let [key, test] of Object.entries(tests)) {
    if (key.match(/_comment/)) {
      continue;
    }
    test.expected = '';
    try {
      obj.method.apply(obj, obj.pick(test));
    } catch (e) {
      console.log(e.actual);
      result[key] = {'expected': e.actual};
    }
  }
  try {
    obj.tearDownTest();
  } catch (e) {}
  return result;
}
