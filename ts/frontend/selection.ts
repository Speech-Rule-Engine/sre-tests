// Copyright 2021 Volker Sorge
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
 * @fileoverview Front-end methods for document selection.
 *
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import * as fc from '../firebase/fire_constants';
import * as lu from './local_util';

/**
 * @param node
 * @param path
 */
export function addDocuments(node: Element, path: string) {
  let storage = lu.getStorage(fc.NemethProjectDocuments);
  if (storage) {
    let documents = JSON.parse(storage);
    createRows(documents.filter((doc: any) => doc.path.match(path)), node);
  }
}

/**
 *
 */
export function getUid() {
  return (lu.getFirebase().auth() as any).getUid();
}

/**
 * @param documents
 * @param anchor
 */
function createRows(documents: any, anchor: Element) {
  documents.sort((x: any, y: any) =>
    ('' + x.name).localeCompare(y.name));
  for (let entry of documents) {
    let row = document.createElement('tr');
    row.setAttribute('tabindex', '0');
    row.classList.add('selection');
    row.innerHTML = `<td class="selection">${entry.name}</td><td>${entry.information}</td><td>${entry.path}</td>`;
    row.addEventListener('click', () => {
      lu.setStorage(fc.NemethProjectPath, entry.path);
      lu.setStorage(fc.NemethProjectUser, getUid());
      window.location.assign('brf2nemeth.html');
    });
    row.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        lu.setStorage(fc.NemethProjectPath, entry.path);
        lu.setStorage(fc.NemethProjectUser, getUid());
        window.location.assign('brf2nemeth.html');
      }
    });
    anchor.appendChild(row);
  }
}
