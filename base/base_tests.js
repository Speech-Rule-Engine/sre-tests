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


goog.provide('sre.BaseTests');

goog.require('sre.ApiTest');
goog.require('sre.ClearspeakAnnotationTest');
goog.require('sre.ColorPickerTest');
goog.require('sre.DomTest');
goog.require('sre.EnrichMathmlTest');
goog.require('sre.EnrichSpeechTest');
goog.require('sre.MarkupTest');
goog.require('sre.MathAlphabetsTest');
goog.require('sre.MathmlStoreTest');
goog.require('sre.RebuildStreeTest');
goog.require('sre.SemanticApiTest');
goog.require('sre.SemanticRuleTest');
goog.require('sre.SemanticTreeTest');
goog.require('sre.SpeechRuleTest');
goog.require('sre.WalkerMarkupTest');
goog.require('sre.WalkerTest');


/**
 * List that collates all the basic funcional and unit tests.
 * @type {Array}
 */
sre.BaseTests.testList = [
  sre.ApiTest,
  sre.ClearspeakAnnotationTest,
  sre.ColorPickerTest,
  sre.DomTest,
  sre.EnrichMathmlTest,
  sre.EnrichSpeechTest,
  sre.MarkupTest,
  sre.MathAlphabetsTest,
  sre.MathmlStoreTest,
  sre.RebuildStreeTest,
  sre.SemanticApiTest,
  sre.SemanticRuleTest,
  sre.SemanticTreeTest,
  sre.SpeechRuleTest,
  sre.WalkerMarkupTest,
  sre.WalkerTest
];
