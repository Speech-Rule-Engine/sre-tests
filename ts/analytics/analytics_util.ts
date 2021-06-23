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
 * @fileoverview Some base methods for analytics.
 *
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import {Trie} from '../../speech-rule-engine/js/indexing/trie';
import * as System from '../../speech-rule-engine/js/common/system';
import {Variables} from '../../speech-rule-engine/js/common/variables';
import {SpeechRuleEngine} from '../../speech-rule-engine/js/rule_engine/speech_rule_engine';
import {SpeechRule} from '../../speech-rule-engine/js/rule_engine/speech_rule';

import {JsonFile, TestPath, TestUtil} from '../base/test_util';

namespace AnalyticsUtil {

  // Removes duplicates from a list in O(n).
  /**
   * @param list
   */
  export function removeDuplicates<T>(list: T[]): T[] {
    let entries: Map<T, boolean> = new Map();
    for (let entry of list) {
      entries.set(entry, true);

    }
    return Array.from(entries.keys());
  }

  /**
   * @param prefix
   * @param json
   * @param name
   * @param ext
   */
  export function fileJson(
    prefix: string, json: JsonFile, name: string, ext: string = 'json') {
    let path = `${TestPath.ANALYSIS + prefix}/${name}.${ext}`;
    TestUtil.saveJson(path, json);
  }


  export function initAllSets(): void {
    for (let locale of Variables.LOCALES) {
      System.setupEngine({locale: locale});
    }
  }

  export function getAllSets(): {[name: string]: SpeechRule[]} {
    initAllSets();
    let trie = SpeechRuleEngine.getInstance().trie;
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

export default AnalyticsUtil;
