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

import {sre} from '../base/test_external';
import {TestUtil} from '../base/test_util';
import {JsonTest} from '../classes/abstract_test';
import {get as factoryget} from '../classes/test_factory';

function loadFiles(expected: string, base: string): [JsonTest, JsonTest] {
  expected = TestUtil.fileExists(expected);
  base = TestUtil.fileExists(base);
  return [TestUtil.loadJson(expected), TestUtil.loadJson(base)];
}

function findMissing(expected: string, base: string) {
  let [output, input] = loadFiles(expected, base);
  // @ts-ignore
  let [_tests, warn] = sre.TestUtil.combineTests(
      input.tests, output.tests, output.exclude || []);
  return [warn, input.tests, output.factory];
}

function runMissing(missing: string[], base: JsonTest, constr: string) {
  let obj = factoryget(constr);
  let result: JsonTest = {};
  try {
    obj.setUpTest();
  } catch (e) {}
  for (let miss of missing) {
    console.log(miss);
    let test = base[miss];
    test.expected = '';
    try {
      obj.method.apply(obj, obj.pick(test));
    } catch (e) {
      result[miss] = {'expected': e.actual};
    }
  }
  try {
    obj.tearDownTest();
  } catch (e) {}
  return JSON.stringify(result, null, 2);
}

export function missingTests(expected: string, base: string) {
  let [missing, tests, constr] = findMissing(expected, base);
  console.log(runMissing(missing, tests, constr));
}

export function runTest(expected: string, constr: string): string {
  let obj = factoryget(constr);
  obj['jsonFile'] = expected;
  let missing = [];
  try {
    obj.prepare();
  } catch (e) {
    missing = e.value;
  }
  // let [missing, tests] = findMissing(expected, obj.baseFile);
  let result: JsonTest = {};
  try {
    obj.setUpTest();
  } catch (e) {}
  let tests = obj.baseTests.tests;
  for (let miss of missing) {
    let test = tests[miss];
    test.expected = '';
    try {
      obj.method.apply(obj, obj.pick(test));
    } catch (e) {
      result[miss] = {'expected': e.actual};
    }
  }
  try {
    obj.tearDownTest();
  } catch (e) {}
  return JSON.stringify(result, null, 2);
}
