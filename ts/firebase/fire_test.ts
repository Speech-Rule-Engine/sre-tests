// Copyright 2020 Volker Sorge
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Test handling in front-end and firebase.
 *
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import {JsonTest, JsonTests} from '../base/test_util';

export class FireTest {

  private countTests = 0;
  private preparedTests: JsonTest[] = [];
  private _keys: string[] = [];

  constructor(public tests: JsonTests,
              public order: string[],
              public getTest: () => JsonTest,
              public setTest: (test: JsonTest) => void) {
    this._keys = Object.keys(tests);
    this.prepareTests();
  }

  get keys() {
    return this._keys;
  }

  /**
   * @return The currently active test.
   */
  public currentTest() {
    return this.preparedTests[this.countTests];
  }

  // This should probably be specialised in a subclass;
  protected prepareTests() {
    for (let key of this.order) {
      let test = this.tests[key];
      test.brf = '';
      test.unicode = '';
      this.preparedTests.push(test);
    }
  }

  protected nextTest(direction: boolean) {
    this.countTests = this.countTests + (direction ? 1 : -1);
    if (this.countTests < 0) {
      this.countTests = this.preparedTests.length - 1;
    }
    if (this.countTests >= this.preparedTests.length) {
      this.countTests = 0;
    }
    return this.currentTest();
  }

  // Where should that go?
  public saveTest(values: JsonTest) {
    let test = this.currentTest();
    for (let key of Object.keys(values)) {
      test[key] = values[key];
    }
  }

  /**
   * The next test in the cycle.
   * @param {boolean} direction Forward if true.
   */
  public cycleTests(direction: boolean) {
    this.saveTest(this.getTest());
    this.setTest(this.nextTest(direction));
  }

}
