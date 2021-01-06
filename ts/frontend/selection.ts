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

declare const firebase: any;

function getFirebase(): any {
  return firebase;
}

function getStorage(key: string) {
  return localStorage[key];
}

function setStorage(key: string, value: string) {
  localStorage[key] = value;
}

// let table = document.getElementById('selection');

export function addDocuments(node: Element, path: string) {
  let storage = getStorage(fc.NemethProjectDocuments);
  if (storage) {
    let documents = JSON.parse(storage);
    createRows(documents.filter((doc: any) => doc.path.match(path)), node);
  }
}

export function getUid() {
  return getFirebase().auth().getUid();
}

function createRows(documents: any, anchor: Element) {
  for (let entry of documents) {
    let row = document.createElement('tr');
    row.setAttribute('tabindex', '0');
    row.classList.add('selection');
    row.innerHTML = `<td class="selection">${entry.name}</td><td>${entry.information}</td><td>${entry.path}</td>`;
    row.addEventListener('click', () => {
      setStorage(fc.NemethProjectPath, entry.path);
      setStorage(fc.NemethProjectUser, getUid());
      window.location.assign('brf2nemeth.html');
    });
    row.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        setStorage(fc.NemethProjectPath, entry.path);
        setStorage(fc.NemethProjectUser, getUid());
        window.location.assign('brf2nemeth.html');
      }});
    anchor.appendChild(row);
  }
}
