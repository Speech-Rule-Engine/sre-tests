//
// Copyright (c) 2020 Volker Sorge
//
//
// Copyright (c) 2020 The MathJax Consortium
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
 * @file Factory for testcases form the classes in this directory.
 * @author v.sorge@mathjax.org (Volker Sorge)
 */

import { TestError, TestPath, TestUtil } from '../base/test_util';
import { AbstractJsonTest } from './abstract_test';

import { ApiTest } from './api_test';
import { ClearspeakAnnotationTest } from './clearspeak_annotation_test';
import { BrailleLayoutTest, ClearspeakTest, SpeechMarkupTest } from './clearspeak_test';
import { CollapseTest } from './collapse_test';
import { ColorPickerTest } from './color_picker_test';
import { HtmlTest, XpathTest } from './dom_test';
import { MarkupTest } from './markup_test';
import { NumberTest } from './number_test';
import { PrefixTest } from './prefix_test';
import * as st from './semantic_test';
import { SpeechRuleTest } from './speech_rule_test';
import { SpeechTest } from './speech_test';
import { SummaryTest, SummarySpeechTest } from './summary_test';
import { SymbolTest } from './symbol_test';
import { WalkerTest } from './walker_test';

const map = new Map<string, any>([
  ['api', ApiTest],
  ['braille2D', BrailleLayoutTest],
  ['deepSpeech', st.DeepSpeechTest],
  ['clearspeak', ClearspeakTest],
  ['clearspeakAnnotation', ClearspeakAnnotationTest],
  ['collapse', CollapseTest],
  ['colorPicker', ColorPickerTest],
  ['enrichMathml', st.EnrichMathmlTest],
  ['enrichSpeech', st.EnrichSpeechTest],
  ['html', HtmlTest],
  ['markup', MarkupTest],
  ['number', NumberTest],
  ['prefix', PrefixTest],
  ['rebuild', st.RebuildStreeTest],
  ['rebuildEnriched', st.RebuildEnrichedTest],
  ['rules', SpeechRuleTest],
  ['semanticApi', st.SemanticApiTest],
  ['semanticXml', st.SemanticXmlTest],
  ['speech', SpeechTest],
  ['speechMarkup', SpeechMarkupTest],
  ['stree', st.SemanticTreeTest],
  ['summary', SummaryTest],
  ['summarySpeech', SummarySpeechTest],
  ['symbol', SymbolTest],
  ['walker', WalkerTest],
  ['xpath', XpathTest]
]);

/**
 * Retrieves and instantiates a test object for a given input json file.
 *
 * @param file The input json file.
 * @returns The JSON test.
 */
export function get(file: string): AbstractJsonTest {
  const filename = TestUtil.fileExists(file, TestPath.EXPECTED);
  const json = TestUtil.loadJson(filename);
  const factory = json['factory'] as string;
  const constructor = map.get(factory);
  if (!constructor) {
    throw new TestError('Bad factory name', file);
  }
  const obj = new constructor();
  obj.jsonFile = file;
  obj.jsonTests = json;
  return obj;
}
