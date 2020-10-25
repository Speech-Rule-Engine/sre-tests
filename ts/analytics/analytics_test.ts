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
 * @fileoverview The module provides some analytics methods for compilation into
 *    the test module.
 *
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import * as fs from 'fs';
import {sre} from '../base/test_external';
import {TestPath, TestUtil} from '../base/test_util';
import * as sret from '../typings/sre';
// import {ExampleFiles} from '../classes/abstract_examples'

// Saves
//  * All applicable rules for a test case
//  * All actually applied rule for a test case
//  * Unique applied rules for each test suite
//  * Comparison with actual rules

/**
 * @override
 */
sre.MathStore.prototype.lookupRule = function(node: any, dynamic: any) {
  let rule = sre.MathStore.base(this, 'lookupRule', node, dynamic);
  if (Analytics.deep && rule) {
    Analytics.addAppliedRule(rule);
  }
  return rule;
};

/**
 * @override
 */
sre.MathStore.prototype.lookupRules = function(node: any, dynamic: any) {
  let rules = sre.MathStore.base(this, 'lookupRules', node, dynamic);
  if (Analytics.deep) {
    Analytics.addApplicableRules(rules);
  }
  return rules;
};

export namespace Analytics {

  export let currentTest = '';
  export let currentTestcase = '';
  export let deep = false;

  let appliedRule: Map<string, sret.SpeechRule[]> = new Map();
  let applicableRules: Map<string, sret.SpeechRule[][]> = new Map();

  export function addAppliedRule(rule: sret.SpeechRule) {
    let cases = appliedRule.get(currentTestcase);
    if (!cases) {
      cases = [];
      appliedRule.set(currentTestcase, cases);
    }
    cases.push(rule);
  }

  export function addApplicableRules(rules: sret.SpeechRule[]) {
    let cases = applicableRules.get(currentTestcase);
    if (!cases) {
      cases = [];
      applicableRules.set(currentTestcase, cases);
    }
    cases.push(rules);
  }

  function fileOutput(
    prefix: string, content: string, name: string = '') {
    let path = TestPath.ANALYSIS + prefix;
    fs.mkdirSync(path, {recursive: true});
    fs.writeFileSync(
      path + '/' + (name || currentTest + '.json'), content);
  }

  export function output() {
    if (!deep) {
      return;
    }
    outputAppliedRules();
    outputApplicableRules();
    outputUniqueAppliedRules();
  }

  // This works now as all rule sets are loaded.
  export function outputAllRules() {
    sre.System.getInstance().setupEngine({});
    loadAllAppliedRules();
    for (let [name, obj] of
         Object.entries(sre.SpeechRuleEngine.getInstance().ruleSets_)) {
      let rules = (obj as sret.SpeechRuleStore).speechRules_
        .map(x => x.toString());
      fileOutput('allRules',
                 JSON.stringify(rules.sort(), null, 2), name + '.json');
      allRulesDifference(rules, name);
    }
  }

  let allAppliedRules: string[] = [];
  let uniqueAppliedRules: Map<string, boolean> = new Map();

  function loadAllAppliedRules() {
    let path = TestPath.ANALYSIS + '/uniqueAppliedRules/';
    let files = fs.readdirSync(path);
    files.forEach(file => {
      allAppliedRules = allAppliedRules.concat(
        TestUtil.loadJson(path + file) as string[]);
    });
    allAppliedRules = removeDuplicates(allAppliedRules);
    allAppliedRules.forEach(x => uniqueAppliedRules.set(x, true));
  }

  function allRulesDifference(rules: string[], name: string) {
    let diff = [];
    for (let rule of rules) {
      if (!uniqueAppliedRules.get(rule)) {
        diff.push(rule);
      }
    }
    fileOutput('diffAppliedRules', JSON.stringify(diff, null, 2),
               name + '.json');
  }

  export let outputAppliedRules = function() {
    let jsonObj: {[name: string]: string[]} = {};
    for (let [key, value] of appliedRule.entries()) {
      jsonObj[key] = value.map(x => x.toString());
      fileOutput('appliedRules', JSON.stringify(jsonObj, null, 2));
    }
  };

  export let outputApplicableRules = function() {
    let jsonObj: {[name: string]: string[][]} = {};
    for (let [key, value] of applicableRules.entries()) {
      jsonObj[key] = value
        .filter(x => x.length)
        .map(x => x.map(y => y.toString()));
    }
    fileOutput('applicableRules', JSON.stringify(jsonObj, null, 2));
  };

  // Removes duplicates from a list in O(n).
  function removeDuplicates<T>(list: T[]): T[] {
    let entries: Map<T, boolean> = new Map();
    for (let entry of list) {
      entries.set(entry, true);

    }
    return Array.from(entries.keys());
  }

  export function outputUniqueAppliedRules() {
    let rules: sret.SpeechRule[] = [];
    for (let value of appliedRule.values()) {
      rules = rules.concat(value);
    }
    rules = removeDuplicates(rules);
    fileOutput('uniqueAppliedRules',
               JSON.stringify(rules.map(x => x.toString()).sort(), null, 2));
  }

  function restTrie() {
    let usedTrie = sre.AnalyticsBasic.tempTrie(appliedRule.values());
    let allRules = sre.SpeechRuleEngine.getInstance()['activeStore_']
      .trie.collectRules();
    let outTrie = sre.AnalyticsBasic.tempTrie([]);
    for (let rule of allRules) {
      let prec = rule.precondition;
      let cstr = rule.dynamicCstr.getValues();
      let node = usedTrie.byConstraint(
        cstr.concat([prec.query], prec.constraints));
      if (!node || !node.getRule || !node.getRule() ||
        node.getRule() !== rule) {
        outTrie.addRule(rule);
      }
    }
    return outTrie;
  }

  export function outputTrie() {
    let trie =  restTrie();
    let json = trie.json();
    let rules = trie.collectRules();
    fs.writeFileSync('trie', JSON.stringify(json, null, 2));
    fs.writeFileSync('trie',
                     rules.map((x: sret.SpeechRule) => x.toString()).join('\n'),
                     currentTest + '.txt');
  }

}
