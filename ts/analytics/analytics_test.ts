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
import {TestPath} from '../base/test_util';
import * as sret from '../typings/sre';
// import {ExampleFiles} from '../classes/abstract_examples'


sre.MathStore.prototype.lookupRule = function(node: any, dynamic: any) {
  let rule = sre.MathStore.base(this, 'lookupRule', node, dynamic);
  if (Analytics.deep && rule) {
    Analytics.usedRules.set(rule, true);
  }
  return rule;
};


sre.MathStore.prototype.lookupRules = function(node: any, dynamic: any) {
  let rules = sre.MathStore.base(this, 'lookupRules', node, dynamic);
  if (Analytics.deep) {
    Analytics.addAppliedRules(rules);
  }
  return rules;
};

// let oldMethod = sre.MathSimpleStore.prototype.lookupRule;
// sre.MathSimpleStore.prototype.lookupRule = function(node: any, dynamic: any) {
//   let rule = oldMethod(node, dynamic).bind(this);
//   if (Analytics.deep && rule) {
//     Analytics.addAppliedRules([rule]);
//     // Analytics.usedRules.set(rule, true);
//   }
//   return rule;
// };


export namespace Analytics {

  export let currentTest = '';
  export let currentTestcase = '';
  export let deep = false;
  export let usedRules: Map<string, boolean> = new Map();
  let appliedRules: Map<string, sret.SpeechRule[][]> = new Map();
  // let registeredTests = new Map();


  let restTrie = function() {
    let usedTrie = sre.AnalyticsBasic.tempTrie(usedRules.keys());
    let allRules = sre.SpeechRuleEngine.getInstance()['activeStore_'].trie.collectRules();
    let outTrie = sre.AnalyticsBasic.tempTrie([]);
    for (let rule of allRules) {
      let prec = rule.precondition;
      let cstr = rule.dynamicCstr.getValues();
      let node = usedTrie.byConstraint(cstr.concat([prec.query], prec.constraints));
      if (!node || !node.getRule || !node.getRule() ||
        node.getRule() !== rule) {
        outTrie.addRule(rule);
      }
    }
    return outTrie;
  };


  export let output = function() {
    if (!deep) return;
    let trie =  restTrie();
    let json = trie.json();
    let rules = trie.collectRules();
    fs.writeFileSync(currentTest + '.json', JSON.stringify(json, null, 2));
    fs.writeFileSync(currentTest + '.txt', rules.map((x: sret.SpeechRule) => x.toString()).join('\n'));
    // outputAllRules(file);
    // outputAppliedRules(file);
    // outputApplicableRules(file);
  };

  // export let registerTest = function(name: string, info: string) {
  //   if (!deep) return;
  //   console.log(info);
  //   console.log(name);
  //   registeredTests.set(info, name);
  //   appliedRules.set(info, new Map());
  // };

  export let addAppliedRules = function(rules: sret.SpeechRule[]) {
    let cases = appliedRules.get(currentTestcase);
    if (!cases) {
      cases = [];
      appliedRules.set(currentTestcase, cases);
    }
    cases.push(rules);
  };


  // export let outputAllRules = function(file: string) {
  //   let jsonObj: {[name: string]: {[key: string]: sret.SpeechRule[]}} = {};
  //   for (let [key, value] of appliedRules.entries()) {
  //     let fileObj: {[key: string]: sret.SpeechRule[]} = {};
  //     jsonObj[key] = fileObj;
  //     for (let [test, rules] of value) {
  //       fileObj[test] = rules.map((x: any) => {return x.map((y: any) => y.toString());});
  //     }
  //   }
  //   sre.SystemExternal.fs.writeFileSync(file + '-allRules.txt', JSON.stringify(jsonObj, null, 2));
  // };

  export let outputAppliedRules = function(file: string) {
    let jsonObj: {[name: string]: string[]} = {};
    for (let [key, value] of appliedRules.entries()) {
      jsonObj[key] = value.filter(x => x.length).map(x => x[0].toString());
    }
    fs.writeFileSync(file + '/' + currentTest + '-appliedRules.txt',
                                        JSON.stringify(jsonObj, null, 2));
  };


  export let outputUniqueAppliedRules = function() {
    let rules: {[name: string]: boolean} = {};
    for (let value of appliedRules.values()) {
      for (let rule of value) {
        if (rule.length) {
          rules[rule[0].toString()] = true;
        }
      }
    }
    fs.mkdirSync(TestPath.ANALYSIS, {recursive: true});
    fs.writeFileSync(
      TestPath.ANALYSIS + currentTest + '-uniqueAppliedRules.txt',
      Object.keys(rules).join('\n') + '\n');
  };


  // let outputApplicableRules = function(file: string) {
  //   let fd = fs.openSync(file + '-applicableRules.txt', 'w');
  //   for (let value of appliedRules.values()) {
  //     for (let rules of value.values()) {
  //       rules.forEach((x: any) => x.forEach(
  //         (y: any) => fs.writeSync(fd, y.toString() + '\n')));
  //     }
  //   }
  //   fs.closeSync(fd);
  // };

  
}
