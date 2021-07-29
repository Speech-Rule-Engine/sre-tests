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

import {allStores} from './analytics_module';
import {Trie} from '../../speech-rule-engine/js/indexing/trie';
import {StaticTrieNode} from '../../speech-rule-engine/js/indexing/abstract_trie_node';
import {MathStore} from '../../speech-rule-engine/js/rule_engine/math_store';
import {SpeechRule} from '../../speech-rule-engine/js/rule_engine/speech_rule';
import {SpeechRuleEngine} from '../../speech-rule-engine/js/rule_engine/speech_rule_engine';

import {TestUtil} from '../base/test_util';

import AnalyticsUtil from './analytics_util';
import AnalyticsTest from './analytics_test';

namespace AnalyticsTrie {

  /**
   * @param rules
   */
  export function tempTrie(rules: SpeechRule[]): Trie {
    let trie = new Trie();
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
    let allRules = SpeechRuleEngine.getInstance().trie.collectRules();
    let outTrie = tempTrie([]);
    for (let rule of allRules) {
      let prec = rule.precondition;
      let cstr = rule.dynamicCstr.getValues();
      let node = usedTrie.byConstraint(
        cstr.concat([prec.query], prec.constraints));
      if (!node || !(node instanceof StaticTrieNode) || !node.getRule() ||
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
    let ruleSets = AnalyticsUtil.getAllSets();
    let result: SpeechRule[] = [];
    for (let [ , rules] of Object.entries(ruleSets)) {
      rules.forEach(rule => {
        if (rule.precondition.hasDisjunctive()) {
          result.push(rule);
        }});
    }
    outputTrie(tempTrie(result), 'disjunctiveRules');
  }

  /**
   * @param rules
   * @param comparator
   */
  export function compareRuleSets(
    rules: MathStore[], comparator: Function = compareTries) {
    let set1 = rules[0];
    let set2 = rules[1];
    if (!(set1 && set2)) {
      return;
    }
    let trie1 = trieFromStore(set1);
    let trie2 = trieFromStore(set2);
    let trie = comparator(trie1, trie2);
    for (let i = 2, nextSet; nextSet = rules[i]; i++) {
      let nextTrie = trieFromStore(nextSet);
      trie = comparator(trie, nextTrie);
    }
    return trie;
  }

  function trieFromStore(store: MathStore) {
    let trie = new Trie();
    store.getSpeechRules().forEach(x => trie.addRule(x));
    return trie;
  }

  /**
   * Compares constraints ignoring the locale.
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
      if (node && (node instanceof StaticTrieNode) && node.getRule()) {
        result.push(rule);
      }
    }
    let tmp = tempTrie(result);
    return tmp;
  }

  // Compares two rule sets and creates a trie out of those rules that are the
  // same and do not need to be localized.
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
      if (node && (node instanceof StaticTrieNode) && node.getRule() &&
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
    let rules = Trie.collectRules_(trie2.singleStyle(style));
    let cstr1 = trie1.getSingletonDynamic_();
    cstr1.push(style);
    cstr1 = cstr1.slice(0, 4);
    let result = [];
    for (let rule of rules) {
      let prec = rule.precondition;
      let node = trie1.byConstraint(
        cstr1.concat([prec.query], prec.constraints));
      if (node && (node instanceof StaticTrieNode) && node.getRule() &&
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
  export function diffRuleSets(set1: MathStore, set2: MathStore): Trie {
    if (!(set1 && set2)) {
      return null;
    }
    let trie = tempTrie([]);
    let trie1 = trieFromStore(set1);
    let trie2 = trieFromStore(set2);
    let locale = set1.locale;
    let rules = set2.getSpeechRules();
    for (let rule of rules) {
      let prec = rule.precondition;
      let cstr = rule.dynamicCstr.getValues();
      cstr.shift();
      cstr.unshift(locale);
      let node = trie1.byConstraint(
        cstr.concat([prec.query], prec.constraints));
      if (!node || !(node instanceof StaticTrieNode) || !node.getRule()) {
        trie.addRule(rule);
      }
    }
    locale = set2.locale;
    rules = set1.getSpeechRules();
    for (let rule of rules) {
      let prec = rule.precondition;
      let cstr = rule.dynamicCstr.getValues();
      cstr.shift();
      cstr.unshift(locale);
      let node = trie2.byConstraint(
        cstr.concat([prec.query], prec.constraints));
      if (!node || !(node instanceof StaticTrieNode) || !node.getRule()) {
        trie.addRule(rule);
      }
    }
    return trie;
  }

  function outputName(store: MathStore) {
    return TestUtil.capitalize(store.locale) +
      TestUtil.capitalize(store.modality) +
      (store.domain === 'default' ? '' : TestUtil.capitalize(store.domain));
  }
  
  /**
   *
   */
  export function output() {
    AnalyticsUtil.initAllSets();
    let rules = allStores;
    outputStats(allStores);
    // TODO: Divides these by modality and domain. O/w it makes little sense!
    outputTrie(compareRuleSets(rules), outputName(rules[0]));
    outputTrie(compareRuleSets(rules, compareTriesConstraints),
               outputName(rules[0]) + '-constr');
    disjunctiveRules();
  }

  function inheritedRules(store: MathStore) {
    let inherits = store.inherits;
    let rules = new Map();
    while (inherits) {
      inherits.getSpeechRules().forEach(x => rules.set(x.name, true));
      inherits = inherits.inherits;
    }
    return rules;
  }

  function outputStats(stores: MathStore[]) {
    for (let store of stores) {
      if (store.kind === 'abstract') continue;
      let prec = store.getAllPreconditions();
      let inherited = inheritedRules(store);
      let rules = store.getSpeechRules();
      let diff = rules.
        filter(x => !(prec.get(x.name) || inherited.get(x.name))).
        map(x => x.name);
      let rest: string[] = [];
      rules.forEach(x => prec.set(x.name, false));
      prec.forEach((value, key) => {
        if (value) {
          rest.push(key);
        }});
      console.log(`${outputName(store)}: ${Array.from(prec.keys()).length} ${rules.length}`);
      console.log(`  Extra Rules: ${diff}`);
      console.log(`  Extra Precs: ${rest}`);
    }
  }

}

export default AnalyticsTrie;
