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

import {sre} from '../base/test_external';
import {SpeechTest} from './speech_test';

export class SymbolTest extends SpeechTest {

  public kind: string = 'character';

  public pickFields = ['name', 'expected', 'style'];

  // /**
  //  * Tests speech translation for single characters.
  //  * @param char The Unicode character.
  //  * @param answer Expected speech translation for the character and style.
  //  */
  // public executeCharTest(char: string, answer: string) {
  //     this.executeTest(char, answer, this.style);
  // }

  /**
   * Execute test for a single unit string.
   * @param char The character or string representing the unit.
   * @param answer Expected speech translation for the unit and style.
   */
  public executeUnitTest(char: string, answer: string, style?: string) {
    sre.Grammar.getInstance().pushState({annotation: 'unit'});
    try {
      this.executeTest(char, answer, style);
    } catch (err) {
      throw err;
    } finally {
      sre.Grammar.getInstance().popState();
    }
  }

  /**
   * @override
   */
  public executeTest(text: string, answer: string, style?: string) {
    style = style || this.style;
    sre.SpeechRuleEngine.getInstance().clearCache();
    sre.System.getInstance().setupEngine(
      {domain: this.domain, style: style,
       modality: this.modality, rules: this.rules, locale: this.locale});
    let actual = this.getSpeech(text);
    let expected = this.actual ? actual : answer;
    this.appendRuleExample(text, expected, style);
    this.assert.equal(actual, expected);
  }

  /**
   * @override
   */
  public getSpeech(text: string) {
    let aural = sre.AuralRendering.getInstance();
    let descrs = [sre.AuditoryDescription.create(
      {text: text}, {adjust: true, translate: true})];
    return aural.finalize(aural.markup(descrs));
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
      this.kind = this.baseTests.type || 'character';
    }
  }

  /**
   * @override
   */
  public method(...args: any[]) {
    this.kind === 'unit' ? this.executeUnitTest(args[0], args[1], args[2]) :
      this.executeTest(args[0], args[1], args[2]);
  }
}
