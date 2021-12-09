//
// Copyright 2019 Volker Sorge
//
//
// Copyright (c) 2019 The MathJax Consortium
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
 * @fileoverview Abstract class for clearspeak rule tests.
 * @author Volker.Sorge@gmail.com (Volker Sorge)
 */

import {EngineConst} from '../../speech-rule-engine/js/common/engine';
import * as System from '../../speech-rule-engine/js/common/system';

import {SpeechTest} from './speech_test';

export class ClearspeakTest extends SpeechTest {

  /**
   * @override
   */
  public domain = 'clearspeak';

  /**
   * @override
   */
  public async setUpTest() {
    await super.setUpTest();
    return System.setupEngine(
      {markup: EngineConst.Markup.PUNCTUATION});
  }

  /**
   * @override
   */
  public tearDownTest() {
    System.setupEngine(
      {markup: EngineConst.Markup.NONE});
    super.tearDownTest();
  }
}

export class BrailleLayoutTest extends SpeechTest {

  /**
   * @override
   */
  public domain = 'nemeth';

  /**
   * @override
   */
  public async setUpTest() {
    await super.setUpTest();
    return System.setupEngine(
      {markup: EngineConst.Markup.LAYOUT});
  }

  /**
   * @override
   */
  public tearDownTest() {
    System.setupEngine(
      {markup: EngineConst.Markup.NONE});
    super.tearDownTest();
  }

  /**
   * @override
   */
  public appendRuleExample(
    input: string, output: string, style: string, ...rest: string[]) {
    output = output.replace(/\n/g, '<br>\n');
    super.appendRuleExample(input, output, style, ...rest);
  }

}
