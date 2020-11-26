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
import {Brf2Unicode} from '../generate/transformers';
import {FireTest} from './fire_test';

let transformer: Brf2Unicode = null;
let field: {[name: string]: Element} = {};
let fireTest: FireTest = null;
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
  (field.ip as HTMLTextAreaElement).value = test.brf;
  (field.ip as HTMLTextAreaElement).focus();
  if (MathJax.typeset) {
    MathJax.typeset();
  }
}

/**
 * Method for getting tests from HTML elements.
 * @return The test fields that are harvested from the HTML.
 */
function getTest(): JsonTest {
  return {brf: (field.ip as HTMLTextAreaElement).value,
          expected: field.out.innerHTML};
}

export function init() {
  console.log('Init:');
  console.log(MathJax);
  // console.log(firebase);
  if (firebase) {
    initFile('nemeth/rules/aata.json');
    return;
  }
  setTimeout(init, 100);
}

async function initFile(file: string) {
  transformer = new Brf2Unicode();
  // TODO: Sort this out properly!
  let fi = await firebase.app().firestore().collection('tests').doc(file).get();
  let tests = fi.data().tests;
  console.log(tests);
  fireTest = new FireTest(tests, getTest, setTest);
  // fireTest = new FireTest(tmpTests, getTest, setTest);
  field.ip = document.getElementById('input');
  field.out = document.getElementById('braille');
  field.error = document.getElementById('error');
  field.format = document.getElementById('format');
  field.expression = document.getElementById('mathexpression');
  field.name = document.getElementById('mathname');
  document.querySelector('.btn.next').addEventListener('click', () => {
    fireTest.cycleTests(true);
  });
  document.querySelector('.btn.prev').addEventListener('click', () => {
    fireTest.cycleTests(false);
  });
  fireTest.setTest(fireTest.currentTest());
}

function translate(str: string) {
  field.error.innerHTML = '';
  let newStr = '';
  let result = '';
  for (let char of str.split('')) {
    let res = '';
    try {
      res = transformer.via(char);
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
  transformer.kind = (field.format as HTMLButtonElement).value.toUpperCase();
}
