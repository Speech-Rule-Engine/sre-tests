//
// Copyright (c) 2019 Volker Sorge
//
//
// Copyright (c) 2019 The MathJax Consortium
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
 * @fileoverview Testcases for collapse speech generation.
 *
 * @author v.sorge@mathjax.org (Volker Sorge)
 */

import {SpeechTest} from './speech_test';
import * as DomUtil from '../../speech-rule-engine/js/common/dom_util';
import AuralRendering from '../../speech-rule-engine/js/audio/aural_rendering';
import * as SpeechGeneratorUtil from '../../speech-rule-engine/js/speech_generator/speech_generator_util';
import * as Semantic from '../../speech-rule-engine/js/semantic_tree/semantic';

export class CollapseTest extends SpeechTest {

  /**
   * @override
   */
  public information = 'Collapse Rule tests.';

  /**
   * @override
   */
  public domain = 'mathspeak';

  /**
   * Collapse tests class.
   *
   * @class
   */
  public constructor() {
    super();
    this.pickFields.push('pre');
    this.pickFields.push('post');
  }

  /**
   * @override
   */
  public executeTest(mml: string, answer: string, style: string = '',
                     pre: string = '', post: string = '') {
    mml = (pre || '') + '<maction><mtext>action</mtext>' +
      '<mrow data-semantic-id="A" ext-id="A">' +
      mml + '</mrow></maction>' + (post || '');
    super.executeTest(mml, answer, style);
  }

  /**
   * @override
   */
  public header() {
    let header = super.header();
    let script = 'var toggleAll = function() {' +
      'var actions = document.getElementsByTagName(\'mjx-maction\');' +
      ' for (var i = 0, action; action = actions[i]; i++) {' +
      '  action.dispatchEvent(new Event("click")); } }';
    return header + '<script type="text/javascript">' + script +
      '</script><button onclick="toggleAll()">Toggle All</button>\n';
  }

  /**
   * @override
   */
  public getSpeech(mathMl: string) {
    let mml = DomUtil.parseInput(mathMl);
    let stree = Semantic.getTree(mml);
    let xml = stree.xml();
    let node = DomUtil.querySelectorAllByAttr(xml, 'ext-id')[0];
    node.setAttribute('id', node.getAttribute('ext-id'));
    SpeechGeneratorUtil.connectAllMactions(mml, xml);
    let descrs = SpeechGeneratorUtil.computeSpeech(xml);
    return AuralRendering.markup(descrs);
  }

  /**
   * @override
   */
  public method(...args: any[]) {
    this.executeTest(args[0], args[1], args[2], args[3], args[4]);
  }

}
