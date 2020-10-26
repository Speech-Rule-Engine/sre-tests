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


import {sre} from '../base/test_external';
import * as sret from '../typings/sre';
import AnalyticsUtil from './analytics_util';
import AnalyticsTest from './analytics_test';


sre.AbstractTrieNode.prototype.json = function() {
  return {
    type: this.getKind(),
    "$t": this.getConstraint(),
    children:
    !this.getChildren().length ?
      [] : this.getChildren().map(function(x: any) {return x.json();})
  };
};


sre.StaticTrieNode.prototype.json = function() {
  var json = sre.StaticTrieNode.base(this, 'json');
  var rule = this.getRule();
  if (rule) {
    json['role'] = rule.action.toString();
  }
  return json;
};


sre.Trie.prototype.json = function() {
  return {stree: this.root.json()};
};


sre.Trie.prototype.getSingletonDynamic_ = function() {
  let node = this.root;
  let result = [];
  while (node.getChildren().length === 1) {
    node = node.getChildren()[0];
    result.push(node.getConstraint());
  }
  return result;
};


sre.Trie.prototype.singleStyle = function(style: string)  {
  // console.log(style);
  // console.log(this.getSingletonDynamic_());
  return this.byConstraint(this.getSingletonDynamic_()).getChild(style);
};


// Quaries for rule sets.

sre.BaseRuleStore.prototype.allText = function() {
  return this.getSpeechRules().filter((x: sret.SpeechRule) => x.action.hasType(sre.SpeechRule.Type.TEXT));
};

sre.BaseRuleStore.prototype.allLocalizable = function() {
  return this.getSpeechRules().filter((x: sret.SpeechRule) => x.action.localizable());
};


sre.SpeechRule.Action.prototype.localizable = function() {
  return this.components.some((x: sret.SpeechRule) => x.localizable());
};

sre.SpeechRule.Action.prototype.hasType = function(type: string) {
  return this.components.some((x: sret.SpeechRule) => x.hasType(type));
};

sre.SpeechRule.Component.prototype.localizable = function(){
  return this.hasType(sre.SpeechRule.Type.TEXT) &&
    this.content.match(/^".*"$/);
};

sre.SpeechRule.Component.prototype.hasType = function(type: string){
  return this.type === type;
};

/**
 * Retrieves a rules for a given sequence of constraints.
 * @param {Array.<string>} constraint A list of constraints.
 * @return {sre.TrieNode} The speech rule or null.
 * What if multiple rules exist?
 */
sre.Trie.prototype.byConstraint = function(constraint: any) {
  let node = this.root;
  while (constraint.length && node) {
    let cstr = constraint.shift();
    node = node.getChild(cstr);
  }
  return node || null;
};


namespace AnalyticsTrie {

  export function tempTrie(rules: sret.SpeechRule[]) {
    let store = new sre.MathStore();
    let trie = store.trie;
    for (let rule of rules) {
      trie.addRule(rule);
    }
    return trie;
  }

  export function outputTrie(trie: sret.Trie, name: string) {
    let json = trie.json();
    let rules = trie.collectRules();
    AnalyticsUtil.fileJson('trie', json, name);
    AnalyticsUtil.fileOutput(
      'trie', rules.map((x: sret.SpeechRule) => x.toString()).join('\n'),
      name, 'txt');
  }

  export function restTrie() {
    let applied = Array.from(AnalyticsTest.appliedRule.values())
      .reduce((x, y) => x.concat(y), []);
    let usedTrie = tempTrie(applied);
    let allRules = sre.SpeechRuleEngine.getInstance()['activeStore_']
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

  // Compares two rule sets and creates a trie out of those rules that are the
  // same and do not need to be localized.
  export function compareRuleSets(rules: string[]) {
    let set1 = sre.SpeechRuleEngine.getInstance().ruleSets_[rules[0]];
    let set2 = sre.SpeechRuleEngine.getInstance().ruleSets_[rules[1]];
    if (!(set1 && set2)) return;
    let trie = compareTries(set1.trie, set2.trie);
    outputTrie(trie, 'intermediate1');
    for (let i = 2, rule; rule = rules[i]; i++) {
      console.log(rule);
      let nextSet = sre.SpeechRuleEngine.getInstance().ruleSets_[rule];
      trie = compareTries(trie, nextSet.trie);
      outputTrie(trie, 'intermediate' + i);
    }
    return trie;
  }

  function compareTries(trie1: sret.Trie, trie2: sret.Trie) {
    let style = 'default';  // TODO: Something later.
    let rules = sre.Trie['collectRules_'](trie2.singleStyle(style));
    console.log(rules.length);
    let cstr1 = trie1.getSingletonDynamic_();
    cstr1.push(style);
    cstr1 = cstr1.slice(0, 4);
    console.log(cstr1);
    let result = [];
    for (let rule of rules) {
      let prec = rule.precondition;
      let node = trie1.byConstraint(cstr1.concat([prec.query], prec.constraints));
      if (node && node.getRule && node.getRule() &&
        node.getRule().action.toString() === rule.action.toString() &&
        !rule.action.localizable()) {
        result.push(rule);
      }
    }
    console.log(result.length);
    let tmp = tempTrie(result);
    return tmp;
  }


  // Compute the diff of two rule sets, wrt. to constraints only (i.e., no
  // comparison of actions).
  export function diffRuleSets(rules1: string, rules2: string) {
    let set1 = sre.SpeechRuleEngine.getInstance().ruleSets_[rules1];
    let set2 = sre.SpeechRuleEngine.getInstance().ruleSets_[rules2];
    if (!(set1 && set2)) return;
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
      let node = trie1.byConstraint(cstr.concat([prec.query], prec.constraints));
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
      let node = trie2.byConstraint(cstr.concat([prec.query], prec.constraints));
      if (!node || !node.getRule || !node.getRule()) {
        trie.addRule(rule);
      }
    }
    return trie;
  }

  let pairs = [['PrefixRules', 'PrefixFrench'],
               ['MathspeakRules', 'MathspeakGerman'],
               ['ClearspeakRules', 'ClearspeakFrench']];

  export function output() {
    sre.System.getInstance().setupEngine({});
    outputTrie(diffRuleSets(pairs[0][0], pairs[0][1]), 'test1');
    outputTrie(diffRuleSets(pairs[1][0], pairs[1][1]), 'test2');
    outputTrie(diffRuleSets(pairs[2][0], pairs[2][1]), 'test3');
    // outputTrie(compareRuleSets(['MathspeakRules', 'ClearspeakRules']), 'compare1');
    outputTrie(compareRuleSets(
      ['MathspeakRules', 'MathspeakGerman', 'MathspeakSpanish', 'MathspeakFrench']), 'mathspeak-all');
    // outputTrie(compareRuleSets(
    //   ['MathspeakRules', 'MathspeakGerman']), 'mathspeak-german');
  }

}

export default AnalyticsTrie;
