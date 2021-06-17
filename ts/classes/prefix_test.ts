//
// Copyright (c) 2016 Volker Sorge
//
//
// Copyright (c) 2016 The MathJax Consortium
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
 * @fileoverview Testcases for prefix speech generation in MathML enrichment.
 *
 * @author v.sorge@mathjax.org (Volker Sorge)
 */

import * as System from '../../speech-rule-engine/js/common/system';
import {Grammar} from '../../speech-rule-engine/js/rule_engine/grammar';
import * as SpeechGeneratorUtil from '../../speech-rule-engine/js/speech_generator/speech_generator_util';
import * as Semantic from '../../speech-rule-engine/js/semantic_tree/semantic';
import {SemanticNode} from '../../speech-rule-engine/js/semantic_tree/semantic_node';
import {EngineConst} from '../../speech-rule-engine/js/common/engine';

import {SpeechTest} from './speech_test';

export class PrefixTest extends SpeechTest {

  /**
   * @override
   */
  public information = 'Prefix rule tests.';

  /**
   * @override
   */
  public modality = 'prefix';

  /**
   * The id of the subnode. Passed on if one is given.
   */
  public id: number = null;

  /**
   * The subexpression for output file.
   */
  public subExpr: Element = null;

  public constructor() {
    super();
    this.pickFields[2] = 'id';
    this.pickFields[3] = 'grammar';
  }

  /**
   * @override
   */
  public setUpTest() {
    super.setUpTest();
    System.setupEngine(
      {markup: EngineConst.Markup.PUNCTUATION});
  }

  /**
   * @override
   */
  public tearDownTest() {
    System.setupEngine(
      {markup: EngineConst.Markup.NONE});
    super.tearDownTest();
  }

  /**
   * @override
   */
  public method(...args: string[]) {
    this.id = args[2] === undefined ? null : parseInt(args[2], 10);
    if (args[3]) {
      Grammar.getInstance().setParameter(args[3], true);
    }
    super.method(args[0], args[1]);
    Grammar.getInstance().clear();
  }

  /**
   * @override
   */
  public getSpeech(mml: string) {
    let stree = Semantic.getTreeFromString(mml);
    let node = stree.root.querySelectorAll(
      this.id === null ?
        (x: SemanticNode) => x.attributes['extid'] === 'A' :
        (x: SemanticNode) => x.id === this.id)[0];
    if (!node) {
      this.assert.fail();
      return '';
    }
    this.subExpr = node.mathmlTree;
    return SpeechGeneratorUtil.retrievePrefix(node);
  }

  /**
   * @override
   */
  public appendRuleExample(
    input: string, output: string, style: string, ..._rest: string[]) {
    let sub = this.subExpr ?
      '<math>' + this.subExpr.toString() + '</math>' : '';
    super.appendRuleExample(input, output, style, sub);
  }
}
