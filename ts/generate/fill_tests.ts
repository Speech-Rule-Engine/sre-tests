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

import {Tests} from '../base/tests';
import {JsonFile, JsonTests, TestPath, TestUtil} from '../base/test_util';
import {AbstractJsonTest} from '../classes/abstract_test';
import {get as factoryget} from '../classes/test_factory';

const enum TestFlag {ALL, FAILED, MISSING}

/**
 * Runs all tests for the given expected file and collates the failing ones.
 *
 * @param expected Relative file name of the expected file.
 * @param flag Flag which tests to run. Values: all, failed, missing.
 * @return Pair of JSON structure with expected output and the test object.
 */
function runTests(
  expected: string, flag: TestFlag): [JsonTests, AbstractJsonTest] {
  let tests = factoryget(expected);
  tests.prepare();
  let result: JsonTests = {};
  try {
    tests.setUpTest();
  } catch (e) {}
  let base = (tests.baseTests.tests ?
    tests.baseTests.tests : tests.jsonTests.tests) as JsonTests;
  let keys = flag === TestFlag.MISSING ? tests.warn : Object.keys(base);
  for (let key of keys) {
    if (key.match(/_comment/)) {
      continue;
    }
    let test = base[key];
    if (flag !== TestFlag.FAILED) {
      test.expected = null;
    }
    try {
      tests.method.apply(tests, tests.pick(test));
    } catch (e) {
      result[key] = {'expected': e.actual};
    }
  }
  try {
    tests.tearDownTest();
  } catch (e) {}
  return [result, tests];
}

/**
 * Generates expected values for the flagged tests and writes them to the given
 * expected file.
 *
 * @param expected Relative file name of the expected file.
 * @param flag Flag which tests to run. Values: all, failed, missing.
 * @param dryrun Print to console instead to file.
 */
function add(expected: string, flag: TestFlag, dryrun: boolean) {
  let [result, tests] = runTests(expected, flag);
  if (dryrun) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  let file = tests['jsonFile'];
  let filename = TestUtil.fileExists(file, TestPath.EXPECTED);
  let oldJson: JsonFile = TestUtil.loadJson(filename);
  let base = oldJson['base'];
  if (base) {
    Object.assign(oldJson.tests, result);
  } else {
    let oldTests = oldJson.tests as JsonTests;
    for (let key of Object.keys(result)) {
      Object.assign(oldTests[key], result[key]);
    }
  }
  TestUtil.saveJson(filename, oldJson);
}

/**
 * Generates expected values for all missing tests and writes them to the given
 * expected file.
 *
 * @param expected Relative file name of the expected file.
 * @param dryrun Print to console instead to file.
 */
export function addMissing(expected: string, dryrun: boolean = false) {
  add(expected, TestFlag.MISSING, dryrun);
}

/**
 * Generates actual expected values for all tests and writes them to the given
 * expected file.
 *
 * @param expected Relative file name of the expected file.
 * @param dryrun Print to console instead to file.
 */
export function addActual(expected: string, dryrun: boolean = false) {
  add(expected, TestFlag.ALL, dryrun);
}

/**
 * Generates actual expected values for failed tests and writes them to the
 * given expected file.
 *
 * @param expected Relative file name of the expected file.
 * @param dryrun Print to console instead to file.
 */
export function addFailed(expected: string, dryrun: boolean = false) {
  add(expected, TestFlag.FAILED, dryrun);
}

/**
 * Shows the result for all missing tests. This is to inspect before adding them
 * automatically using, for example, `addMissing`.
 * @param regexp A regular expression to filter output.
 */
export function showMissing(regexp: RegExp = /./) {
  let tests = new Tests();
  tests.runner
    .queryJsonTests(x => [x, x.warn])
    .filter(([x, y]) => (y.length && x.jsonFile.match(regexp)))
    .map(([x]) => {
      console.log(x.jsonFile);
      addMissing(x.jsonFile, true);
    });
}
