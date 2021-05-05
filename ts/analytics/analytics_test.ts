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
 * @fileoverview Analytics methods for determining speech rule coverage of
 * tests.
 *
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import {MathStore} from '../../../speech-rule-engine-tots/js/rule_engine/math_store';
import {SpeechRule} from '../../../speech-rule-engine-tots/js/rule_engine/speech_rule';
import {Trie} from '../../../speech-rule-engine-tots/js/indexing/trie';
import System from '../../../speech-rule-engine-tots/js/common/system';
import {Variables} from '../../../speech-rule-engine-tots/js/common/variables';
import {SpeechRuleEngine} from '../../../speech-rule-engine-tots/js/rule_engine/speech_rule_engine';

import * as fs from 'fs';
import {TestPath, TestUtil} from '../base/test_util';
// import AnalyticsTrie from './analytics_trie';
import AnalyticsUtil from './analytics_util';

// Saves
//  * All applicable rules for a test case
//  * All actually applied rule for a test case
//  * Unique applied rules for each test suite
//  * Comparison with actual rules

let oldLookupRule = MathStore.prototype.lookupRule;

/**
 * @override
 */
MathStore.prototype.lookupRule = function(node: any, dynamic: any) {
  let rule = oldLookupRule.bind(this)(node, dynamic);
  if (AnalyticsTest.deep && rule) {
    AnalyticsTest.addAppliedRule(rule);
  }
  return rule;
};

let oldLookupRules = MathStore.prototype.lookupRules;
/**
 * @override
 */
MathStore.prototype.lookupRules = function(node: any, dynamic: any) {
  let rules = oldLookupRules.bind(this)(node, dynamic);
  if (AnalyticsTest.deep) {
    AnalyticsTest.addApplicableRules(rules);
  }
  return rules;
};

namespace AnalyticsTest {

  export let currentTest = '';
  export let currentTestcase = '';
  export let deep = false;

  export let appliedRule: Map<string, SpeechRule[]> = new Map();
  export let applicableRules: Map<string, SpeechRule[][]> = new Map();

  /**
   * Records a rule applied while a running a test case.
   *
   * @param rule The applied rule.
   */
  export function addAppliedRule(rule: SpeechRule) {
    let cases = appliedRule.get(currentTestcase);
    if (!cases) {
      cases = [];
      appliedRule.set(currentTestcase, cases);
    }
    cases.push(rule);
  }

  /**
   * Records all rules applicable while running a test case.
   *
   * @param rules The list of applicable rules.
   */
  export function addApplicableRules(rules: SpeechRule[]) {
    let cases = applicableRules.get(currentTestcase);
    if (!cases) {
      cases = [];
      applicableRules.set(currentTestcase, cases);
    }
    cases.push(rules);
  }

  /**
   * Generate all output files.
   */
  export function output() {
    if (!deep) {
      return;
    }
    outputAppliedRules();
    outputApplicableRules();
    outputUniqueAppliedRules();
  }

  // This works now as all rule sets are loaded.
  /**
   * Outputs a json file enumerating all rules for every rule set as well as the
   * difference between those and the list of unique rules actually applied
   * during tests.
   */
  export function outputAllRules() {
    loadAllAppliedRules();
    let ruleSets = getAllSets();
    for (let [name, obj] of Object.entries(ruleSets)) {
      let rules = obj.map((x: SpeechRule) => x.toString());
      AnalyticsUtil.fileJson('allRules', rules.sort(), name);
      allRulesDifference(rules, name);
    }
  }

  let allAppliedRules: string[] = [];
  let uniqueAppliedRules: Map<string, boolean> = new Map();

  /**
   * Loads the list of all uniquely applied rules.
   */
  function loadAllAppliedRules() {
    let path = TestPath.ANALYSIS + '/uniqueAppliedRules/';
    let files = fs.readdirSync(path);
    files.forEach(file => {
      allAppliedRules = allAppliedRules.concat(
        TestUtil.loadJson(path + file) as string[]);
    });
    allAppliedRules = AnalyticsUtil.removeDuplicates(allAppliedRules);
    allAppliedRules.forEach(x => uniqueAppliedRules.set(x, true));
  }

  /**
   * Generates json files for difference of all rules in a set and those
   * actually applied during the tests.
   *
   * @param rules The list of rules in the set.
   * @param name The name of the rule set.
   */
  function allRulesDifference(rules: string[], name: string) {
    let diff = [];
    for (let rule of rules) {
      if (!uniqueAppliedRules.get(rule)) {
        diff.push(rule);
      }
    }
    AnalyticsUtil.fileJson('diffAppliedRules', diff, name);
  }

  /**
   * Outputs a list of all applied rules for each test of the current test
   * suite.
   */
  export function outputAppliedRules() {
    let jsonObj: {[name: string]: string[]} = {};
    for (let [key, value] of appliedRule.entries()) {
      jsonObj[key] = value.map(x => x.toString());
      AnalyticsUtil.fileJson('appliedRules', jsonObj, currentTest);
    }
  }

  /**
   * Outputs lists of lists of all applicable rules for each test of the current
   * test suite.
   */
  export function outputApplicableRules() {
    let jsonObj: {[name: string]: string[][]} = {};
    for (let [key, value] of applicableRules.entries()) {
      jsonObj[key] = value
        .filter(x => x.length)
        .map(x => x.map(y => y.toString()));
    }
    AnalyticsUtil.fileJson('applicableRules', jsonObj, currentTest);
  }

  /**
   * Outputs the unique applied rules for each test suite.
   */
  export function outputUniqueAppliedRules() {
    let rules: SpeechRule[] = [];
    for (let value of appliedRule.values()) {
      rules = rules.concat(value);
    }
    rules = AnalyticsUtil.removeDuplicates(rules);
    AnalyticsUtil.fileJson('uniqueAppliedRules',
                           rules.map(x => x.toString()), currentTest);
  }

  export function getAllSets(): {[name: string]: SpeechRule[]} {
    for (let locale of Variables.LOCALES) {
      System.setupEngine({locale: locale});
    }
    let trie = SpeechRuleEngine.getInstance().getStore().trie;
    let result: {[name: string]: SpeechRule[]} = {};
    for (let [loc, rest] of Object.entries(SpeechRuleEngine.getInstance().enumerate())) {
      for (let [mod, rules] of Object.entries(rest)) {
        if (mod === 'speech') {
          for (let rule of Object.keys(rules)) {
            result[TestUtil.capitalize(rule) + TestUtil.capitalize(loc)] =
              Trie.collectRules_(trie.byConstraint([loc, mod, rule]));
          }
        } else {
          result[TestUtil.capitalize(mod) + TestUtil.capitalize(loc)] =
            Trie.collectRules_(trie.byConstraint([loc, mod]));
        }
      }
    }
    return result;
  }

}

export default AnalyticsTest;
