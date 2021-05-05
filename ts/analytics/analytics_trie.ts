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
 * @fileoverview Analytics of speech rules sets.
 *
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import {TrieNode} from '../../../speech-rule-engine-tots/js/indexing/trie_node';
import {Trie} from '../../../speech-rule-engine-tots/js/indexing/trie';
import System from '../../../speech-rule-engine-tots/js/common/system';
import {Variables} from '../../../speech-rule-engine-tots/js/common/variables';
import {SpeechRuleEngine} from '../../../speech-rule-engine-tots/js/rule_engine/speech_rule_engine';
import {BaseRuleStore} from '../../../speech-rule-engine-tots/js/rule_engine/base_rule_store';
import {MathStore} from '../../../speech-rule-engine-tots/js/rule_engine/math_store';
import {SpeechRule} from '../../../speech-rule-engine-tots/js/rule_engine/speech_rule';

import AnalyticsUtil from './analytics_util';
import AnalyticsTest from './analytics_test';
import {TestUtil} from '../base/test_util';

declare module '../../../speech-rule-engine-tots/js/indexing/trie' {
  interface Trie {
    store: BaseRuleStore;
    root: TrieNode;
    addRule(rule: SpeechRule): void;
    lookupRules(xml: Node, dynamic: string[][]): SpeechRule[];
    hasSubtrie(cstrs: string[]): boolean;
    toString(): string;
    collectRules(): SpeechRule[];
    order(): number;
    enumerate(opt_info?: Object): Object;
    byConstraint(constraint: string[]): TrieNode;
    // Extension
    json(): {[key: string]: Object};
    getSingletonDynamic_(): SpeechRule[];
    singleStyle(style: string): SpeechRule;
  }
}

function trieJson(node: TrieNode): {[key: string]: Object} {
  let json: {[key: string]: Object} = {
    type: node.getKind(),
    '$t': node.getConstraint(),
    children:
    !node.getChildren().length ?
      [] : node.getChildren().map(function(x: any) {
        return trieJson(x);
      })
  }
  let rule = this.getRule();
  if (rule) {
    json['rule'] = rule;
  }
  return json;
};

Trie.prototype.json = function() {
  return {stree: trieJson(this.root)};
};

Trie.prototype.getSingletonDynamic_ = function() {
  let node = this.root;
  let result = [];
  while (node.getChildren().length === 1) {
    node = node.getChildren()[0];
    result.push(node.getConstraint());
  }
  return result;
};

Trie.prototype.singleStyle = function(style: string)  {
  // console.log(style);
  // console.log(this.getSingletonDynamic_());
  return this.byConstraint(this.getSingletonDynamic_()).getChild(style);
};

// Quaries for rule sets.

// BaseRuleStore.prototype.allText = function() {
//   return this.getSpeechRules().filter((x: SpeechRule) =>
//     x.action.hasType(SpeechRule.Type.TEXT));
// };

// BaseRuleStore.prototype.allLocalizable = function() {
//   return this.getSpeechRules().filter((x: sret.SpeechRule) =>
//     x.action.localizable());
// };

// SpeechRule.Action.prototype.localizable = function() {
//   return this.components.some((x: sret.SpeechRule) => x.localizable());
// };

// SpeechRule.Action.prototype.hasType = function(type: string) {
//   return this.components.some((x: sret.SpeechRule) => x.hasType(type));
// };

// SpeechRule.Precondition.prototype.hasDisjunctive = function() {
//   return this.constraints.some((x: string) => x.match(/ or /));
// };

// SpeechRule.Component.prototype.localizable = function(){
//   return this.hasType(SpeechRule.Type.TEXT) &&
//     this.content.match(/^".*"$/);
// };

// SpeechRule.Component.prototype.hasType = function(type: string){
//   return this.type === type;
// };

/**
 * Retrieves a rules for a given sequence of constraints.
 *
 * @param {Array.<string>} constraint A list of constraints.
 * @return {TrieNode} The speech rule or null.
 * What if multiple rules exist?
 */
Trie.prototype.byConstraint = function(constraint: any) {
  let node = this.root;
  while (constraint.length && node) {
    let cstr = constraint.shift();
    node = node.getChild(cstr);
  }
  return node || null;
};

namespace AnalyticsTrie {

  /**
   * @param rules
   */
  export function tempTrie(rules: SpeechRule[]): Trie {
    let store = new MathStore();
    let trie = store.trie;
    for (let rule of rules) {
      trie.addRule(rule);
    }
    return trie;
  }

  /**
   * @param trie
   * @param name
   */
  export function outputTrie(trie: Trie, name: string) {
    let json = trie.json();
    let rules = trie.collectRules();
    AnalyticsUtil.fileJson('trie', json, name);
    AnalyticsUtil.fileJson('trie',
                           rules.map((x: SpeechRule) => x.toString()),
                           name, 'txt');
  }

