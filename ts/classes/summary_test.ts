//
// Copyright (c) 2019 Volker Sorge
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
 * @fileoverview Testcases for summary speech generation.
 *
 * @author v.sorge@mathjax.org (Volker Sorge)
 */

import * as ProcessorFactory from '../../speech-rule-engine/js/common/processor_factory';
import {Key} from './keycodes';

import {SpeechTest} from './speech_test';

export class SummaryTest extends SpeechTest {

  /**
   * @override
   */
  public information = 'Summary Rule tests.';

  /**
   * @override
   */
  public domain = 'mathspeak';

  /**
   * @override
   */
  public modality = 'summary';

  /**
   * Keyboard steps preceding speech computation.
   */
  public steps: string[] = null;

  /**
   * Summary tests class.
   *
   * @class
   */
  public constructor() {
    super();
    this.pickFields.push('steps');
  }

  /**
   * @override
   */
  public getSpeech(mathMl: string) {
    if (!this.steps) {
      return super.getSpeech(mathMl);
    }
    ProcessorFactory.process('walker', mathMl);
    this.steps.forEach(step =>
      ProcessorFactory.process('move', Key.get(step) as any));
    return ProcessorFactory.process('move', Key.get('RETURN') as any) as string;
  }

  /**
   * @override
   */
  public method() {
    this.steps = this.field('steps');
    super.method();
    this.steps = null;
  }
}
