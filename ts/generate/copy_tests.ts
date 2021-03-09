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
 * @fileoverview Methods for copying and transforming test files.
 *
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import * as path from 'path';
import {JsonFile, JsonTest, JsonTests, TestPath, TestUtil} from '../base/test_util';
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

//
// Some filter and inspection tooling
//

/**
 * Shows the difference in test files between two locales.
 *
 * @param {string} loc1 First locale.
 * @param {string} loc2 Second locale.
 */
export function localeDifference(loc1: string, loc2: string) {
  let tests1 = localeToBlocks(
    TestUtil.cleanFiles(TestUtil.readDir(loc1), loc1));
  let tests2 = localeToBlocks(
    TestUtil.cleanFiles(TestUtil.readDir(loc2), loc2));
  console.info(`Missing ${loc1}:`);
  outputDifference(tests2, tests1);
  console.info(`Missing ${loc2}:`);
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
    console.info(`Block ${block}:`);
    if (!block2) {
      console.info(tests1[block]);
      continue;
    }
    console.info(tests1[block].filter(x => !block2.includes(x)));
  }
}

/**
 * Collates the files of a locale into blocks corresponding to their
 * sub-directories.
 *
 * @param {string[]} files The list of all files.
 */
function localeToBlocks(files: string[]) {
  let result: {[name: string]: string[]} = {};
  for (let path of files) {
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

/* ********************************************************* */
/*
 * Get information on locale specific tests.
 */
/* ********************************************************* */

export function showNonExpected(loc: string, exclude: string[] = []) {
  let nonExpected = getNonExpected(loc, exclude);
  let [missing, same, different] = siftNonExpected(nonExpected);
  console.info('Missing');
  for (let [file, key, value] of missing) {
    console.info(`${file} ${key}:`);
    console.info(value);
  }
  console.log('Same');
  for (let [file, key, value, base] of same) {
    console.info(`${file} ${key}:`);
    console.info(value);
    console.info(base);
  }
  console.log('Different');
  for (let [file, key, value, base] of different) {
    console.info(`${file} ${key}:`);
    console.info(value);
    console.info(base);
  }
}

function siftNonExpected(nonExpected: [string, string, JsonTest][]) {
  let missing: [string, string, JsonTest][] = [];
  let same: [string, string, JsonTest, JsonTest][] = [];
  let different: [string, string, JsonTest, JsonTest][] = [];
  for (let [file, key, value] of nonExpected) {
    let json = factoryget(file);
    json.loadBase();
    let base = json.baseTests.tests as JsonTests;
    let baseTest = base[key];
    if (typeof baseTest === 'undefined') {
      missing.push([file, key, value]);
      continue;
    }
    if (baseTest.input && value.input && baseTest.input === value.input) {
      same.push([file, key, value, baseTest]);
      continue;
    }
    different.push([file, key, value, baseTest]);
  }
  return [missing, same, different];
}

function getNonExpected(
  loc: string, exclude: string[] = []): [string, string, JsonTest][] {
  let result: [string, string, JsonTest][] = [];
  let tests = TestUtil.cleanFiles(TestUtil.readDir(loc));
  for (let test of tests) {
    let json = factoryget(test);
    if (exclude.indexOf(json.jsonTests.factory) !== -1) {
      continue;
    }
    for (let [key, entry] of Object.entries(json.jsonTests.tests)) {
      if (key.match(/_comment/)) {
        continue;
      }
      cleanEntry(entry);
      if (Object.keys(entry).length) {
        result.push([test, key, entry]);
      }
    }
  }
  return result;
}

function cleanEntry(entry: JsonTest) {
  delete entry.expected;
  delete entry.test;
  Object.keys(entry).
    filter(key => key.match(/_comment/)).
    forEach(x => delete entry[x]);
}

/* ********************************************************* */
/*
 * Copy semantic tests to generate the four basic test classes.
 *
 * We expect the following naming convention:
 * Input file:
 * - semantic_NAME.json, where NAME corresponds to the particular type of
 *   elements the test is for (can be empty).
 *
 * Output files:
 * - semantic_tree_NAME.json, factory: stree
 * - enrich_mathml_NAME.json, factory: enrichMathml, active: EnrichExamples
 * - enrich_speech_NAME.json, factory: enrichSpeech, tests: ALL
 * - rebuild_stree_NAME.json, factory: rebuild, tests: ALL
 */
/* ********************************************************* */

export function copySemanticTest(base: string) {
  let filename = TestUtil.fileExists(base, TestPath.INPUT);
  if (!filename) {
    return;
  }
  let basename = path.basename(base, '.json');
  let dirname = path.dirname(base);
  let postfix = basename.replace(/^semantic/, '');
  createSemanticTestFile(dirname, postfix, 'semantic_tree', base,
                         {factory: 'stree'});
  createSemanticTestFile(dirname, postfix, 'enrich_mathml', base,
                         {factory: 'enrichMathml', active: 'EnrichExamples'});
  createSemanticTestFile(dirname, postfix, 'enrich_speech', base,
                         {factory: 'enrichSpeech', tests: 'ALL'});
  createSemanticTestFile(dirname, postfix, 'rebuild_stree', base,
                         {factory: 'rebuild', tests: 'ALL'});
}

function createSemanticTestFile(dir: string, post: string, pre: string,
                                base: string, init: JsonFile) {
  let filename = path.join(dir, `${pre}${post}.json`);
  let file = TestUtil.fileExists(filename, TestPath.EXPECTED);
  if (file) {
    console.error(`File ${file} already exists.`);
    return;
  }
  let basename = path.join('input', base);
  init.base = basename;
  if (!init.tests) {
    init.tests = {};
  }
  TestUtil.saveJson(path.join(TestPath.EXPECTED, filename), init);
}
