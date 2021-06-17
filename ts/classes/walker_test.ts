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
 * @fileoverview Tests for walkers.
 *
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import {EngineConst} from '../../speech-rule-engine/js/common/engine';
import * as System from '../../speech-rule-engine/js/common/system';
import {Walker} from '../../speech-rule-engine/js/walker/walker';
import {TableWalker} from '../../speech-rule-engine/js/walker/table_walker';
import * as DomUtil from '../../speech-rule-engine/js/common/dom_util';
import * as WalkerFactory from '../../speech-rule-engine/js/walker/walker_factory';
import * as SpeechGeneratorFactory from '../../speech-rule-engine/js/speech_generator/speech_generator_factory';
import {Highlighter} from '../../speech-rule-engine/js/highlighter/highlighter';
import * as HighlighterFactory from '../../speech-rule-engine/js/highlighter/highlighter_factory';

import {AbstractJsonTest} from '../classes/abstract_test';
import {Key} from './keycodes';


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
  public setUpTest() {
    System.setupEngine(
      {modality: 'speech', locale: 'en', domain: 'mathspeak',
       style: 'default', speech: EngineConst.Speech.NONE});
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
   * @param walker The walker.
   * @param move The move of the walker.
   * @param result The expected result.
   * @param modifier
   */
  public executeTest(move: string | null, result: string | null,
                     modifier: boolean = false) {
    (this.walker as TableWalker).modifier = modifier;
    if (move) {
      this.walker.move(Key.get(move));
    }
    this.assert.equal(this.walker.speech(), result);
  }

  /**
   * @override
   */
  public method(...args: any[]) {
    this.executeTest(args[0], args[1], args[2]);
  }

  /**
   * Creates a walker.
   *
   * @param kind The type of the walker.
   * @param node The node on which to start the walker.
   * @param generator The speech generator to use.
   * @param {{renderer: string,
   *          browser: (undefined|string)}} renderer Information on renderer,
   *         browser. Has to at least contain the
   *     renderer field.
   * @param mml The MathML string for the node.
   * @return The newly created walker.
   */
  private createWalker() {
    let renderer: {renderer: string,
                   browser?: string} = {renderer: this.jsonTests['renderer']};
    let browser = this.jsonTests['browser'];
    if (browser) {
      renderer['browser'] = browser;
    }
    let expression = this.jsonTests['expression'];
    this.walker = WalkerFactory.walker(
      this.jsonTests['walker'],
      DomUtil.parseInput(this.baseTests['inputs'][expression]),
      SpeechGeneratorFactory.generator(this.jsonTests['generator']),
      (HighlighterFactory.highlighter(
        {color: 'black'}, {color: 'white'}, renderer) as Highlighter),
      this.baseTests['inputs'][expression.replace(/_.*$/, '_Mml')]);
  }

}
