// Copyright (c) 2019 Volker Sorge
// Copyright (c) 2019 The MathJax Consortium
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


goog.provide('sre.SpeechSpanishTest');

goog.require('sre.CollapseSpanishTest');
goog.require('sre.MathspeakEmbellishSpanishTest');
goog.require('sre.MathspeakSpanishTest');
goog.require('sre.MmlcloudSpanishTest');
goog.require('sre.NobleSpanishTest');
goog.require('sre.PrefixSpanishTest');
goog.require('sre.SummarySpanishTest');


/**
 * List of Spanish speech generation tests to run.
 * @type {Array}
 */
sre.SpeechSpanishTest.testList = [
  sre.CollapseSpanishTest,
  sre.MathspeakEmbellishSpanishTest,
  sre.MathspeakSpanishTest,
  sre.MmlcloudSpanishTest,
  sre.NobleSpanishTest,
  sre.PrefixSpanishTest,
  sre.SummarySpanishTest
];
