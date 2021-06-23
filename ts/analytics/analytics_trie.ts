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

import {TrieNode} from '../../speech-rule-engine/js/indexing/trie_node';
import {StaticTrieNode} from '../../speech-rule-engine/js/indexing/abstract_trie_node';
import {Trie} from '../../speech-rule-engine/js/indexing/trie';
import {SpeechRuleEngine} from '../../speech-rule-engine/js/rule_engine/speech_rule_engine';
import {RulesJson, BaseRuleStore} from '../../speech-rule-engine/js/rule_engine/base_rule_store';
import {MathStore} from '../../speech-rule-engine/js/rule_engine/math_store';
import {Action, ActionType, Component, Precondition, SpeechRule} from '../../speech-rule-engine/js/rule_engine/speech_rule';

import {TestUtil} from '../base/test_util';

import AnalyticsUtil from './analytics_util';
import AnalyticsTest from './analytics_test';


declare module '../../speech-rule-engine/js/indexing/trie' {
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
    getSingletonDynamic_(): string[];
    singleStyle(style: string): TrieNode;
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
  };
  if (!(node instanceof StaticTrieNode)) {
    return json;
  }
  let rule = node.getRule();
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
  return this.byConstraint(this.getSingletonDynamic_()).getChild(style);
};

// Queries for rule sets.
declare module '../../speech-rule-engine/js/rule_engine/math_store' {
  interface MathStore {
    annotators: string[];
    initialize(): void;
    annotations(): void;
    defineUniqueRuleAlias(name: string, dynamic: string, query: string, ...args: string[]): void;
    defineRuleAlias(name: string, query: string, ...args: string[]): void;
    defineRulesAlias(name: string, query: string, ...args: string[]): void;
    defineSpecialisedRule(name: string, oldDynamic: string, newDynamic: string, opt_action?: string): void;
    evaluateString(str: string): any[];
    parse(ruleSet: RulesJson): void;
    allText(): boolean;
    allLocalizable(): boolean;
  }
}


MathStore.prototype.allText = function() {
  return this.getSpeechRules().filter((x: SpeechRule) =>
    x.action.hasType(ActionType.TEXT));
};

MathStore.prototype.allLocalizable = function() {
  return this.getSpeechRules().filter((x: SpeechRule) =>
    x.action.localizable());
};


let oldInitialize = MathStore.prototype.initialize;

const allStores: MathStore[] = [];
/**
 * @override
 */
MathStore.prototype.initialize = function() {
  oldInitialize.bind(this)();
  allStores.push(this);
};


declare module '../../speech-rule-engine/js/rule_engine/speech_rule' {
  interface SpeechRule {
    toString(): string;
    localizable(): boolean;
    hasType(type: string): boolean;
  }
  
  interface Action {
    components: Component[];
    toString(): string;
    localizable(): boolean;
    hasType(type: string): boolean;
  }

  interface Component {
    toString(): string;
    grammarToString(): string;
    getGrammar(): string[];
    attributesToString(): string;
    getAttributes(): string[];
    localizable(): boolean;
    hasType(type: string): boolean;
  }

  interface Precondition {
    toString(): string;
    hasDisjunctive(): boolean;
  }

}

Action.prototype.localizable = function() {
  return this.components.some((x: SpeechRule) => x.localizable());
};

Action.prototype.hasType = function(type: string) {
  return this.components.some((x: SpeechRule) => x.hasType(type));
};

Precondition.prototype.hasDisjunctive = function() {
  return this.constraints.some((x: string) => x.match(/ or /));
};

Component.prototype.localizable = function(){
  return this.hasType(ActionType.TEXT) &&
    this.content.match(/^".*"$/);
};

Component.prototype.hasType = function(type: string){
  return this.type === type;
};

/**
 * Retrieves a rules for a given sequence of constraints.
 *
 * @param constraint A list of constraints.
 * @return The speech rule or null. What if multiple rules exist?
 */
Trie.prototype.byConstraint = function(constraint: string[]): TrieNode {
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

  // Compares two rule sets and creates a trie out of those rules that are the
  // same and do not need to be localized.
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
    return TestUtil.capitalize(store.modality) +
      TestUtil.capitalize(store.domain);
  }
  
  /**
   *
   */
  export function output() {
    AnalyticsUtil.initAllSets();
    let rules = allStores;
    // TODO: Divides these by modality and domain. O/w it makes little sense!
    outputTrie(compareRuleSets(rules), outputName(rules[0]));
    outputTrie(compareRuleSets(rules, compareTriesConstraints),
               outputName(rules[0]) + '-constr');
    disjunctiveRules();
  }


}

export default AnalyticsTrie;
