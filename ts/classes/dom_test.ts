
//
// Copyright 2018 Volker Sorge
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
 * @fileoverview Testcases for DOM and Xpath functionality.
 * @author sorge@google.com (Volker Sorge)
 */

import {sre} from '../base/test_external';
import {AbstractJsonTest} from '../classes/abstract_test';

export class HtmlTest extends AbstractJsonTest {

  /**
   * Executes entity tests.
   *
   * @param xml The XML input string.
   * @param result The expected output.
   */
  public entitiesTest(xml: string, result: string) {
    let parsed = sre.DomUtil.parseInput(xml);
    this.assert.equal(parsed.toString(), result);
  }

  /**
   * @override
   */
  public method(...args: any[]) {
    this.entitiesTest(args[0], args[1]);
  }

}

export class XpathTest extends AbstractJsonTest {

  /**
   * @override
   */
  public constructor() {
    super();
    this.pickFields = this.pickFields.concat(['type', 'query']);
  }

  /**
   * Executes entity tests.
   *
   * @param xml The XML input string.
   * @param result The expected output.
   * @param kind The type of Xpath query.
   * @param query The Xpath query.
   */
  public entitiesTest(xml: string, result: string,
                      kind: string, query: string) {
    let parsed = sre.DomUtil.parseInput(xml);
    let actual = sre.XpathUtil[kind](query, parsed);
    this.assert.equal(actual.toString(), result.toString());
  }

  /**
   * @override
   */
  public method(...args: any[]) {
    this.entitiesTest(args[0], args[1], args[2], args[3]);
  }

}
