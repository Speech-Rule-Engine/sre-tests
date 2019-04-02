// Copyright (c) 2019 Volker Sorge
// Copyright (c) 2019 The MathJax Consortium
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
 * @fileoverview Testcases for summary speech generation.
 *
 * @author v.sorge@mathjax.org (Volker Sorge)
 */

goog.provide('sre.SummaryRuleTest');

goog.require('sre.AbstractRuleTest');



/**
 * @constructor
 * @extends {sre.AbstractRuleTest}
 */
sre.SummaryRuleTest = function() {
  sre.SummaryRuleTest.base(this, 'constructor');

  /**
   * @override
   */
  this.information = 'Summary Rule tests.';

  /**
   * @override
   */
  this.domain = 'mathspeak';

  /**
   * @override
   */
  this.modality = 'summary';

  /**
   * @override
   */
  this.semantics = true;

  /**
   * Keyboard steps preceding speech computation.
   * @type {Array.<string>}
   */
  this.steps = null;
};
goog.inherits(sre.SummaryRuleTest, sre.AbstractRuleTest);


/**
 * @override
 */
sre.SummaryRuleTest.prototype.getSpeech = function(mathMl) {
  if (!this.steps) {
    return sre.SummaryRuleTest.base(this, 'getSpeech', mathMl);
  }
  sre.ProcessorFactory.process('walker', mathMl);
  this.steps.forEach(function(step) {
    sre.ProcessorFactory.process('move', sre.EventUtil.KeyCode[step]);
  });
  return sre.ProcessorFactory.process('move', sre.EventUtil.KeyCode['X']);
};


