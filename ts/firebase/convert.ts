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

import {JsonTest, JsonTests} from '../base/test_util';
import {Brf2Unicode} from '../generate/transformers';
import {FireTest} from './fire_test';

// This is a placeholder for the actual test object.
let tmpTests: JsonTests = {
  'Quadratic': {'tex': 'x = \\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}'},
  'Cauchy Schwarz': {'tex': '\\left( \\sum_{k=1}^n a_k b_k \\right)^{\\!\\!2} \\leq  \\left( \\sum_{k=1}^n a_k^2 \\right)  \\left( \\sum_{k=1}^n b_k^2 \\right)'},
  'Continued Fraction': {'tex': '\\frac{1}{\\Bigl(\\sqrt{\\phi\\sqrt{5}}-\\phi\\Bigr)  e^{\\frac25\\pi}} =    1+\\frac{e^{-2\\pi}}      {1+\\frac{e^{-4\\pi}}        {1+\\frac{e^{-6\\pi}}          {1+\\frac{e^{-8\\pi}}            {1+\\ldots} } } }'},
  'Basel Problem': {'tex': '\\sum_{n=1}^\\infty {1\\over n^2} = {\\pi^2\\over 6}'},
  'Cauchy\'s Integral Formula': {'tex': 'f(a) = \\oint_\\gamma \\frac{f(z)}{z-a}dz'},
  'Standard Deviation': {'tex': '\\sigma = \\sqrt{\\frac{1}{N}\\sum_{i=1}^N {(x_i-\\mu)}^2}'}
};

let transformer: Brf2Unicode = null;
let field: {[name: string]: Element} = {};
let fireTest: FireTest = null;
let current: string = '';

declare const MathJax: any;

function setTest(test: JsonTest) {
  field.name.innerHTML = test.name;
  field.expression.innerHTML = `\\[${test.tex}\\]`;
  field.out.innerHTML = test.unicode;
  (field.ip as HTMLTextAreaElement).value = test.brf;
  (field.ip as HTMLTextAreaElement).focus();
  if (MathJax.typeset) {
    MathJax.typeset();
  }
}

function getTest(): JsonTest {
  return {brf: (field.ip as HTMLTextAreaElement).value,
          unicode: field.out.innerHTML};
}

export function init() {
  transformer = new Brf2Unicode();
  fireTest = new FireTest(tmpTests, getTest, setTest);
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

export function generatem() {
  setTimeout(generate, 100);
}

export function changeFormat() {
  transformer.kind = (field.format as HTMLButtonElement).value.toUpperCase();
}
