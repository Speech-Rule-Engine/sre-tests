//
// Copyright 2013 Google Inc.
//
//
// Copyright 2014 Volker Sorge
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
 * @fileoverview Testcases for math speech rules. Running directly with Jest.
 * @author sorge@google.com (Volker Sorge)
 */

import {sre} from '../base/test_external';
import {AbstractJsonTest} from './abstract_test';

export class SpeechRuleTest extends AbstractJsonTest {

  private _fromString = new Map([
    ['Grammar', sre.SpeechRule.Component.grammarFromString],
    ['Attributes', sre.SpeechRule.Component.attributesFromString],
    ['Components', sre.SpeechRule.Component.fromString],
    ['Actions', sre.SpeechRule.Action.fromString],
    ['AttributesList', (inp: string) =>
      sre.SpeechRule.Component.fromString(inp).getAttributes()]
  ],
  );

  private _toString = new Map([
    ['Grammar', (inp: any) => inp.grammarToString()],
    ['Attributes',  (inp: any) => inp.attributesToString()],
    ['Components', (inp: any) => inp.toString()]
  ],
  );

  /**
   * @override
   */
  public constructor() {
    super();
    this.pickFields.push('kind');
    this.pickFields.push('string');
    this.pickFields.push('pick');
  }

  /**
   * Test objects for structural equality using JSON, otherwise use
   * normal equality.
   *
   * @param expected Expected value.
   * @param actual The actual computed value.
   */
  public assertStructEquals(expected: any, actual: any) {
    this.assert.deepEqual(JSON.parse(JSON.stringify(expected)),
                          JSON.parse(JSON.stringify(actual)));
  }

  /**
   * @override
   */
  public method(...args: any[]) {
    let fromString = this._fromString.get(args[2]);
    if (!fromString) {
      this.assert.fail();
    }
    let received = this.pickComponent(fromString(args[0]), args[4]);
    if (args[3]) {
      let toString = this._toString.get(args[3]);
      if (!toString) {
        this.assert.fail();
      }
      this.assert.equal(toString(received), args[1]);
    } else {
      this.assertStructEquals(received, args[1]);
    }
  }

  /**
   * Picks components from a speech rule element.
   *
   * @param element The element.
   * @param components Components list to pick, as key value pairs. Note that if
   *     the value is -1 the entire component will be picked.
   */
  private pickComponent(element: any, components: [string, string|number][]) {
    if (!components) {
      return element;
    }
    for (let [key, position] of components) {
      element = (position === -1) ? element[key] : element[key][position];
    }
    return element;
  }

}
