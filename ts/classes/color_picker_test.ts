//
// Copyright 2015 Volker Sorge
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
 * @file Test for the color picker.
 * @author sorge@google.com (Volker Sorge)
 */

import {
  Color,
  ColorPicker
} from '#sre/highlighter/color_picker.js';
import { AbstractJsonTest } from '../classes/abstract_test.js';

export class ColorPickerTest extends AbstractJsonTest {
  /**
   * Tests if a given color object produces the correct rgba value. The test is
   * run on background colors.
   *
   * @param color The color specification.
   * @param expected The expected rgba string.
   */
  public executeTest(color: Color, expected: string) {
    const picker = new ColorPicker(color);
    this.assert.equal(picker.rgba().background, expected);
  }

  /**
   * @override
   */
  public method() {
    this.executeTest(this.field('input'), this.field('expected'));
  }
}
