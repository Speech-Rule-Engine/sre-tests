//
// Copyright 2019 Volker Sorge
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//      http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Abstract class for test cases of single characters.
 * @author Volker.Sorge@gmail.com (Volker Sorge)
 */

import * as DomUtil from '../../../speech-rule-engine-tots/js/common/dom_util';
import System from '../../../speech-rule-engine-tots/js/common/system';
import {SpeechRuleEngine} from '../../../speech-rule-engine-tots/js/rule_engine/speech_rule_engine';
import {Grammar} from '../../../speech-rule-engine-tots/js/rule_engine/grammar';
import AuralRendering from '../../../speech-rule-engine-tots/js/audio/aural_rendering';
import {AuditoryDescription} from '../../../speech-rule-engine-tots/js/audio/auditory_description';

import {SpeechTest} from './speech_test';

export class SymbolTest extends SpeechTest {

  /**
   * The type of symbol that is tested.
   */
  public kind: string = 'character';

  /**
   * A grammar annotation.
   */
  public grammar: {[name: string]: string | boolean} = {};

  /**
   * @override
   */
  public pickFields = ['name', 'key', 'expected', 'style', 'domain'];

  /**
   * @override
   */
  public executeTest(text: string, answer: string, style?: string) {
    style = style || this.style;
    System.setupEngine(
      {domain: this.domain, style: style,
       modality: this.modality, locale: this.locale});
    let actual = this.getSpeech(text);
    let expected = this.actual ? actual : answer;
    this.appendRuleExample(text, expected, style, this.domain);
    this.assert.equal(actual, expected);
  }

  /**
   * @override
   */
  public getSpeech(text: string) {
    let descrs = [];
    if (this.modality === 'braille') {
      if (text.match(/^\s+$/)) {
        // TODO: This is just a temporary fix.
        return '⠀';
      }
      let node = DomUtil.parseInput('<mi></mi>');
      node.textContent = text;
      let evaluator = SpeechRuleEngine.getInstance()
        .getEvaluator(this.locale, this.modality);
      descrs = evaluator(node);
    } else {
      descrs = [AuditoryDescription.create(
        {text: text}, {adjust: true, translate: true})];
    }
    return AuralRendering.finalize(AuralRendering.markup(descrs));
  }

  /**
   * @override
   */
  public prepare() {
    try {
      super.prepare();
    } catch (e) {
      throw e;
    } finally {
      this.kind = this.baseTests.type || this.jsonTests.type || 'character';
      this.grammar = this.baseTests.grammar ||
        this.jsonTests.grammar || this.grammar;
    }
  }

  /**
   * @override
   */
  public method(...args: any[]) {
    let key = args[1] ? args[1] : args[0];
    this.domain = args[4] || this.domain;
    this.executeTest(key, args[2], args[3]);
  }

  /**
   * @override
   */
  public setUpTest() {
    super.setUpTest();
    Grammar.getInstance().pushState(Object.assign({}, this.grammar));
  }

  /**
   * @override
   */
  public tearDownTest() {
    Grammar.getInstance().popState();
    super.tearDownTest();
  }

}
