//
// Copyright 2016 Volker Sorge
//
//
// Copyright (c) 2016 Progressive Accessibility Solutions
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
 * @file Tests for walkers.
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import * as EngineConst from '../../speech-rule-engine/js/common/engine_const.js';
import * as System from '../../speech-rule-engine/js/common/system.js';
import { Walker } from '../../speech-rule-engine/js/walker/walker.js';
import { TableWalker } from '../../speech-rule-engine/js/walker/table_walker.js';
import * as DomUtil from '../../speech-rule-engine/js/common/dom_util.js';
import * as WalkerFactory from '../../speech-rule-engine/js/walker/walker_factory.js';
import * as SpeechGeneratorFactory from '../../speech-rule-engine/js/speech_generator/speech_generator_factory.js';
import { Highlighter } from '../../speech-rule-engine/js/highlighter/highlighter.js';
import * as HighlighterFactory from '../../speech-rule-engine/js/highlighter/highlighter_factory.js';

import { AbstractJsonTest } from '../classes/abstract_test.js';
import { Key } from './keycodes.js';

export class WalkerTest extends AbstractJsonTest {
  private walker: Walker;

  /**
   * @override
   */
  public constructor() {
    super();
    this.pickFields.push('modifier');
  }

  /**
   * @override
   */
  public prepare() {
    super.prepare();
    this.createWalker();
  }

  /**
   * @override
   */
  public async setUpTest() {
    return System.setupEngine({
      modality: 'speech',
      locale: 'en',
      domain: 'mathspeak',
      style: 'default',
      speech: EngineConst.Speech.NONE
    });
  }

  // /**
  //  * Tests summary speech generation for different representations of the
  //  * quadratic formula.
  //  */
  // public testSummary() {
  //   [this.quadratic.mml, this.quadratic.htmlCss,
  //    this.quadratic.chtml, this.quadratic.svg].forEach(
  //      this.executeSummaryQuadraticTest_.bind(this));
  // }

  /**
   * Executes single walker moves and tests the resulting speech.
   *
   * @param move The move of the walker.
   * @param result The expected result.
   * @param modifier
   */
  public executeTest(
    move: string | null,
    result: string | null,
    modifier = false
  ) {
    (this.walker as TableWalker).modifier = modifier;
    if (move) {
      this.walker.move(Key.get(move));
    }
    this.assert.equal(this.walker.speech(), result);
  }

  /**
   * @override
   */
  public method() {
    this.executeTest(
      this.field('input'),
      this.field('expected'),
      this.field('modifier')
    );
  }

  /**
   * Creates a walker.
   */
  private createWalker() {
    const renderer: { renderer: string; browser?: string } = {
      renderer: this.jsonTests['renderer']
    };
    const browser = this.jsonTests['browser'];
    if (browser) {
      renderer['browser'] = browser;
    }
    const expression = this.jsonTests['expression'];
    this.walker = WalkerFactory.walker(
      this.jsonTests['walker'],
      DomUtil.parseInput(this.baseTests['inputs'][expression]),
      SpeechGeneratorFactory.generator(this.jsonTests['generator']),
      HighlighterFactory.highlighter(
        { color: 'black' },
        { color: 'white' },
        renderer
      ) as Highlighter,
      this.baseTests['inputs'][expression.replace(/_.*$/, '_Mml')]
    );
  }
}