  /**
   *
   */
  export function restTrie() {
    let applied = Array.from(AnalyticsTest.appliedRule.values())
      .reduce((x, y) => x.concat(y), []);
    let usedTrie = tempTrie(applied);
    let allRules = SpeechRuleEngine.getInstance()['activeStore_']
      .trie.collectRules();
    let outTrie = tempTrie([]);
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

  /**
   *
   */
  export function disjunctiveRules() {
    let rulesets = Object.values(
      SpeechRuleEngine.getInstance().ruleSets_) as SpeechRuleStore[];
    let result = [];
    for (let rules of rulesets) {
      for (let rule of rules.speechRules_) {
        if (rule.precondition.hasDisjunctive()) {
          result.push(rule);
        }
      }
    }
    outputTrie(tempTrie(result), 'disjunctiveRules');
  }

  // Compares two rule sets and creates a trie out of those rules that are the
  // same and do not need to be localized.
  /**
   * @param rules
   * @param comparator
   */
  export function compareRuleSets(
    rules: string[], comparator: Function = compareTries) {
    let set1 = SpeechRuleEngine.getInstance().ruleSets_[rules[0]];
    let set2 = SpeechRuleEngine.getInstance().ruleSets_[rules[1]];
    if (!(set1 && set2)) {
      return;
    }
    let trie = comparator(set1.trie, set2.trie);
    for (let i = 2, rule; rule = rules[i]; i++) {
      let nextSet = SpeechRuleEngine.getInstance().ruleSets_[rule];
      trie = comparator(trie, nextSet.trie);
    }
    return trie;
  }

  /**
   * @param trie1
   * @param trie2
   */
  export function compareTriesConstraints(trie1: Trie, trie2: Trie) {
    let rules = trie2.collectRules();
    let old = trie1.collectRules();
    let locale = old.length ? old[0].dynamicCstr.getValues()[0] : '';
    let result = [];
    for (let rule of rules) {
      let prec = rule.precondition;
      let cstr2 = rule.dynamicCstr.getValues();
      let cstr1 = cstr2.slice(1);
      cstr1.unshift(locale);
      let node = trie1.byConstraint(
        cstr1.concat([prec.query], prec.constraints));
      if (node && node.getRule && node.getRule()) {
        result.push(rule);
      }
    }
    let tmp = tempTrie(result);
    return tmp;
  }

  /**
   * @param trie1
   * @param trie2
   */
  export function compareTries(trie1: Trie, trie2: Trie) {
    let rules = trie2.collectRules();
    let old = trie1.collectRules();
    let locale = old.length ? old[0].dynamicCstr.getValues()[0] : '';
    let result = [];
    for (let rule of rules) {
      let prec = rule.precondition;
      let cstr2 = rule.dynamicCstr.getValues();
      let cstr1 = cstr2.slice(1);
      cstr1.unshift(locale);
      let node = trie1.byConstraint(
        cstr1.concat([prec.query], prec.constraints));
      if (node && node.getRule && node.getRule() &&
        node.getRule().action.toString() === rule.action.toString() &&
        !rule.action.localizable()) {
        result.push(rule);
      }
    }
    let tmp = tempTrie(result);
    return tmp;
  }

  // Compare two tries on default style only.
  /**
   * @param trie1
   * @param trie2
   * @param style
   */
  export function compareTriesStyle(
    trie1: Trie, trie2: Trie, style = 'default') {
    let rules = Trie['collectRules_'](trie2.singleStyle(style));
    let cstr1 = trie1.getSingletonDynamic_();
    cstr1.push(style);
    cstr1 = cstr1.slice(0, 4);
    let result = [];
    for (let rule of rules) {
      let prec = rule.precondition;
      let node = trie1.byConstraint(
        cstr1.concat([prec.query], prec.constraints));
      if (node && node.getRule && node.getRule() &&
        node.getRule().action.toString() === rule.action.toString() &&
        !rule.action.localizable()) {
        result.push(rule);
      }
    }
    let tmp = tempTrie(result);
    return tmp;
  }

  // Compute the diff of two rule sets, wrt. to constraints only (i.e., no
  // comparison of actions).
  /**
   * @param rules1
   * @param rules2
   */
  export function diffRuleSets(rules1: string, rules2: string): Trie {
    let set1 = SpeechRuleEngine.getInstance().ruleSets_[rules1];
    let set2 = SpeechRuleEngine.getInstance().ruleSets_[rules2];
    if (!(set1 && set2)) {
      return null;
    }
    let trie = tempTrie([]);
    let trie1 = set1.trie;
    let trie2 = set2.trie;
    let locale = set1.locale;
    let rules = set2.speechRules_;
    for (let rule of rules) {
      let prec = rule.precondition;
      let cstr = rule.dynamicCstr.getValues();
      cstr.shift();
      cstr.unshift(locale);
      let node = trie1.byConstraint(
        cstr.concat([prec.query], prec.constraints));
      if (!node || !node.getRule || !node.getRule()) {
        trie.addRule(rule);
      }
    }
    locale = set2.locale;
    rules = set1.speechRules_;
    for (let rule of rules) {
      let prec = rule.precondition;
      let cstr = rule.dynamicCstr.getValues();
      cstr.shift();
      cstr.unshift(locale);
      let node = trie2.byConstraint(
        cstr.concat([prec.query], prec.constraints));
      if (!node || !node.getRule || !node.getRule()) {
        trie.addRule(rule);
      }
    }
    return trie;
  }

  export let pairs = [['PrefixRules', 'PrefixFrench'],
                      ['MathspeakRules', 'MathspeakGerman'],
                      ['ClearspeakRules', 'ClearspeakFrench']];

  let sets = [
    ['MathspeakRules', 'MathspeakGerman',
     'MathspeakSpanish', 'MathspeakFrench'],
    ['ClearspeakRules', 'ClearspeakGerman', 'ClearspeakFrench'],
    ['PrefixRules', 'PrefixGerman', 'PrefixSpanish', 'PrefixFrench'],
    ['SummaryRules', 'SummaryGerman', 'SummarySpanish', 'SummaryFrench']
  ];

  /**
   *
   */
  export function output() {
    System.setupEngine({});
    for (let rules of sets) {
      outputTrie(compareRuleSets(rules), rules[0]);
      outputTrie(compareRuleSets(rules, compareTriesConstraints),
                 rules[0] + '-constr');
    }
    disjunctiveRules();
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

export default AnalyticsTrie;
