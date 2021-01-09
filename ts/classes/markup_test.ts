//
// Copyright 2017 Volker Sorge
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
// Partially funded by the Diagram Project.

/**
 * @fileoverview Tests of markup output.
 *
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import {sre} from '../base/test_external';
import {AbstractJsonTest} from '../classes/abstract_test';

export class MarkupTest extends AbstractJsonTest {

  /**
   * The quadratic equation as a MathML string with some external markup.
   */
  public static QUADRATIC: string =
  '<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">' +
    '<mi>x</mi>' +
    '<mo>=</mo>' +
    '<mfrac>' +
    '<mrow extid="0">' +
    '<mo>&#x2212;<!-- − --></mo>' +
    '<mi extid="1">b</mi>' +
    '<mo extid="2">&#x00B1;<!-- ± --></mo>' +
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

  /**
   * @override
   */
  constructor() {
    super();
    this.pickFields = this.pickFields.concat(['markup', 'domain']);
  }

  /**
   * @override
   */
  public tearDownTest() {
    sre.System.getInstance().setupEngine(
      {markup: sre.Engine.Markup.NONE});
  }

  /**
   * Executes single markup tests.
   *
   * @param expr The input expression.
   * @param result The expected result.
   * @param markup The markup to test.
   * @param domain The domain for the engine.
   */
  public executeTest(expr: string, result: string, markup: string,
                     domain: string) {
    expr = expr || MarkupTest.QUADRATIC;
    sre.System.getInstance().setupEngine(
      {locale: 'en', modality: 'speech', domain: domain || 'default',
       style: 'default',
       markup: markup ? sre.Engine.Markup[markup] : sre.Engine.Markup.NONE});
    let descrs = sre.System.getInstance().toDescription(expr);
    let output = sre.AuralRendering.getInstance().markup(descrs);
    this.assert.equal(output, result);
  }

  /**
   * @override
   */
  public method(...args: any[]) {
    this.executeTest(args[0], args[1], args[2], args[3]);
  }

}
