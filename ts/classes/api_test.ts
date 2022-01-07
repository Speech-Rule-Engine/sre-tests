//
// Copyright 2016 Volker Sorge
//
//
// Copyright (c) 2016 The MathJax Consortium
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
 * @file Tests of API functions.
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import * as EngineConst from '../../speech-rule-engine/js/common/engine_const';
import * as System from '../../speech-rule-engine/js/common/system';
import {
  annotators,
  visitors
} from '../../speech-rule-engine/js/semantic_tree/semantic_annotations';
import { Key } from './keycodes';

import { AbstractJsonTest } from './abstract_test';

export class ApiTest extends AbstractJsonTest {
  /**
   * Feature vector for setting up the engine.
   */
  public static SETUP: { [key: string]: string } = {
    locale: 'en',
    domain: 'mathspeak',
    style: 'default',
    modality: 'speech',
    speech: EngineConst.Speech.NONE
  };

  /**
   * The quadratic equation as a MathML string. By default tests are run against
   * the quadratic equation unless a different input is provided.
   */
  public static QUADRATIC: string;

  /**
   * @override
   */
  public information = 'API function test.';

  /**
   * @override
   */
  public pickFields = ['type', 'input', 'expected', 'setup', 'json', 'move'];

  /**
   * @override
   */
  public async setUpTest() {
    annotators.clear();
    visitors.clear();
    return Promise.resolve('');
  }

  /**
   * Sets up SRE.
   *
   * @param feature The feature vector for the engine.
   */
  public async setupEngine(feature: { [key: string]: string }) {
    await System.setupEngine(feature || ApiTest.SETUP);
  }

  /**
   * Executes single API tests.
   *
   * @param func The API function to test.
   * @param expr The input expression.
   * @param result The expected result.
   * @param feature Feature vector for engine setup.
   * @param json Json output expected?
   * @param move Is this a move with some keyboard input?
   */
  public executeTest(
    func: string,
    expr: any,
    result: string | null,
    feature: { [key: string]: string },
    json: boolean,
    move: boolean
  ) {
    this.setupEngine(feature);
    expr = move ? Key.get(expr) : expr || ApiTest.QUADRATIC;
    let output = (System as any)[func](expr);
    output = output
      ? json
        ? JSON.stringify(output)
        : output.toString()
      : output;
    this.assert.equal(output, result);
  }

  /**
   * @override
   */
  public method() {
    this.executeTest(
      this.field('type'),
      this.field('input'),
      this.field('expected'),
      this.field('setup'),
      this.field('json'),
      this.field('move')
    );
  }
}

ApiTest.QUADRATIC =
  '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">' +
  '<mi>x</mi>' +
  '<mo>=</mo>' +
  '<mfrac>' +
  '<mrow>' +
  '<mo>&#x2212;<!-- − --></mo>' +
  '<mi>b</mi>' +
  '<mo>&#x00B1;<!-- ± --></mo>' +
  '<msqrt>' +
  '<msup>' +
  '<mi>b</mi>' +
  '<mn>2</mn>' +
  '</msup>' +
  '<mo>&#x2212;<!-- − --></mo>' +
  '<mn>4</mn>' +
  '<mi>a</mi>' +
  '<mi>c</mi>' +
  '</msqrt>' +
  '</mrow>' +
  '<mrow>' +
  '<mn>2</mn>' +
  '<mi>a</mi>' +
  '</mrow>' +
  '</mfrac>' +
  '</math>';
