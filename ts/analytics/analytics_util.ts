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
 * @fileoverview Some base methods for analytics.
 *
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import * as fs from 'fs';
import {TestPath} from '../base/test_util';

namespace AnalyticsUtil {

  // Removes duplicates from a list in O(n).
  export function removeDuplicates<T>(list: T[]): T[] {
    let entries: Map<T, boolean> = new Map();
    for (let entry of list) {
      entries.set(entry, true);

    }
    return Array.from(entries.keys());
  }

  export function fileOutput(
    prefix: string, content: string, name: string, ext: string) {
    let path = TestPath.ANALYSIS + prefix;
    fs.mkdirSync(path, {recursive: true});
    fs.writeFileSync(
      `${path}/${name}.${ext}`, content);
  }

  export function fileJson(prefix: string, json: any, name: string) {
    fileOutput(prefix, JSON.stringify(json, null, 2), name, 'json');
  }

}

export default AnalyticsUtil;
