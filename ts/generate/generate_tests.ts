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


import {JsonTest, TestUtil} from '../base/test_util';
import {Transformer} from './transformers';


/**
 * Generates JSON test entries from lists of data elements. The input JSON is of
 * the form
 *
 * {
 *   "foo": [d0, d1, d2, ....],
 *   "bar": [e0, e1, e2, ....],
 *   ...
 * }
 *
 * Output will be for the form 
 * 
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
 * 
 * @param json The initial JSON input.
 * @param field The optional field name, defaults to input.
 * @return The newly transformed JSON.
 */
export function transformInput(json: JsonTest, field: string = 'input') {
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
 * @param input Input filename.
 * @param output Output filename.
 * @param field The optional field name, defaults to input.
 */
export function generateTestRequire(input: string, output: string,
                                    field: string = 'input') {
  let file = require(input);
  let oldJson = file[Object.keys(file)[0]];
  let newJson = transformInput(oldJson, field);
  TestUtil.saveJson(output, newJson);
}

/**
 * Generates test from a json file.
 * @param input Input filename.
 * @param output Output filename.
 * @param field The optional field name, defaults to input.
 */
export function generateTestJson(input: string, output: string,
                                 field: string = 'input') {
  let oldJson = TestUtil.loadJson(input);
  let newJson = transformInput(oldJson, field);
  TestUtil.saveJson(output, newJson);
}

/**
 * Runs a series of transformers on the given tests.
 * @param json The JSON tests.
 * @param transformers List of transformers.
 */
export function transformTests(json: JsonTest,
                               transformers: Transformer[]) {
  for (let value of Object.values(json)) {
    for (let transformer of transformers) {
      value[transformer.dst] = transformer.via(value[transformer.src]);
    }
  }
  return json;
}

/**
 * Transforms test file in place.
 * @param file File name.
 * @param transformers Transformer list.
 */
export function transformTestsSource(file: string,
                                     transformers: Transformer[]) {
  let json = TestUtil.loadJson(file);
  TestUtil.saveJson(file, transformTests(json, transformers));
}
