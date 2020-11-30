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
 * @fileoverview Front-end methods for conversion.
 *
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import {JsonTest} from '../base/test_util';
import * as FC from '../firebase/fire_constants';
import {FireTest} from '../firebase/fire_test';
import {Bldt2Unicode, BrailleTransformer, Nabt2Unicode, Unicode2Bldt, Unicode2Nabt} from '../generate/braille_transformer';
import {init as initButtons} from './buttons';

let transformers: Map<string, BrailleTransformer> = new Map<string, BrailleTransformer>([
  ['NABT', new Nabt2Unicode()],
  ['BLDT', new Bldt2Unicode()]
]);

let backtransformers: Map<string, BrailleTransformer> = new Map<string, BrailleTransformer>([
  ['NABT', new Unicode2Nabt()],
  ['BLDT', new Unicode2Bldt()]
]);

let kind = 'NABT';

function transformer() {
  return transformers.get(kind.toUpperCase());
}

function backtransformer() {
  return backtransformers.get(kind.toUpperCase());
}

let field: {[name: string]: Element} = {};
export let fireTest: FireTest = null;
let current: string = '';

declare const MathJax: any;
declare const firebase: any;

/**
 * Method for setting the test into HTML elements.
 * @param {JsonTest} test The test.
 */
function setTest(test: JsonTest) {
  field.name.innerHTML = test.name;
  field.expression.innerHTML = test.input ?
    `<math>${test.input}</math>` : `\\[${test.tex}\\]`;
  field.out.innerHTML = test.expected as string;
  // TODO: Transform here, depending on the transformation value;
  (field.ip as HTMLTextAreaElement).value =
    backtransformer().via(test.expected as string);
  (field.ip as HTMLTextAreaElement).focus();
  console.log(test);
  let status = test[FC.Interaction];
  if (status !== undefined) {
    switch (status) {
      case FC.Status.NEW:
        field.statuscolor.className = 'green';
        field.statusvalue.innerHTML = 'New';
        break;
      case FC.Status.VIEWED:
        field.statuscolor.className = 'yellow';
        field.statusvalue.innerHTML = 'Viewed';
        break;
      case FC.Status.CHANGED:
        field.statuscolor.className = 'red';
        field.statusvalue.innerHTML = 'Changed';
        break;
      default:
        field.statuscolor.className = '';
        field.statusvalue.innerHTML = '';
    }
  }
  if (MathJax.typeset) {
    MathJax.typeset();
  }
}

/**
 * Method for getting tests from HTML elements.
 * @return The test fields that are harvested from the HTML.
 */
function getTest(): JsonTest {
  return {expected: field.out.innerHTML};
}

// TODO: Work with localStorage!
export function init(collection: string, file: string) {
  if (firebase) {
    initFile(collection, file);
    return;
  }
  setTimeout(init, 100);
}

async function initFile(collection: string, file: string) {
  // TODO: Sort this out properly!
  const db = firebase.app().firestore();
  fireTest = new FireTest(db, collection, file, getTest, setTest);
  await fireTest.prepareTests();
  field.ip = document.getElementById('input');
  field.out = document.getElementById('braille');
  field.error = document.getElementById('error');
  field.format = document.getElementById('format');
  field.expression = document.getElementById('mathexpression');
  field.name = document.getElementById('mathname');
  field.statuscolor = document.getElementById('statuscolor');
  field.statusvalue = document.getElementById('statusvalue');
  fireTest.setTest(fireTest.currentTest());
  initButtons(fireTest);
}

function translate(str: string) {
  field.error.innerHTML = '';
  let newStr = '';
  let result = '';
  for (let char of str.split('')) {
    let res = '';
    try {
      res = transformer().via(char);
    } catch (e) {
      field.error.innerHTML = 'Unknown element ' + char;
      continue;
    }
    newStr += char;
    result += res;
  }
  return [newStr, result];
}

/**
 * Generates with keyboard interaction.
 */
export function generate() {
  let ip = field.ip as HTMLTextAreaElement;
  if (current === ip.value) {
    return;
  }
  let cursor = ip.selectionStart;
  let length = ip.value.length;
  field.out.innerHTML = '';
  let [input, output] = translate(ip.value);
  ip.value = input;
  current = input;
  field.out.innerHTML = output;
  ip.selectionEnd = cursor - (length - output.length);
}

/**
 * Generates with mouse interaction (e.g., copying).
 */
export function generatem() {
  setTimeout(generate, 100);
}

/**
 * Changes the brf format.
 */
export function changeFormat() {
  console.log(kind);
  console.log(transformer());
  kind = (field.format as HTMLButtonElement).value;
  console.log(kind);
  console.log(transformer());
}
