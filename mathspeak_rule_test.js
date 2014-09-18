// Copyright 2014 Volker Sorge
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
 * @fileoverview Testcases for mathspeak speech rules.
 * @author sorge@google.com (Volker Sorge)
 */

goog.provide('sre.MathspeakRuleTest');

goog.require('sre.AbstractTest');



/**
 * @constructor
 * @extends {sre.AbstractTest}
 */
sre.MathspeakRuleTest = function() {
  goog.base(this);

  /**
   * @override
   */
  this.information = 'Mathspeak rule tests.';
};
goog.inherits(sre.MathspeakRuleTest, sre.AbstractTest);


/**
 * Tests if for a given html snippet the applicable rule is indeed the same
 * as the one provided.
 * @param {string} mml Snippet of a MathML expression.
 * @param {string} answer Expected speech translation of MathML expression.
 * @param {string} style Mathspeak style for translation.
 */
sre.MathspeakRuleTest.prototype.executeRuleTest = function(mml, answer, style) {
  var mathMl = '<math xmlns="http://www.w3.org/1998/Math/MathML">' +
          mml + '</math>';
  sre.System.getInstance().setupEngine({semantics: true,
    domain: 'mathspeak',
    style: style});
  var result = sre.System.getInstance().processExpression(mathMl);
  this.assert.equal(result, answer);
};


// In the following default is the verbose version of MathSpeak.
/**
 * Testing Rule 1.1, Example 1.
 */
sre.MathspeakRuleTest.prototype.testSample_1_1_1 = function() {
  var mml = '<mrow><mi>π</mi><mo>≈</mo><mn>3.14159</mn></mrow>';
  this.executeRuleTest(mml, 'pi almost-equals 3.14159', 'default');
  this.executeRuleTest(mml, 'pi almost-equals 3.14159', 'brief');
  this.executeRuleTest(mml, 'pi almost-equals 3.14159', 'sbrief');
};


/**
 * Testing Rule 1.1, Example 2.
 */
sre.MathspeakRuleTest.prototype.testSample_1_1_2 = function() {
  var mml = '<mrow><mn>102</mn><mo>+</mo><mn>2,214</mn><mo>+</mo><mn>15</mn>' +
      '<mo>=</mo><mn>2,331</mn></mrow>';
  this.executeRuleTest(mml, '102 plus 2,214 plus 15 equals 2,331', 'default');
  this.executeRuleTest(mml, '102 plus 2,214 plus 15 equals 2,331', 'brief');
  this.executeRuleTest(mml, '102 plus 2,214 plus 15 equals 2,331', 'sbrief');
};


/**
 * Testing Rule 1.1, Example 3.
 */
sre.MathspeakRuleTest.prototype.testSample_1_1_3 = function() {
  var mml = '<mrow><mn>59</mn><mo>×</mo><mn>0</mn><mo>=</mo><mn>0</mn></mrow>';
  this.executeRuleTest(mml, '59 times 0 equals 0', 'default');
  this.executeRuleTest(mml, '59 times 0 equals 0', 'brief');
  this.executeRuleTest(mml, '59 times 0 equals 0', 'sbrief');
};


/**
 * Testing Rule 1.2, Example 1.
 */
sre.MathspeakRuleTest.prototype.testSample_1_2_1 = function() {
  var mml = '<mrow><mn>3</mn><mo>-</mo><mo>-</mo><mn>2</mn></mrow>';
  this.executeRuleTest(mml, '3 minus negative 2', 'default');
  this.executeRuleTest(mml, '3 minus negative 2', 'brief');
  this.executeRuleTest(mml, '3 minus negative 2', 'sbrief');
};


/**
 * Testing Rule 1.2, Example 2.
 */
sre.MathspeakRuleTest.prototype.testSample_1_2_2 = function() {
  var mml = '<mrow><mo>-</mo><mi>y</mi></mrow>';
  this.executeRuleTest(mml, 'negative y', 'default');
  this.executeRuleTest(mml, 'negative y', 'brief');
  this.executeRuleTest(mml, 'negative y', 'sbrief');
};


/**
 * Testing Rule 1.2, Example 3.
 */
sre.MathspeakRuleTest.prototype.testSample_1_2_3 = function() {
  var mml = '<mrow><mo>-</mo><mn>32</mn></mrow>';
  this.executeRuleTest(mml, 'negative 32', 'default');
  this.executeRuleTest(mml, 'negative 32', 'brief');
  this.executeRuleTest(mml, 'negative 32', 'sbrief');
};


/**
 * Testing Rule 1.4, Example 1.
 */
sre.MathspeakRuleTest.prototype.testSample_1_4_1 = function() {
  var mml = '<mrow><mn>t2e4</mn></mrow>';
  this.executeRuleTest(mml, 'Number t 2 e 4', 'default');
  this.executeRuleTest(mml, 'Num t 2 e 4', 'brief');
  this.executeRuleTest(mml, 'Num t 2 e 4', 'sbrief');
};


/**
 * Testing Rule 1.4, Example 2.
 */
sre.MathspeakRuleTest.prototype.testSample_1_4_2 = function() {
  var mml = '<mrow><mn>#FF0000</mn></mrow>';
  this.executeRuleTest(mml, 'Number number-sign F F 0 0 0 0', 'default');
  this.executeRuleTest(mml, 'Num num-sign F F 0 0 0 0', 'brief');
  this.executeRuleTest(mml, 'Num num-sign F F 0 0 0 0', 'sbrief');
};


/**
 * Testing Rule 1.4, Example 3.
 */
sre.MathspeakRuleTest.prototype.testSample_1_4_3 = function() {
  var mml = '<mrow><mn>0x15FF</mn><mo>+</mo><mn>0x2B01</mn><mo>=</mo>' +
      '<mn>0x4100</mn></mrow>';
  this.executeRuleTest(mml, 'Number 0 x 1 5 F F plus Number 0 x 2 B 0 1' +
                       ' equals Number 0 x 4 1 0 0', 'default');
  this.executeRuleTest(mml, 'Num 0 x 1 5 F F plus Num 0 x 2 B 0 1 equals Num' +
                       ' 0 x 4 1 0 0', 'brief');
  this.executeRuleTest(mml, 'Num 0 x 1 5 F F plus Num 0 x 2 B 0 1 equals Num' +
                       ' 0 x 4 1 0 0', 'sbrief');
};


/**
 * Testing Rule 1.5, Example 1.
 */
sre.MathspeakRuleTest.prototype.testSample_1_5_1 = function() {
  var mml = '<mrow><mn>I</mn><mo>,</mo><mn>II</mn><mo>,</mo><mn>III</mn>' +
      '<mo>,</mo><mn>IV</mn><mo>,</mo><mn>V</mn><mo>.</mo></mrow>';
  this.executeRuleTest(mml, 'upper I comma UpperWord I I comma UpperWord I I' +
                       ' I comma UpperWord I V comma upper V period',
                       'default');
  this.executeRuleTest(mml, 'upper I comma UpperWord I I comma UpperWord I I' +
                       ' I comma UpperWord I V comma upper V period', 'brief');
  this.executeRuleTest(mml, 'upper I comma UpperWord I I comma UpperWord I I' +
                       ' I comma UpperWord I V comma upper V period', 'sbrief');
};


// Not yet possible, as we do not yet handle mstack.
/**
 * Testing Rule 1.6, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_1_6_1 = function() {
  var mml = '<mrow><mfrac><mn>22</mn><mn>7</mn></mfrac><mo>=</mo>' +
      '<mstack stackalign="right"><msline length="6"/><mn>3.142857</mn>' +
      '</mstack></mrow>';
  this.executeRuleTest(mml, 'StartFraction 22 Over 7 EndFraction equals 3' +
                       ' point ModifyingAbove 1 4 2 8 5 7 with bar',
                       'default');
  this.executeRuleTest(mml, 'StartFrac 22 Over 7 EndFrac equals 3 point' +
                       ' ModAbove 1 4 2 8 5 7 with bar', 'brief');
  this.executeRuleTest(mml, 'Frac 22 Over 7 EndFrac equals 3 point ModAbove' +
                       ' 1 4 2 8 5 7 with bar', 'sbrief');
};


/**
 * Testing Rule 2.1, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_2_1_1 = function() {
  var mml = '<mrow><mi>d</mi><mo>=</mo><msqrt><mrow><msup><mrow><mo>(</mo>' +
      '<mi>X</mi><mo>-</mo><mi>x</mi><mo>)</mo></mrow><mn>2</mn></msup>' +
      '<mo>-</mo><msup><mrow><mo>(</mo><mi>Y</mi><mo>-</mo><mi>y</mi>' +
      '<mo>)</mo></mrow><mn>2</mn></msup></mrow></msqrt></mrow>';
  this.executeRuleTest(mml, 'd equals StartRoot left-parenthesis upper x' +
                       ' minus x right-parenthesis squared minus' +
                       ' left-parenthesis upper y minus y right-parenthesis' +
                       ' squared EndRoot', 'default');
  this.executeRuleTest(mml, 'd equals StartRoot left-pren upper x minus x' +
                       ' right-pren squared minus left-pren upper y minus' +
                       ' y right-pren squared EndRoot', 'brief');
  this.executeRuleTest(mml, 'd equals Root L pren upper x minus x R pren' +
                       ' squared minus L pren upper y minus y R pren' +
                       ' squared EndRoot', 'sbrief');
};


/**
 * Testing Rule 2.3, Example 1.
 */
sre.MathspeakRuleTest.prototype.testSample_2_3_1 = function() {
  var mml = '<mrow><mtext>If</mtext><mspace width="4.pt"/><mi>A</mi>' +
      '<mo>→</mo><mi>B</mi><mspace width="4.pt"/><mtext>and</mtext>' +
      '<mspace width="4.pt"/><mi>B</mi><mo>→</mo><mi>C</mi>' +
      '<mspace width="4.pt"/><mtext>then</mtext><mspace width="4.pt"/>' +
      '<mi>A</mi><mo>→</mo><mi>C</mi><mo>.</mo></mrow>';
  this.executeRuleTest(mml, 'If upper A right-arrow upper B and upper B' +
                       ' right-arrow upper C then upper A right-arrow upper C' +
                       ' period', 'default');
  this.executeRuleTest(mml, 'If upper A right-arrow upper B and upper B' +
                       ' right-arrow upper C then upper A right-arrow upper' +
                       ' C period', 'brief');
  this.executeRuleTest(mml, 'If upper A r arrow upper B and upper B r arrow' +
                       ' upper C then upper A r arrow upper C period',
                       'sbrief');
};


/**
 * Testing Rule 2.6, Example 1.
 */
sre.MathspeakRuleTest.prototype.testSample_2_6_1 = function() {
  var mml = '<mrow><mo mathvariant="bold">[</mo><mi>x</mi>' +
      '<mo mathvariant="bold">]</mo></mrow>';
  this.executeRuleTest(mml, 'bold left-bracket x bold right-bracket',
                       'default');
  this.executeRuleTest(mml, 'bold left-brack x bold right-brack', 'brief');
  this.executeRuleTest(mml, 'bold L brack x bold R brack', 'sbrief');
};


/**
 * Testing Rule 2.6, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_2_6_2 = function() {
  var mml = '<mrow><mo>∮</mo><mi>E</mi><mo>·</mo><mi>d</mi><mi>I</mi>' +
      '<mo>=</mo><mfrac><mrow><mi>d</mi><mi>Φ</mi><mi>B</mi></mrow><mrow>' +
      '<mi>d</mi><mi>t</mi></mrow></mfrac></mrow>';
  this.executeRuleTest(mml, 'contour integral upper e dot d bold l equals' +
                       ' minus StartFraction d upper phi upper b Over d t' +
                       ' EndFraction', 'default');
  this.executeRuleTest(mml, 'contour integral upper e dot d bold l equals' +
                       ' minus StartFrac d upper phi upper b Over d t' +
                       ' EndFrac', 'brief');
  this.executeRuleTest(mml, 'contour integral upper e dot d bold l equals' +
                       ' minus Frac d upper phi upper b Over d t EndFrac',
                       'sbrief');
};


/**
 * Testing Rule 4.2, Example 1.
 */
sre.MathspeakRuleTest.prototype.testSample_4_2_1 = function() {
  var mml = '<mrow><mi> Uppercase </mi><mo>(</mo><mo>{</mo><mi>α</mi>' +
      '<mo>,</mo><mi>β</mi><mo>,</mo><mi>γ</mi><mo>,</mo><mi>δ</mi>' +
      '<mo>,</mo><mi>ϵ</mi><mo>,</mo><mi>φ</mi><mo>}</mo><mo>)</mo>' +
      '<mo>=</mo><mo>{</mo><mi>Α</mi><mo>,</mo><mi>Β</mi><mo>,</mo>' +
      '<mi>Γ</mi><mo>,</mo><mi>Δ</mi><mo>,</mo><mi>Ε</mi><mo>,</mo>' +
      '<mi>Φ</mi><mo>}</mo></mrow>';
  this.executeRuleTest(mml, 'Uppercase left-parenthesis StartSet alpha comma' +
                       ' beta comma gamma comma delta comma epsilon comma phi' +
                       ' EndSet right-parenthesis equals StartSet upper' +
                       ' Alpha comma upper Beta comma upper Gamma comma upper' +
                       ' Delta comma upper Epsilon comma upper Phi EndSet',
                       'default');
  this.executeRuleTest(mml, 'Uppercase left-pren StartSet alpha comma beta' +
                       ' comma gamma comma delta comma epsilon comma phi' +
                       ' EndSet right-pren equals StartSet upper Alpha' +
                       ' comma upper Beta comma upper Gamma comma upper Delta' +
                       ' comma upper Epsilon comma upper Phi EndSet', 'brief');
  this.executeRuleTest(mml, 'Uppercase L pren Set alpha comma beta comma' +
                       ' gamma comma delta comma epsilon comma phi EndSet R' +
                       ' pren equals Set upper Alpha comma upper Beta comma' +
                       ' upper Gamma comma upper Delta comma upper Epsilon' +
                       ' comma upper Phi EndSet', 'sbrief');
};


/**
 * Testing Rule 5.1, Example 1.
 */
sre.MathspeakRuleTest.prototype.testSample_5_1_1 = function() {
  var mml = '<mrow><mi>y</mi><mo>-</mo><mn>1</mn></mrow>';
  this.executeRuleTest(mml, 'y minus 1', 'default');
  this.executeRuleTest(mml, 'y minus 1', 'brief');
  this.executeRuleTest(mml, 'y minus 1', 'sbrief');
};


/**
 * Testing Rule 5.1, Example 2.
 */
sre.MathspeakRuleTest.prototype.testSample_5_1_2 = function() {
  var mml = '<mrow><mo>(</mo><mn>1</mn><mtext>-to-</mtext>' +
      '<mn>1</mn><mo>)</mo></mrow>';
  this.executeRuleTest(mml, 'left-parenthesis 1 hyphen to hyphen 1' +
                       ' right-parenthesis', 'default');
  this.executeRuleTest(mml, 'left-pren 1 hyphen to hyphen 1 right-pren',
                       'brief');
  this.executeRuleTest(mml, 'L pren 1 hyphen to hyphen 1 R pren', 'sbrief');
};


/**
 * Testing Rule 5.1, Example 3.
 */
sre.MathspeakRuleTest.prototype.testSample_5_1_3 = function() {
  var mml = '<mrow><mo>-</mo><mn>1</mn></mrow>';
  this.executeRuleTest(mml, 'negative 1', 'default');
  this.executeRuleTest(mml, 'negative 1', 'brief');
  this.executeRuleTest(mml, 'negative 1', 'sbrief');
};


/**
 * Testing Rule 6.1, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_6_1_1 = function() {
  var mml = '<mtext>The Fibonacci numbers are: </mtext><mrow><mo>{</mo>' +
      '<mn>0</mn><mo>,</mo><mn>1</mn><mo>,</mo><mn>1</mn><mo>,</mo>' +
      '<mn>2</mn><mo>,</mo><mn>3</mn><mo>,</mo><mn>5</mn><mo>,</mo>' +
      '<mn>8</mn><mo>,</mo><mo>&#x2026;</mo><mo>}</mo></mrow>';
  this.executeRuleTest(mml, 'The Fibonacci numbers are colon StartSet 0' +
                       ' comma 1 comma 1 comma 2 comma 3 comma 5 comma 8' +
                       ' comma ellipsis EndSet', 'default');
  this.executeRuleTest(mml, 'The Fibonacci numbers are colon StartSet 0' +
                       ' comma 1 comma 1 comma 2 comma 3 comma 5 comma 8' +
                       ' comma ellipsis EndSet', 'brief');
  this.executeRuleTest(mml, 'The Fibonacci numbers are colon Set 0 comma 1' +
                       ' comma 1 comma 2 comma 3 comma 5 comma 8 comma' +
                       ' ellipsis EndSet', 'sbrief');
};


/**
 * Testing Rule 6.2, Example 1.
 */
sre.MathspeakRuleTest.prototype.testSample_6_2_1 = function() {
  var mml = '<mrow><mo>|</mo><mn>4</mn><mo>-</mo><mn>7</mn><mo>|</mo>' +
      '<mo>=</mo><mn>3</mn></mrow>';
  this.executeRuleTest(mml, 'StartAbsoluteValue 4 minus 7 EndAbsoluteValue' +
                       ' equals 3', 'default');
  this.executeRuleTest(mml, 'StartAbsoluteValue 4 minus 7 EndAbsoluteValue' +
                       ' equals 3', 'brief');
  this.executeRuleTest(mml, 'AbsoluteValue 4 minus 7 EndAbsoluteValue equals' +
                       ' 3', 'sbrief');
};


/**
 * Testing Rule 6.2, Example 2.
 * This equation does not make sense! We can do it purely syntactically!
 */
sre.MathspeakRuleTest.prototype.untestSample_6_2_2_old = function() {
  var mml = '<mrow><mfenced separators="" open="|" close="|"><mi>a</mi>' +
      '<mfenced separators="" open="|" close="|"><mo>±</mo><mi>b</mi>' +
      '</mfenced><mo>-</mo><mn>15</mn></mfenced><mo>≠</mo>' +
      '<mfenced open="|" close="|"><mi>a</mi></mfenced><mo>±</mo>' +
      '<mi>b</mi><mfenced separators="" open="|" close="|"><mo>-</mo>' +
      '<mn>15</mn></mfenced></mrow>';
  this.executeRuleTest(mml, 'StartAbsoluteValue a StartAbsoluteValue' +
                       ' plus-or-minus b EndAbsoluteValue minus 15' +
                       ' EndAbsoluteValue not-equals StartAbsoluteValue a' +
                       ' EndAbsoluteValue plus-or-minus b StartAbsoluteValue' +
                       ' minus 15 EndAbsoluteValue', 'default');
  this.executeRuleTest(mml, 'StartAbsoluteValue a StartAbsoluteValue' +
                       ' plus-or-minus b EndAbsoluteValue minus 15' +
                       ' EndAbsoluteValue not-equals StartAbsoluteValue a' +
                       ' EndAbsoluteValue plus-or-minus b StartAbsoluteValue' +
                       ' minus 15 EndAbsoluteValue', 'brief');
  this.executeRuleTest(mml, 'AbsoluteValue a AbsoluteValue plus-or-minus b' +
                       ' EndAbsoluteValue minus 15 EndAbsoluteValue' +
                       ' not-equals AbsoluteValue a EndAbsoluteValue' +
                       ' plus-or-minus b AbsoluteValue minus 15' +
                       ' EndAbsoluteValue', 'sbrief');
};


/**
 * Testing Rule 6.2, Example 2.
 * This equation does not make sense! We can do it purely syntactically!
 */
sre.MathspeakRuleTest.prototype.testSample_6_2_2 = function() {
  var mml = '<mrow><mfenced separators="" open="|" close="|"><mi>a</mi>' +
      '<mo>&#xb1;</mo><mfenced separators="" open="|" close="|"><mi>b</mi>' +
      '<mo>-</mo><mi>c</mi></mfenced></mfenced><mo>&#x2260;</mo>' +
      '<mfenced open="|" close="|"><mi>a</mi></mfenced><mo>&#xb1;</mo>' +
      '<mfenced separators="" open="|" close="|"><mi>b</mi><mo>-</mo>' +
      '<mn>c</mn></mfenced></mrow>';
  this.executeRuleTest(mml, 'StartAbsoluteValue a plus-or-minus' +
                       ' StartAbsoluteValue b minus c EndAbsoluteValue' +
                       ' EndAbsoluteValue not-equals StartAbsoluteValue a' +
                       ' EndAbsoluteValue plus-or-minus StartAbsoluteValue b' +
                       ' minus c EndAbsoluteValue', 'default');
  this.executeRuleTest(mml, 'StartAbsoluteValue a plus-or-minus' +
                       ' StartAbsoluteValue b minus c EndAbsoluteValue' +
                       ' EndAbsoluteValue not-equals StartAbsoluteValue a' +
                       ' EndAbsoluteValue plus-or-minus StartAbsoluteValue b' +
                       ' minus c EndAbsoluteValue', 'brief');
  this.executeRuleTest(mml, 'AbsoluteValue a plus-or-minus' +
                       ' AbsoluteValue b minus c EndAbsoluteValue' +
                       ' EndAbsoluteValue not-equals AbsoluteValue a' +
                       ' EndAbsoluteValue plus-or-minus AbsoluteValue b' +
                       ' minus c EndAbsoluteValue', 'sbrief');
};


/**
 * Testing Rule 7.1, Example 1.
 */
sre.MathspeakRuleTest.prototype.testSample_7_1_1 = function() {
  var mml = '<mfrac><mn>1</mn><mi>x</mi></mfrac>';
  this.executeRuleTest(mml, 'StartFraction 1 Over x EndFraction', 'default');
  this.executeRuleTest(mml, 'StartFrac 1 Over x EndFrac', 'brief');
  this.executeRuleTest(mml, 'Frac 1 Over x EndFrac', 'sbrief');
};


/**
 * Testing Rule 7.1, Example 2.
 */
sre.MathspeakRuleTest.prototype.testSample_7_1_2 = function() {
  var mml = '<mrow><mi>a</mi><mo>-</mo><mfrac><mrow><mi>b</mi><mo>+</mo>' +
      '<mi>c</mi></mrow><mrow><mi>d</mi><mo>-</mo><mi>e</mi></mrow>' +
      '</mfrac><mo>×</mo><mi>f</mi></mrow>';
  this.executeRuleTest(mml, 'a minus StartFraction b plus c Over d minus e' +
                       ' EndFraction times f', 'default');
  this.executeRuleTest(mml, 'a minus StartFrac b plus c Over d minus e' +
                       ' EndFrac times f', 'brief');
  this.executeRuleTest(mml, 'a minus Frac b plus c Over d minus e EndFrac' +
                       ' times f', 'sbrief');
};


/**
 * Testing Rule 7.2, Example 1.
 */
sre.MathspeakRuleTest.prototype.testSample_7_2_1 = function() {
  var mml = '<mrow><mfrac><mfrac><mi>x</mi><mi>y</mi></mfrac><mi>z</mi>' +
      '</mfrac><mo>≠</mo><mfrac><mi>x</mi><mfrac><mi>y</mi><mi>z</mi>' +
      '</mfrac></mfrac></mrow>';
  this.executeRuleTest(mml, 'StartStartFraction StartFraction x Over y' +
                       ' EndFraction OverOver z EndEndFraction not-equals' +
                       ' StartStartFraction x OverOver StartFraction y Over' +
                       ' z EndFraction EndEndFraction', 'default');
  this.executeRuleTest(mml, 'StartStartFrac StartFrac x Over y EndFrac' +
                       ' OverOver z EndEndFrac not-equals StartStartFrac x' +
                       ' OverOver StartFrac y Over z EndFrac EndEndFrac',
                       'brief');
  this.executeRuleTest(mml, 'NestFrac Frac x Over y EndFrac NestOver z' +
                       ' NestEndFrac not-equals NestFrac x NestOver Frac y' +
                       ' Over z EndFrac NestEndFrac', 'sbrief');
};


/**
 * Testing Rule 7.3, Example 1.
 */
sre.MathspeakRuleTest.prototype.testSample_7_3_1 = function() {
  var mml = '<mfrac><mfrac><mrow><mfenced separators="" open="(" close=")">' +
      '<mn>1</mn><mo>-</mo><mi>x</mi></mfenced><mfrac><mi>d</mi><mrow>' +
      '<mi>d</mi><mi>x</mi></mrow></mfrac>' +
      '<mfenced separators="" open="(" close=")"><mn>2</mn><mi>x</mi>' +
      '</mfenced><mo>-</mo><mn>2</mn><mi>x</mi><mfrac><mi>d</mi><mrow>' +
      '<mi>d</mi><mi>x</mi></mrow></mfrac>' +
      '<mfenced separators="" open="(" close=")"><mn>1</mn><mo>-</mo>' +
      '<mi>x</mi></mfenced></mrow><msup>' +
      '<mfenced separators="" open="(" close=")"><mn>1</mn><mo>-</mo>' +
      '<mi>x</mi></mfenced><mn>2</mn></msup></mfrac><mrow><mn>1</mn>' +
      '<mo>+</mo><msup><mfenced separators="" open="(" close=")"><mfrac>' +
      '<mrow><mn>2</mn><mi>x</mi></mrow><mrow><mn>1</mn><mo>-</mo>' +
      '<mi>x</mi></mrow></mfrac></mfenced><mn>2</mn></msup></mrow></mfrac>';
  this.executeRuleTest(mml, 'StartStartStartFraction StartStartFraction' +
                       ' left-parenthesis 1 minus x right-parenthesis' +
                       ' StartFraction d Over d x EndFraction' +
                       ' left-parenthesis 2 x right-parenthesis minus 2 x' +
                       ' StartFraction d Over d x EndFraction' +
                       ' left-parenthesis 1 minus x right-parenthesis' +
                       ' OverOver left-parenthesis 1 minus x' +
                       ' right-parenthesis squared EndEndFraction' +
                       ' OverOverOver 1 plus left-parenthesis StartFraction' +
                       ' 2 x Over 1 minus x EndFraction right-parenthesis' +
                       ' squared EndEndEndFraction', 'default');
  this.executeRuleTest(mml, 'StartStartStartFrac StartStartFrac left-pren 1' +
                       ' minus x right-pren StartFrac d Over d x EndFrac' +
                       ' left-pren 2 x right-pren minus 2 x StartFrac d' +
                       ' Over d x EndFrac left-pren 1 minus x right-pren' +
                       ' OverOver left-pren 1 minus x right-pren squared' +
                       ' EndEndFrac OverOverOver 1 plus left-pren StartFrac' +
                       ' 2 x Over 1 minus x EndFrac right-pren squared' +
                       ' EndEndEndFrac', 'brief');
  this.executeRuleTest(mml, 'NestTwiceFrac NestFrac L pren 1 minus x R' +
                       ' pren Frac d Over d x EndFrac L pren 2 x R pren' +
                       ' minus 2 x Frac d Over d x EndFrac L pren 1 minus x' +
                       ' R pren NestOver L pren 1 minus x R pren squared' +
                       ' NestEndFrac NestTwiceOver 1 plus L pren Frac 2 x' +
                       ' Over 1 minus x EndFrac R pren squared' +
                       ' NestTwiceEndFrac', 'sbrief');
};


/**
 * Testing Rule 7.3, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_7_3_2 = function() {
  var mml = '<mrow><msub><mi>a</mi><mn>0</mn></msub><mo>+</mo><mfrac>' +
      '<mn>1</mn><mrow><msub><mi>a</mi><mn>1</mn></msub><mo>+</mo><mfrac>' +
      '<mn>1</mn><mrow><msub><mi>a</mi><mn>2</mn></msub><mo>+</mo><mfrac>' +
      '<mn>1</mn><mrow><mo>&#x2026;</mo><mo>+</mo><mfrac><mn>1</mn><msub>' +
      '<mi>a</mi><mi>n</mi></msub></mfrac></mrow></mfrac></mrow></mfrac>' +
      '</mrow></mfrac></mrow>';
  this.executeRuleTest(mml, 'a 0 plus StartStartStartStartFraction 1' +
                       ' OverOverOverOver a 1 plus StartStartStartFraction 1' +
                       ' OverOverOver a 2 plus StartStartFraction 1 OverOver' +
                       ' ellipsis plus StartFraction 1 Over a Subscript n' +
                       ' Baseline EndFraction EndEndFraction' +
                       ' EndEndEndFraction EndEndEndEndFraction', 'default');
  this.executeRuleTest(mml, 'a 0 plus StartStartStartStartFrac 1' +
                       ' OverOverOverOver a 1 plus StartStartStartFrac 1' +
                       ' OverOverOver a 2 plus StartStartFrac 1 OverOver' +
                       ' ellipsis plus StartFrac 1 Over a Sub n Base EndFrac' +
                       ' EndEndFrac EndEndEndFrac EndEndEndEndFrac', 'brief');
  this.executeRuleTest(mml, 'a 0 plus Nest3Frac 1 Nest3Over a 1 plus' +
                       ' NestTwiceFrac 1 NestTwiceOver a 2 plus NestFrac 1' +
                       ' NestOver ellipsis plus Frac 1 Over a Sub n base' +
                       ' EndFrac NestEndFrac NestTwiceEndFrac Nest3EndFrac',
                       'sbrief');
};


/**
 * Testing Rule 7.4, Example 1.
 */
sre.MathspeakRuleTest.prototype.testSample_7_4_1 = function() {
  var mml = '<mrow><mfrac><mn>1</mn><mn>2</mn></mfrac><mo>+</mo><mfrac>' +
      '<mn>2</mn><mn>2</mn></mfrac><mo>+</mo><mfrac><mn>3</mn><mn>2</mn>' +
      '</mfrac><mo>+</mo><mfrac><mn>4</mn><mn>2</mn></mfrac><mo>+</mo>' +
      '<mo>&#x2026;</mo><mo>=</mo><munderover><mo>∑</mo><mrow><mi>n</mi>' +
      '<mo>=</mo><mn>1</mn></mrow>' +
      '<mo movablelimits="true" form="prefix">∞</mo></munderover><mfrac>' +
      '<mi>n</mi><mn>2</mn></mfrac></mrow>';
  this.executeRuleTest(mml, 'one-half plus two-halves plus three-halves plus' +
                       ' four-halves plus ellipsis equals sigma-summation' +
                       ' Underscript n equals 1 Overscript infinity' +
                       ' Endscripts StartFraction n Over 2 EndFraction',
                       'default');
  this.executeRuleTest(mml, 'one-half plus two-halves plus three-halves plus' +
                       ' four-halves plus ellipsis equals sigma-summation' +
                       ' Underscript n equals 1 Overscript infinity' +
                       ' Endscripts StartFrac n Over 2 EndFrac', 'brief');
  this.executeRuleTest(mml, 'one-half plus two-halves plus three-halves plus' +
                       ' four-halves plus ellipsis equals sigma-summation' +
                       ' Underscript n equals 1 Overscript infinity' +
                       ' Endscripts Frac n Over 2 EndFrac', 'sbrief');
};


/**
 * Testing Rule 7.4, Example 2.
 */
sre.MathspeakRuleTest.prototype.testSample_7_4_2 = function() {
  var mml = '<mrow><mfrac><mn>20</mn><mn>5</mn></mfrac><mo>×</mo><mfrac>' +
      '<mn>1</mn><mn>100</mn></mfrac><mo>=</mo><mfrac><mn>1</mn>' +
      '<mn>25</mn></mfrac></mrow>';
  this.executeRuleTest(mml, 'StartFraction 20 Over 5 EndFraction times' +
                       ' StartFraction 1 Over 100 EndFraction equals' +
                       ' one-twenty-fifth', 'default');
  this.executeRuleTest(mml, 'StartFrac 20 Over 5 EndFrac times StartFrac 1' +
                       ' Over 100 EndFrac equals one-twenty-fifth', 'brief');
  this.executeRuleTest(mml, 'Frac 20 Over 5 EndFrac times Frac 1 Over 100' +
                       ' EndFrac equals one-twenty-fifth', 'sbrief');
};


/**
 * Testing Rule 7.4, Example 3.
 */
sre.MathspeakRuleTest.prototype.testSample_7_4_3 = function() {
  var mml = '<mrow><mfrac><mfrac><mn>3</mn><mn>5</mn></mfrac><mn>8</mn>' +
      '</mfrac><mo>=</mo><mfrac><mn>3</mn><mn>5</mn></mfrac><mo>×</mo>' +
      '<mfrac><mn>1</mn><mn>8</mn></mfrac></mrow>';
  this.executeRuleTest(mml, 'StartFraction three-fifths Over 8 EndFraction' +
                       ' equals three-fifths times one-eighth', 'default');
  this.executeRuleTest(mml, 'StartFrac three-fifths Over 8 EndFrac equals' +
                       ' three-fifths times one-eighth', 'brief');
  this.executeRuleTest(mml, 'Frac three-fifths Over 8 EndFrac equals' +
                       ' three-fifths times one-eighth', 'sbrief');
};


/**
 * Testing Rule 7.5, Example 1.
 */
sre.MathspeakRuleTest.prototype.testSample_7_5_1 = function() {
  var mml = '<mrow><mn>3</mn><mfrac><mn>5</mn><mn>8</mn></mfrac><mo>=</mo>' +
      '<mfrac><mn>29</mn><mn>8</mn></mfrac></mrow>';
  this.executeRuleTest(mml, '3 and five-eighths equals StartFraction 29 Over' +
                       ' 8 EndFraction', 'default');
  this.executeRuleTest(mml, '3 and five-eighths equals StartFrac 29 Over 8' +
                       ' EndFrac', 'brief');
  this.executeRuleTest(mml, '3 and five-eighths equals Frac 29 Over 8' +
                       ' EndFrac', 'sbrief');
};


/**
 * Testing Rule 7.6, Example 1.
 */
sre.MathspeakRuleTest.prototype.testSample_7_6_1 = function() {
  var mml = '<mrow><msub><mi>a</mi><mn>0</mn></msub><mo>+</mo><mfrac><msub>' +
      '<mi>b</mi><mn>1</mn></msub><mrow><msub><mi>a</mi><mn>1</mn></msub>' +
      '<mo>+</mo><mfrac><msub><mi>b</mi><mn>2</mn></msub><mrow><msub>' +
      '<mi>a</mi><mn>2</mn></msub><mo>+</mo><mfrac><msub><mi>b</mi>' +
      '<mn>3</mn></msub><mrow><msub><mi>a</mi><mn>3</mn></msub><mo>+</mo>' +
      '<mo>&#x2026;</mo></mrow></mfrac></mrow></mfrac></mrow></mfrac><mo>=</mo>' +
      '<msub><mi>a</mi><mn>0</mn></msub><mo>+</mo><mfrac><msub><mi>b</mi>' +
      '<mn>1</mn></msub><msub><mi>a</mi><mn>1</mn></msub></mfrac>' +
      '<mo>+</mo><mfrac><msub><mi>b</mi><mn>2</mn></msub><msub><mi>a</mi>' +
      '<mn>2</mn></msub></mfrac><mo>+</mo><mo>&#x2026;</mo></mrow>';
  this.executeRuleTest(mml, 'a 0 plus continuedFraction b 1 Over a 1 plus' +
                       ' StartFraction b 2 Over a 2 plus StartFraction b 3' +
                       ' Over a 3 plus ellipsis equals a 0 plus' +
                       ' StartFraction b 1 Over a 1 EndFraction plus' +
                       ' StartFraction b 2 Over a 2 EndFraction plus ellipsis',
                       'default');
  this.executeRuleTest(mml, 'a 0 plus continuedFrac b 1 Over a 1 plus' +
                       ' StartFrac b 2 Over a 2 plus StartFrac b 3 Over a 3' +
                       ' plus ellipsis equals a 0 plus StartFrac b 1 Over a' +
                       ' 1 EndFrac plus StartFrac b 2 Over a 2 EndFrac plus' +
                       ' ellipsis', 'brief');
  this.executeRuleTest(mml, 'a 0 plus continuedFrac b 1 Over a 1 plus Frac b' +
                       ' 2 Over a 2 plus Frac b 3 Over a 3 plus ellipsis' +
                       ' equals a 0 plus Frac b 1 Over a 1 EndFrac plus Frac' +
                       ' b 2 Over a 2 EndFrac plus ellipsis', 'sbrief');
};


/**
 * Testing Rule 8.10, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_10_1 = function() {
  var mml = '<mrow><msup><mi>ρ</mi><mo>\'</mo></msup><mo>=</mo><msubsup>' +
      '<mi>ρ</mi><mo>+</mo><mo>\'</mo></msubsup><mo>+</mo><msubsup>' +
      '<mi>ρ</mi><mo>-</mo><mo>\'</mo></msubsup></mrow>';
  this.executeRuleTest(mml, 'rho prime equals rho prime Subscript plus' +
                       ' Baseline plus rho prime Subscript minus', 'default');
  this.executeRuleTest(mml, 'rho prime equals rho prime Sub plus Base plus' +
                       ' rho prime Sub minus', 'brief');
  this.executeRuleTest(mml, 'rho prime equals rho prime Sub plus Base plus' +
                       ' rho prime Sub minus', 'sbrief');
};


/**
 * Testing Rule 8.10, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_10_2 = function() {
  var mml = '<msubsup><mi>x</mi><mn>10</mn><mo>\'</mo></msubsup>';
  this.executeRuleTest(mml, 'x prime 10', 'default');
  this.executeRuleTest(mml, 'x prime 10', 'brief');
  this.executeRuleTest(mml, 'x prime 10', 'sbrief');
};


/**
 * Testing Rule 8.10, Example 3.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_10_3 = function() {
  var mml = '<msubsup><mi>T</mi><mi>n</mi><mo>\'</mo></msubsup>';
  this.executeRuleTest(mml, 'upper t prime Subscript n', 'default');
  this.executeRuleTest(mml, 'upper t prime Sub n', 'brief');
  this.executeRuleTest(mml, 'upper t prime Sub n', 'sbrief');
};


/**
 * Testing Rule 8.11, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_11_1 = function() {
  var mml = '<mfenced open="[" close="]"><mtable><mtr><mtd><msup><mi>x</mi>' +
      '<mi>n</mi></msup></mtd><mtd><msup><mi>y</mi><mi>n</mi></msup></mtd>' +
      '<mtd><msup><mi>z</mi><mi>n</mi></msup></mtd></mtr><mtr><mtd><msup>' +
      '<mi>x</mi><mrow><mi>n</mi><mo>+</mo><mn>1</mn></mrow></msup></mtd>' +
      '<mtd><msup><mi>y</mi><mrow><mi>n</mi><mo>+</mo><mn>1</mn></mrow>' +
      '</msup></mtd><mtd><msup><mi>z</mi><mrow><mi>n</mi><mo>+</mo>' +
      '<mn>1</mn></mrow></msup></mtd></mtr></mtable></mfenced>';
  this.executeRuleTest(mml, 'Start 2 by 3 matrix 1st Row  1st Column x' +
                       ' Superscript n 2nd Column y Superscript n 3rd Column' +
                       ' z Superscript n 2nd Row  1st Column x Superscript n' +
                       ' plus 1 2nd Column y Superscript n plus 1 3rd Column' +
                       ' z Superscript n plus 1 Endmatrix', 'default');
  this.executeRuleTest(mml, 'Start 2 by 3 matrix 1st Row  1st Column x sup n' +
                       ' 2nd Column y sup n 3rd Column z sup n 2nd Row  1st' +
                       ' Column x sup n plus 1 2nd Column y sup n plus 1 3rd' +
                       ' Column z sup n plus 1 Endmatrix', 'brief');
  this.executeRuleTest(mml, '2 by 3 matrix 1st Row  1st Column x sup n 2nd' +
                       ' Column y sup n 3rd Column z sup n 2nd Row  1st' +
                       ' Column x sup n plus 1 2nd Column y sup n plus 1 3rd' +
                       ' Column z sup n plus 1 Endmatrix', 'sbrief');
};


/**
 * Testing Rule 8.1, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_1_1 = function() {
  var mml = '<mrow><msup><mi>x</mi><mn>3</mn></msup><mo>+</mo><mn>6</mn>' +
      '<msup><mi>x</mi><mn>2</mn></msup><mo>-</mo><mi>x</mi><mo>=</mo>' +
      '<mn>30</mn></mrow>';
  this.executeRuleTest(mml, 'x cubed plus 6 x squared minus x equals 30',
                       'default');
  this.executeRuleTest(mml, 'x cubed plus 6 x squared minus x equals 30',
                       'brief');
  this.executeRuleTest(mml, 'x cubed plus 6 x squared minus x equals 30',
                       'sbrief');
};


/**
 * Testing Rule 8.12, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_12_1 = function() {
  var mml = '<msup><mrow><msub><mi>x</mi><mi>a</mi></msub></mrow><mi>b</mi>' +
      '</msup>';
  this.executeRuleTest(mml, 'x Subscript a Baseline Superscript b', 'default');
  this.executeRuleTest(mml, 'x Sub a Base sup b', 'brief');
  this.executeRuleTest(mml, 'x Sub a Base sup b', 'sbrief');
};


/**
 * Testing Rule 8.12, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_12_2 = function() {
  var mml = '<msub><mrow><msup><mi>x</mi><mi>b</mi></msup></mrow><mi>a</mi>' +
      '</msub>';
  this.executeRuleTest(mml, 'x Superscript b Baseline Subscript a', 'default');
  this.executeRuleTest(mml, 'x sup b Base Sub a', 'brief');
  this.executeRuleTest(mml, 'x sup b Base Sub a', 'sbrief');
};


/**
 * Testing Rule 8.1, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_1_2 = function() {
  var mml = '<mrow><mfrac><mrow><msup><mi>d</mi><mn>2</mn></msup><mi>y</mi>' +
      '</mrow><mrow><mi>d</mi><msup><mi>x</mi><mn>2</mn></msup></mrow>' +
      '</mfrac><mo>+</mo><mfenced separators="" open="(" close=")">' +
      '<mi>a</mi><msup><mi>x</mi><mn>2</mn></msup><mo>+</mo><mi>b</mi>' +
      '<mi>x</mi><mo>+</mo><mi>c</mi></mfenced><mi>y</mi><mo>=</mo>' +
      '<mn>0</mn></mrow>';
  this.executeRuleTest(mml, 'StartFraction d squared y Over d x squared' +
                       ' EndFraction plus left-parenthesis a x squared plus' +
                       ' b x plus c right-parenthesis y equals 0', 'default');
  this.executeRuleTest(mml, 'StartFrac d squared y Over d x squared EndFrac' +
                       ' plus left-pren a x squared plus b x plus c' +
                       ' right-pren y equals 0', 'brief');
  this.executeRuleTest(mml, 'Frac d squared y Over d x squared EndFrac plus' +
                       ' L pren a x squared plus b x plus c R pren y' +
                       ' equals 0', 'sbrief');
};


/**
 * Testing Rule 8.13, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_13_1 = function() {
  var mml = '<mrow><msup><mo form="prefix">log</mo><mn>4</mn></msup><msup>' +
      '<mrow/><mi>b</mi></msup><mi>x</mi></mrow>';
  this.executeRuleTest(mml, 'log Superscript 4 Superscript b Baseline x',
                       'default');
  this.executeRuleTest(mml, 'log sup 4 sup b Base x', 'brief');
  this.executeRuleTest(mml, 'log sup 4 sup b Base x', 'sbrief');
};


/**
 * Testing Rule 8.13, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_13_2 = function() {
  var mml = '<mrow><msub><mi>T</mi><mi>n</mi></msub><msub><mrow/><mi>a</mi>' +
      '</msub><mi>y</mi></mrow>';
  this.executeRuleTest(mml, 'upper t Subscript n Subscript a Baseline y',
                       'default');
  this.executeRuleTest(mml, 'upper t Sub n Sub a Base y', 'brief');
  this.executeRuleTest(mml, 'upper t Sub n Sub a Base y', 'sbrief');
};


/**
 * Testing Rule 8.2, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_2_1 = function() {
  var mml = '<msup><mi>x</mi><mfrac><mn>1</mn><mn>2</mn></mfrac></msup>';
  this.executeRuleTest(mml, 'x Superscript one-half', 'default');
  this.executeRuleTest(mml, 'x sup one-half', 'brief');
  this.executeRuleTest(mml, 'x sup one-half', 'sbrief');
};


/**
 * Testing Rule 8.2, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_2_2 = function() {
  var mml = '<msub><mi>x</mi><mi>n</mi></msub>';
  this.executeRuleTest(mml, 'x Subscript n', 'default');
  this.executeRuleTest(mml, 'x Sub n', 'brief');
  this.executeRuleTest(mml, 'x Sub n', 'sbrief');
};


/**
 * Testing Rule 8.2, Example 3.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_2_3 = function() {
  var mml = '<msup><mi>x</mi><mi>a</mi></msup>';
  this.executeRuleTest(mml, 'x Superscript a', 'default');
  this.executeRuleTest(mml, 'x sup a', 'brief');
  this.executeRuleTest(mml, 'x sup a', 'sbrief');
};


/**
 * Testing Rule 8.3, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_3_1 = function() {
  var mml = '<msup><mi>x</mi><mrow><mi>m</mi><mo>+</mo><mi>n</mi></mrow>' +
      '</msup>';
  this.executeRuleTest(mml, 'x Superscript m plus n', 'default');
  this.executeRuleTest(mml, 'x sup m plus n', 'brief');
  this.executeRuleTest(mml, 'x sup m plus n', 'sbrief');
};


/**
 * Testing Rule 8.3, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_3_2 = function() {
  var mml = '<mrow><msub><mi>T</mi><mrow><mi>n</mi><mo>-</mo><mn>1</mn>' +
      '</mrow></msub><mo>+</mo><mn>5</mn><mo>=</mo><mn>0</mn></mrow>';
  this.executeRuleTest(mml, 'upper t Subscript n minus 1 Baseline plus 5' +
                       ' equals 0', 'default');
  this.executeRuleTest(mml, 'upper t Sub n minus 1 Base plus 5 equals 0',
                       'brief');
  this.executeRuleTest(mml, 'upper t Sub n minus 1 Base plus 5 equals 0',
                       'sbrief');
};


/**
 * Testing Rule 8.3, Example 3.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_3_3 = function() {
  var mml = '<mrow><msup><mi>x</mi><mrow><mi>m</mi><mo>+</mo><mi>n</mi>' +
      '</mrow></msup><mo>=</mo><msup><mi>x</mi><mi>m</mi></msup><msup>' +
      '<mi>x</mi><mi>n</mi></msup></mrow>';
  this.executeRuleTest(mml, 'x Superscript m plus n Baseline equals x' +
                       ' Superscript m Baseline x Superscript n', 'default');
  this.executeRuleTest(mml, 'x sup m plus n Base equals x sup m Base x sup n',
                       'brief');
  this.executeRuleTest(mml, 'x sup m plus n Base equals x sup m Base x sup n',
                       'sbrief');
};


/**
 * Testing Rule 8.4, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_4_1 = function() {
  var mml = '<msup><mi>x</mi><mrow><msub><mi>a</mi><mi>n</mi></msub>' +
      '<mo>+</mo><msub><mi>a</mi><mrow><mi>n</mi><mo>-</mo><mn>1</mn>' +
      '</mrow></msub></mrow></msup>';
  this.executeRuleTest(mml, 'x Superscript a Super Subscript n Superscript' +
                       ' plus a Super Subscript n minus 1', 'default');
  this.executeRuleTest(mml, 'x sup a sup Sub n sup plus a sup Sub n minus' +
                       ' 1', 'brief');
  this.executeRuleTest(mml, 'x sup a sup Sub n sup plus a sup Sub n minus' +
                       ' 1', 'sbrief');
};


/**
 * Testing Rule 8.4, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_4_2 = function() {
  var mml = '<msup><mi>x</mi><msub><mi>a</mi><mi>b</mi></msub></msup>';
  this.executeRuleTest(mml, 'x Superscript a Super Subscript b', 'default');
  this.executeRuleTest(mml, 'x sup a sup Sub b', 'brief');
  this.executeRuleTest(mml, 'x sup a sup Sub b', 'sbrief');
};


/**
 * Testing Rule 8.4, Example 3.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_4_3 = function() {
  var mml = '<msub><mi>x</mi><msup><mi>a</mi><mi>b</mi></msup></msub>';
  this.executeRuleTest(mml, 'x Subscript a Sub Superscript b', 'default');
  this.executeRuleTest(mml, 'x Sub a Sub sup b', 'brief');
  this.executeRuleTest(mml, 'x Sub a Sub sup b', 'sbrief');
};


/**
 * Testing Rule 8.4, Example 4.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_4_4 = function() {
  var mml = '<mrow><msup><mi>y</mi><msup><mi>a</mi><msub><mi>b</mi>' +
      '<mi>c</mi></msub></msup></msup><mo>≠</mo><msup><mi>y</mi><mrow>' +
      '<msup><mi>a</mi><mi>b</mi></msup><mi>c</mi></mrow></msup></mrow>';
  this.executeRuleTest(mml, 'y Superscript a Super Superscript b Super super' +
                       ' Subscript c Baseline not-equals y Superscript a' +
                       ' Super Superscript b Superscript c', 'default');
  this.executeRuleTest(mml, 'y sup a sup sup b sup sup Sub c Base not-equals' +
                       ' y sup a sup sup b sup c', 'brief');
  this.executeRuleTest(mml, 'y sup a sup sup b sup sup Sub c Base not-equals' +
                       ' y sup a sup sup b sup c', 'sbrief');
};


/**
 * Testing Rule 8.4, Example 5.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_4_5 = function() {
  var mml = '<msup><mi>y</mi><msup><mi>a</mi><mrow><msub><mrow/><mi>c</mi>' +
      '</msub><mi>b</mi></mrow></msup></msup>';
  this.executeRuleTest(mml, 'y Superscript a Super super Subscript c super' +
                       ' Superscript b', 'default');
  this.executeRuleTest(mml, 'y sup a sup sup Sub c sup sup b', 'brief');
  this.executeRuleTest(mml, 'y sup a sup sup Sub c sup sup b', 'sbrief');
};


/**
 * Testing Rule 8.4, Example 6.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_4_6 = function() {
  var mml = '<msup><mi>x</mi><msup><mi>a</mi><mi>b</mi></msup></msup>';
  this.executeRuleTest(mml, 'x Superscript a Super Superscript b', 'default');
  this.executeRuleTest(mml, 'x sup a sup sup b', 'brief');
  this.executeRuleTest(mml, 'x sup a sup sup b', 'sbrief');
};


/**
 * Testing Rule 8.4, Example 7.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_4_7 = function() {
  var mml = '<msub><mi>x</mi><msub><mi>a</mi><mi>b</mi></msub></msub>';
  this.executeRuleTest(mml, 'x Subscript a Sub Subscript b', 'default');
  this.executeRuleTest(mml, 'x Sub a Sub sub b', 'brief');
  this.executeRuleTest(mml, 'x Sub a Sub sub b', 'sbrief');
};


/**
 * Testing Rule 8.4, Example 8.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_4_8 = function() {
  var mml = '<msup><mi>T</mi><mfenced separators="" open="(" close=")">' +
      '<msup><mi>x</mi><mi>a</mi></msup><mo>+</mo><msup><mi>y</mi>' +
      '<mi>b</mi></msup></mfenced></msup>';
  this.executeRuleTest(mml, 'upper t Superscript left-parenthesis x super' +
                       ' Superscript a Superscript plus y Super Superscript' +
                       ' b Superscript right-parenthesis', 'default');
  this.executeRuleTest(mml, 'upper t sup left-pren x sup sup a sup plus y' +
                       ' sup sup b sup right-pren', 'brief');
  this.executeRuleTest(mml, 'upper t sup L pren x sup sup a sup plus y sup' +
                       ' sup b sup R pren', 'sbrief');
};


/**
 * Testing Rule 8.5, Example 10.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_5_10 = function() {
  var mml = '<mrow><mo form="prefix">ln</mo><mi>x</mi><mo>=</mo><msubsup>' +
      '<mo>∫</mo><mn>1</mn><mi>x</mi></msubsup><mfrac><mrow><mi>d</mi>' +
      '<mi>t</mi></mrow><mi>t</mi></mfrac></mrow>';
  this.executeRuleTest(mml, 'l n x equals integral Subscript 1 Superscript x' +
                       ' Baseline StartFraction d t Over t EndFraction',
                       'default');
  this.executeRuleTest(mml, 'l n x equals integral Sub 1 sup x base' +
                       ' StartFrac d t Over t EndFrac', 'brief');
  this.executeRuleTest(mml, 'l n x equals integral Sub 1 sup x Base Frac d t' +
                       ' Over t EndFrac', 'sbrief');
};


/**
 * Testing Rule 8.5, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_5_1 = function() {
  var mml = '<msub><mi>x</mi><mn>1</mn></msub>';
  this.executeRuleTest(mml, 'x 1', 'default');
  this.executeRuleTest(mml, 'x 1', 'brief');
  this.executeRuleTest(mml, 'x 1', 'sbrief');
};


/**
 * Testing Rule 8.5, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_5_2 = function() {
  var mml = '<msub><mi>x</mi><mrow><mo>-</mo><mn>1</mn></mrow></msub>';
  this.executeRuleTest(mml, 'x Subscript negative 1', 'default');
  this.executeRuleTest(mml, 'x Sub negative 1', 'brief');
  this.executeRuleTest(mml, 'x Sub negative 1', 'sbrief');
};


/**
 * Testing Rule 8.5, Example 3.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_5_3 = function() {
  var mml = '<msub><mi>x</mi><mrow><mn>10</mn><mo>,</mo><mn>000</mn></mrow>' +
      '</msub>';
  this.executeRuleTest(mml, 'x 10,000', 'default');
  this.executeRuleTest(mml, 'x 10,000', 'brief');
  this.executeRuleTest(mml, 'x 10,000', 'sbrief');
};


/**
 * Testing Rule 8.5, Example 4.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_5_4 = function() {
  var mml = '<msub><mi>x</mi><mrow><mn>1</mn><mo>.</mo><mn>3</mn></mrow>' +
      '</msub>';
  this.executeRuleTest(mml, 'x 1.3', 'default');
  this.executeRuleTest(mml, 'x 1.3', 'brief');
  this.executeRuleTest(mml, 'x 1.3', 'sbrief');
};


/**
 * Testing Rule 8.5, Example 5.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_5_5 = function() {
  var mml = '<mrow><mn>4</mn><mi>F</mi><mi>e</mi><mo>+</mo><mn>3</mn><msub>' +
      '<mi>O</mi><mn>2</mn></msub><mo>→</mo><mn>2</mn><mi>F</mi><msub>' +
      '<mi>e</mi><mn>2</mn></msub><msub><mn>0</mn><mn>3</mn></msub></mrow>';
  this.executeRuleTest(mml, '4 upper f e plus 3 upper o 2 right-arrow 2' +
                       ' upper f e 2 upper o 3', 'default');
  this.executeRuleTest(mml, '4 upper f e plus 3 upper o 2 right-arrow 2' +
                       ' upper f e 2 upper o 3', 'brief');
  this.executeRuleTest(mml, '4 upper f e plus 3 upper o 2 r arrow 2 upper f' +
                       ' e 2 upper o 3', 'sbrief');
};


/**
 * Testing Rule 8.5, Example 6.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_5_6 = function() {
  var mml = '<msub><mi>a</mi><mrow><mn>2</mn><mo>,</mo><mn>3</mn></mrow>' +
      '</msub>';
  this.executeRuleTest(mml, 'a Subscript 2 comma 3', 'default');
  this.executeRuleTest(mml, 'a Sub 2 comma 3', 'brief');
  this.executeRuleTest(mml, 'a Sub 2 comma 3', 'sbrief');
};


/**
 * Testing Rule 8.5, Example 7.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_5_7 = function() {
  var mml = '<msub><mi>T</mi><mrow><msub><mi>n</mi><mn>1</mn></msub>' +
      '<mo>+</mo><msub><mi>n</mi><mn>0</mn></msub></mrow></msub>';
  this.executeRuleTest(mml, 'upper t Subscript n 1 plus n 0', 'default');
  this.executeRuleTest(mml, 'upper t Sub n 1 plus n 0', 'brief');
  this.executeRuleTest(mml, 'upper t Sub n 1 plus n 0', 'sbrief');
};


/**
 * Testing Rule 8.5, Example 8.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_5_8 = function() {
  var mml = '<mrow><mi>l</mi><mi>o</mi><msub><mi>g</mi><mn>2</mn></msub>' +
      '<mrow><mo>(</mo><mi>x</mi><mo>)</mo></mrow><mo>=</mo><mfrac><mrow>' +
      '<msub><mo form="prefix">log</mo><mn>10</mn></msub><mrow><mo>(</mo>' +
      '<mi>X</mi><mo>)</mo></mrow></mrow><mrow><msub>' +
      '<mo form="prefix">log</mo><mn>10</mn></msub><mrow><mo>(</mo>' +
      '<mn>2</mn><mo>)</mo></mrow></mrow></mfrac></mrow>';
  this.executeRuleTest(mml, 'log Subscript 2 Baseline left-parenthesis x' +
                       ' right-parenthesis equals StartFraction log' +
                       ' Subscript 10 Baseline left-parenthesis x' +
                       ' right-parenthesis Over log Subscript 10 Baseline' +
                       ' left-parenthesis 2 right-parenthesis EndFraction',
                       'default');
  this.executeRuleTest(mml, 'log Sub 2 Base left-pren x right-pren equals' +
                       ' StartFrac log Sub 10 Base left-pren x right-pren' +
                       ' Over log Sub 10 Base left-pren 2 right-pren' +
                       ' EndFrac', 'brief');
  this.executeRuleTest(mml, 'log Sub 2 Base L pren x R pren equals Frac' +
                       ' log Sub 10 Base L pren x R pren Over log Sub 10' +
                       ' Base L pren 2 R pren EndFrac', 'sbrief');
};


/**
 * Testing Rule 8.5, Example 9.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_5_9 = function() {
  var mml = '<msub><mi>Φ</mi><mn>5</mn></msub>';
  this.executeRuleTest(mml, 'upper phi 5', 'default');
  this.executeRuleTest(mml, 'upper phi 5', 'brief');
  this.executeRuleTest(mml, 'upper phi 5', 'sbrief');
};


/**
 * Testing Rule 8.6, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_6_1 = function() {
  var mml = '<mrow><mi>$</mi><mi>n</mi><mn>2</mn><mo>=</mo><mn>2</mn>' +
      '<mo>*</mo><mi>$</mi><mi>n</mi><mo>+</mo><mn>1</mn><mo>;</mo></mrow>';
  this.executeRuleTest(mml, 'dollar-sign n Baseline 2 equals 2 asterisk' +
                       ' dollar-sign n plus 1 semicolon', 'default');
  this.executeRuleTest(mml, 'dollar-sign n Base 2 equals 2 asterisk' +
                       ' dollar-sign n plus 1 semicolon', 'brief');
  this.executeRuleTest(mml, 'dollar-sign n Base 2 equals 2 asterisk' +
                       ' dollar-sign n plus 1 semicolon', 'sbrief');
};


/**
 * Testing Rule 8.8, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_8_1 = function() {
  var mml = '<mmultiscripts><mi>x</mi><mrow><mi>e</mi><mi>f</mi></mrow>' +
      '<mrow><mi>g</mi><mi>h</mi></mrow><mprescripts/><mrow><mi>c</mi>' +
      '<mi>d</mi></mrow><mrow><mi>a</mi><mi>b</mi></mrow></mmultiscripts>';
  this.executeRuleTest(mml, 'Subscript c d Superscript a b Baseline x' +
                       ' Subscript e f Superscript g h', 'default');
  this.executeRuleTest(mml, 'sub c d sup a b Base x Sub e f sup g h', 'brief');
  this.executeRuleTest(mml, 'sub c d sup a b Base x Sub e f sup g h', 'sbrief');
};


/**
 * Testing Rule 8.8, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_8_2 = function() {
  var mml = '<msubsup><mi>T</mi><mrow><mi>n</mi><mo>-</mo><mn>1</mn></mrow>' +
      '<mn>2</mn></msubsup>';
  this.executeRuleTest(mml, 'upper t Subscript n minus 1 Superscript 2',
                       'default');
  this.executeRuleTest(mml, 'upper t Sub n minus 1 sup 2', 'brief');
  this.executeRuleTest(mml, 'upper t Sub n minus 1 sup 2', 'sbrief');
};


/**
 * Testing Rule 8.9, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_9_1 = function() {
  var mml = '<msup><mi>x</mi><mo>\'</mo></msup>';
  this.executeRuleTest(mml, 'x prime', 'default');
  this.executeRuleTest(mml, 'x prime', 'brief');
  this.executeRuleTest(mml, 'x prime', 'sbrief');
};


/**
 * Testing Rule 8.9, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_8_9_2 = function() {
  var mml = '<mrow><msup><mi>f</mi><mrow><mo>\'</mo><mo>\'</mo><mo>\'</mo>' +
      '</mrow></msup><mrow><mo>(</mo><mi>y</mi><mo>)</mo></mrow><mo>=</mo>' +
      '<mfrac><mrow><mi>d</mi><msup><mi>f</mi><mrow><mo>\'</mo><mo>\'</mo>' +
      '</mrow></msup><mrow><mo>(</mo><mi>y</mi><mo>)</mo></mrow></mrow>' +
      '<mrow><mi>d</mi><mi>y</mi></mrow></mfrac></mrow>';
  this.executeRuleTest(mml, 'f triple-prime left-parenthesis y' +
                       ' right-parenthesis equals StartFraction d f' +
                       ' double-prime left-parenthesis y right-parenthesis' +
                       ' Over d y EndFraction', 'default');
  this.executeRuleTest(mml, 'f triple-prime left-pren y right-pren equals' +
                       ' StartFrac d f double-prime left-pren y right-pren' +
                       ' Over d y EndFrac', 'brief');
  this.executeRuleTest(mml, 'f triple-prime L pren y R pren equals Frac d' +
                       ' f double-prime L pren y R pren Over d y EndFrac',
                       'sbrief');
};


/**
 * Testing Rule 9.1, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_9_1_1 = function() {
  var mml = '<msqrt><mn>2</mn></msqrt>';
  this.executeRuleTest(mml, 'StartRoot 2 EndRoot', 'default');
  this.executeRuleTest(mml, 'StartRoot 2 EndRoot', 'brief');
  this.executeRuleTest(mml, 'Root 2 EndRoot', 'sbrief');
};


/**
 * Testing Rule 9.1, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_9_1_2 = function() {
  var mml = '<msqrt><mrow><mi>m</mi><mo>+</mo><mi>n</mi></mrow></msqrt>';
  this.executeRuleTest(mml, 'StartRoot m plus n EndRoot', 'default');
  this.executeRuleTest(mml, 'StartRoot m plus n EndRoot', 'brief');
  this.executeRuleTest(mml, 'Root m plus n EndRoot', 'sbrief');
};


/**
 * Testing Rule 9.2, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_9_2_1 = function() {
  var mml = '<mRoot><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow><mrow>' +
      '<mi>m</mi><mo>+</mo><mi>n</mi></mrow></mRoot>';
  this.executeRuleTest(mml, 'Rootindex m plus n StartRoot x plus y EndRoot',
                       'default');
  this.executeRuleTest(mml, 'Rootindex m plus n StartRoot x plus y EndRoot',
                       'brief');
  this.executeRuleTest(mml, 'index m plus n Root x plus y EndRoot', 'sbrief');
};


/**
 * Testing Rule 9.2, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_9_2_2 = function() {
  var mml = '<mrow><mRoot><msup><mi>x</mi><mi>m</mi></msup><mi>n</mi>' +
      '</mRoot><mo>=</mo><msup><mfenced separators="" open="(" close=")">' +
      '<mRoot><mi>x</mi><mi>n</mi></mRoot></mfenced><mi>m</mi></msup>' +
      '<mo>=</mo><msup><mi>x</mi><mfrac><mi>m</mi><mi>n</mi></mfrac>' +
      '</msup><mo>,</mo><mi>x</mi><mo>></mo><mn>0</mn></mrow>';
  this.executeRuleTest(mml, 'Rootindex n StartRoot x Superscript m Baseline' +
                       ' EndRoot equals left-parenthesis Rootindex n' +
                       ' StartRoot x EndRoot right-parenthesis Superscript m' +
                       ' Baseline equals x Superscript StartFraction m Over' +
                       ' n EndFraction Baseline comma x greater-than 0',
                       'default');
  this.executeRuleTest(mml, 'Rootindex n StartRoot x sup m Base EndRoot' +
                       ' equals left-pren Rootindex n StartRoot x EndRoot' +
                       ' right-pren sup m Base equals x sup StartFrac m' +
                       ' Over n EndFrac Base comma x greater-than 0', 'brief');
  this.executeRuleTest(mml, 'index n Root x sup m Base EndRoot equals L' +
                       ' pren index n Root x EndRoot R pren sup m base' +
                       ' equals x sup Frac m Over n EndFrac Base comma x' +
                       ' greater-than 0', 'sbrief');
};


/**
 * Testing Rule 9.2, Example 3.
 */
sre.MathspeakRuleTest.prototype.untestSample_9_2_3 = function() {
  var mml = '<mrow><mRoot><mi>x</mi><mn>3</mn></mRoot><mo>=</mo><msup>' +
      '<mi>x</mi><mfrac><mn>1</mn><mn>3</mn></mfrac></msup></mrow>';
  this.executeRuleTest(mml, 'Rootindex 3 StartRoot x EndRoot equals x' +
                       ' Superscript one-third', 'default');
  this.executeRuleTest(mml, 'Rootindex 3 StartRoot x EndRoot equals x sup' +
                       ' one-third', 'brief');
  this.executeRuleTest(mml, 'index 3 Root x EndRoot equals x sup one-third',
                       'sbrief');
};


/**
 * Testing Rule 9.3, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_9_3_1 = function() {
  var mml = '<msqrt><mrow><msqrt><mrow><mi>x</mi><mo>+</mo><mn>1</mn></mrow>' +
      '</msqrt><mo>+</mo><msqrt><mrow><mi>y</mi><mo>+</mo><mn>1</mn>' +
      '</mrow></msqrt></mrow></msqrt>';
  this.executeRuleTest(mml, 'NestedStartRoot StartRoot x plus 1 EndRoot plus' +
                       ' StartRoot y plus 1 EndRoot NestedEndRoot', 'default');
  this.executeRuleTest(mml, 'NestStartRoot StartRoot x plus 1 EndRoot plus' +
                       ' StartRoot y plus 1 EndRoot NestEndRoot', 'brief');
  this.executeRuleTest(mml, 'NestRoot Root x plus 1 EndRoot plus Root y plus' +
                       ' 1 EndRoot NestEndRoot', 'sbrief');
};


/**
 * Testing Rule 9.3, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_9_3_2 = function() {
  var mml = '<mrow><mRoot><mRoot><mi>x</mi><mi>m</mi></mRoot><mi>n</mi>' +
      '</mRoot><mo>=</mo><mRoot><mRoot><mi>x</mi><mi>n</mi></mRoot>' +
      '<mi>m</mi></mRoot></mrow>';
  this.executeRuleTest(mml, 'NestedRootindex n NestedStartRoot Rootindex m' +
                       ' StartRoot x EndRoot NestedEndRoot equals' +
                       ' NestedRootindex m NestedStartRoot Rootindex n' +
                       ' StartRoot x EndRoot NestedEndRoot', 'default');
  this.executeRuleTest(mml, 'NestRootindex n NestStartRoot Rootindex m' +
                       ' StartRoot x EndRoot NestEndRoot equals' +
                       ' NestRootindex m NestStartRoot Rootindex n StartRoot' +
                       ' x EndRoot NestEndRoot', 'brief');
  this.executeRuleTest(mml, 'Nestindex n NestRoot index m Root x EndRoot' +
                       ' NestEndRoot equals Nestindex m NestRoot index n' +
                       ' Root x EndRoot NestEndRoot', 'sbrief');
};


/**
 * Testing Rule 9.3, Example 3.
 */
sre.MathspeakRuleTest.prototype.untestSample_9_3_3 = function() {
  var mml = '<mrow><msup><mi>x</mi><mrow><mi>e</mi><mo>-</mo><mn>2</mn>' +
      '</mrow></msup><mo>=</mo><msqrt><mrow><mi>x</mi><mRoot><mrow>' +
      '<mi>x</mi><mRoot><mrow><mi>x</mi><mRoot><mrow><mi>x</mi>' +
      '<mo>&#x2026;</mo></mrow><mn>5</mn></mRoot></mrow><mn>4</mn></mRoot>' +
      '</mrow><mn>3</mn></mRoot></mrow></msqrt><mo>,</mo><mi>x</mi>' +
      '<mo>∈</mo><mi>ℝ</mi></mrow>';
  this.executeRuleTest(mml, 'x Superscript e minus 2 Baseline equals' +
                       ' Nested3StartRoot x NestedtwiceRootindex 3' +
                       ' NestedtwiceStartRoot x NestedRootindex 4' +
                       ' NestedStartRoot x Rootindex 5 StartRoot x ellipsis' +
                       ' EndRoot NestedEndRoot NestedtwiceEndRoot' +
                       ' Nested3EndRoot comma x element-of double-struck' +
                       ' upper r', 'default');
  this.executeRuleTest(mml, 'x sup e minus 2 Base equals Nest3StartRoot x' +
                       ' NestTwiceRootindex 3 NestTwiceStartRoot x' +
                       ' NestRootindex 4 NestStartRoot x Rootindex 5' +
                       ' StartRoot x ellipsis EndRoot NestEndRoot' +
                       ' NestTwiceEndRoot Nest3EndRoot comma x element-of' +
                       ' double-struck upper r', 'brief');
  this.executeRuleTest(mml, 'x sup e minus 2 Base equals Nest3Root x' +
                       ' NestTwiceindex 3 NestTwiceRoot x Nestindex 4' +
                       ' NestRoot x index 5 Root x ellipsis EndRoot' +
                       ' NestEndRoot NestTwiceEndRoot Nest3EndRoot comma x' +
                       ' element-of double-struck upper r', 'sbrief');
};


/**
 * Testing Rule 9.3, Example 4.
 */
sre.MathspeakRuleTest.prototype.untestSample_9_3_4 = function() {
  var mml = '<mrow><mfrac><mn>2</mn><mi>π</mi></mfrac><mo>=</mo><mfrac>' +
      '<mrow><msqrt><mn>2</mn></msqrt><mn>2</mn></mrow><mn>2</mn></mfrac>' +
      '<mfrac><msqrt><mrow><mn>2</mn><mo>+</mo><msqrt><mn>2</mn></msqrt>' +
      '</mrow></msqrt><mn>2</mn></mfrac><mfrac><msqrt><mrow><mn>2</mn>' +
      '<mo>+</mo><msqrt><mrow><mn>2</mn><mo>+</mo><msqrt><mn>2</mn>' +
      '</msqrt></mrow></msqrt></mrow></msqrt><mn>2</mn></mfrac>' +
      '<mo>&#x2026;</mo></mrow>';
  this.executeRuleTest(mml, 'StartFraction 2 Over pi EndFraction equals' +
                       ' StartFraction StartRoot 2 EndRoot Over 2' +
                       ' EndFraction StartFraction NestedStartRoot 2 plus' +
                       ' StartRoot 2 EndRoot NestedEndRoot Over 2' +
                       ' EndFraction StartFraction NestedtwiceStartRoot 2' +
                       ' plus NestedStartRoot 2 plus StartRoot 2 EndRoot' +
                       ' NestedEndRoot NestedtwiceEndRoot Over 2 EndFraction' +
                       ' ellipsis', 'default');
  this.executeRuleTest(mml, 'StartFrac 2 Over pi EndFrac equals StartFrac' +
                       ' StartRoot 2 EndRoot Over 2 EndFrac StartFrac' +
                       ' NestStartRoot 2 plus StartRoot 2 EndRoot' +
                       ' NestEndRoot Over 2 EndFrac StartFrac' +
                       ' NestTwiceStartRoot 2 plus NestStartRoot 2 plus' +
                       ' StartRoot 2 EndRoot NestEndRoot NestTwiceEndRoot' +
                       ' Over 2 EndFrac ellipsis', 'brief');
  this.executeRuleTest(mml, 'Frac 2 Over pi EndFrac equals Frac Root 2' +
                       ' EndRoot Over 2 EndFrac Frac NestRoot 2 plus Root 2' +
                       ' EndRoot NestEndRoot Over 2 EndFrac Frac' +
                       ' NestTwiceRoot 2 plus NestRoot 2 plus Root 2 EndRoot' +
                       ' NestEndRoot NestTwiceEndRoot Over 2 EndFrac' +
                       ' ellipsis', 'sbrief');
};


/**
 * Testing Rule 10.1, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_10_1_1 = function() {
  var mml = '<mrow><mfrac><mrow><mn>5</mn><mi>x</mi>' +
      '<menclose notation="updiagonalstrike"><mi>y</mi></menclose></mrow>' +
      '<mrow><mn>2</mn><menclose notation="updiagonalstrike"><mi>y</mi>' +
      '</menclose></mrow></mfrac><mo>=</mo><mfrac><mn>5</mn><mn>2</mn>' +
      '</mfrac><mi>x</mi></mrow>';
  this.executeRuleTest(mml, 'StartFraction 5 x crossout y Endcrossout Over 2' +
                       ' crossout y Endcrossout EndFraction equals' +
                       ' five-halves x', 'default');
  this.executeRuleTest(mml, 'StartFrac 5 x crossout y Endcrossout Over 2' +
                       ' crossout y Endcrossout EndFrac equals five-halves' +
                       ' x', 'brief');
  this.executeRuleTest(mml, 'Frac 5 x crossout y Endcrossout Over 2 crossout' +
                       ' y Endcrossout EndFrac equals five-halves x', 'sbrief');
};


/**
 * Testing Rule 10.2, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_10_2_1 = function() {
  var mml = '<mrow><mfrac><mn>12</mn><mn>18</mn></mfrac><mo>=</mo><mfrac>' +
      '<mover><menclose notation="updiagonalstrike"><mn>12</mn></menclose>' +
      '<mn>2</mn></mover><munder><menclose notation="updiagonalstrike">' +
      '<mn>18</mn></menclose><mn>3</mn></munder></mfrac><mo>=</mo><mfrac>' +
      '<mn>2</mn><mn>3</mn></mfrac></mrow>';
  this.executeRuleTest(mml, 'StartFraction 12 Over 18 EndFraction equals' +
                       ' StartFraction crossout 12 with 2 Endcrossout Over' +
                       ' crossout 18 with 3 Endcrossout EndFraction equals' +
                       ' two-thirds', 'default');
  this.executeRuleTest(mml, 'StartFrac 12 Over 18 EndFrac equals StartFrac' +
                       ' crossout 12 with 2 Endcrossout Over crossout 18' +
                       ' with 3 Endcrossout EndFrac equals two-thirds',
                       'brief');
  this.executeRuleTest(mml, 'Frac 12 Over 18 EndFrac equals Frac crossout 12' +
                       ' with 2 Endcrossout Over crossout 18 with 3' +
                       ' Endcrossout EndFrac equals two-thirds', 'sbrief');
};


/**
 * Testing Rule 11.1, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_11_1_1 = function() {
  var mml = '<mover accent="true"><mi>x</mi><mo>¨</mo></mover>';
  this.executeRuleTest(mml, 'ModifyingAbove x with two-dots', 'default');
  this.executeRuleTest(mml, 'ModAbove x with two-dots', 'brief');
  this.executeRuleTest(mml, 'ModAbove x with two-dots', 'sbrief');
};


/**
 * Testing Rule 11.1, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_11_1_2 = function() {
  var mml = '<mover accent="true"><mrow><mi>x</mi><mo>+</mo><mi>y</mi>' +
      '</mrow><mo>→</mo></mover>';
  this.executeRuleTest(mml, 'ModifyingAbove x plus y with right-arrow',
                       'default');
  this.executeRuleTest(mml, 'ModAbove x plus y with right-arrow', 'brief');
  this.executeRuleTest(mml, 'ModAbove x plus y with r arrow', 'sbrief');
};


/**
 * Testing Rule 11.1, Example 3.
 */
sre.MathspeakRuleTest.prototype.untestSample_11_1_3 = function() {
  var mml = '<mover accent="true"><mi>x</mi><mo>^</mo></mover>';
  this.executeRuleTest(mml, 'ModifyingAbove x with caret', 'default');
  this.executeRuleTest(mml, 'ModAbove x with caret', 'brief');
  this.executeRuleTest(mml, 'ModAbove x with caret', 'sbrief');
};


/**
 * Testing Rule 11.2, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_11_2_1 = function() {
  var mml = '<munder accent="true"><mi>x</mi><mi>˙</mi></munder>';
  this.executeRuleTest(mml, 'ModifyingBelow x with dot', 'default');
  this.executeRuleTest(mml, 'ModBelow x with dot', 'brief');
  this.executeRuleTest(mml, 'ModBelow x with dot', 'sbrief');
};


/**
 * Testing Rule 11.3, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_11_3_1 = function() {
  var mml = '<mover accent="true"><mi>x</mi><mo>˜</mo></mover>';
  this.executeRuleTest(mml, 'x overtilde', 'default');
  this.executeRuleTest(mml, 'x overtilde', 'brief');
  this.executeRuleTest(mml, 'x overtilde', 'sbrief');
};


/**
 * Testing Rule 11.3, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_11_3_2 = function() {
  var mml = '<mover accent="true"><mi>x</mi><mo>¯</mo></mover>';
  this.executeRuleTest(mml, 'x overbar', 'default');
  this.executeRuleTest(mml, 'x overbar', 'brief');
  this.executeRuleTest(mml, 'x overbar', 'sbrief');
};


/**
 * Testing Rule 11.3, Example 3.
 */
sre.MathspeakRuleTest.prototype.untestSample_11_3_3 = function() {
  var mml = '<munder accentunder="true"><mi>y</mi><mo>˜</mo></munder>';
  this.executeRuleTest(mml, 'y undertilde', 'default');
  this.executeRuleTest(mml, 'y undertilde', 'brief');
  this.executeRuleTest(mml, 'y undertilde', 'sbrief');
};


/**
 * Testing Rule 11.4, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_11_4_1 = function() {
  var mml = '<mover accent="true"><mover accent="true"><mi>x</mi><mo>¯</mo>' +
      '</mover><mo>¯</mo></mover>';
  this.executeRuleTest(mml, 'x overbar overbar', 'default');
  this.executeRuleTest(mml, 'x overbar overbar', 'brief');
  this.executeRuleTest(mml, 'x overbar overbar', 'sbrief');
};


/**
 * Testing Rule 11.4, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_11_4_2 = function() {
  var mml = '<mover accent="true"><munder><mover accent="true"><munder>' +
      '<mi>y</mi><mo>̲</mo></munder><mo>¯</mo></mover><mo>̲</mo></munder>' +
      '<mo>¯</mo></mover>';
  this.executeRuleTest(mml, 'y overbar overbar underbar underbar', 'default');
  this.executeRuleTest(mml, 'y overbar overbar underbar underbar', 'brief');
  this.executeRuleTest(mml, 'y overbar overbar underbar underbar', 'sbrief');
};


/**
 * Testing Rule 11.6, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_11_6_1 = function() {
  var mml = '<munder accentunder="true"><munder><mrow><mi>a</mi><mo>+</mo>' +
      '<mi>b</mi></mrow><mo>̲</mo></munder><mo>*</mo></munder>';
  this.executeRuleTest(mml, 'ModifyingBelow below ModifyingBelow a plus b' +
                       ' with bar with asterisk', 'default');
  this.executeRuleTest(mml, 'ModBelow below ModBelow a plus b with bar with' +
                       ' asterisk', 'brief');
  this.executeRuleTest(mml, 'ModBelow below ModBelow a plus b with bar with' +
                       ' asterisk', 'sbrief');
};


/**
 * Testing Rule 11.6, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_11_6_2 = function() {
  var mml = '<munder accentunder="true"><munder accentunder="true">' +
      '<mover accent="true"><mover accent="true"><mrow><mi>a</mi>' +
      '<mo>+</mo><mi>b</mi></mrow><mo>→</mo></mover><mo>˙</mo></mover>' +
      '<mo>←</mo></munder><mo>˙</mo></munder>';
  this.executeRuleTest(mml, 'ModifyingAbove ModifyingBelow a plus b with' +
                       ' left-arrow with right-arrow Underscript dot' +
                       ' Overscript dot Endscripts', 'default');
  this.executeRuleTest(mml, 'ModAbove ModBelow a plus b with left-arrow with' +
                       ' right-arrow Underscript dot Overscript dot' +
                       ' Endscripts', 'brief');
  this.executeRuleTest(mml, 'ModAbove ModBelow a plus b with l arrow with r' +
                       ' arrow Underscript dot Overscript dot Endscripts',
                       'sbrief');
};


/**
 * Testing Rule 11.6, Example 3.
 */
sre.MathspeakRuleTest.prototype.untestSample_11_6_3 = function() {
  var mml = '<mover><mover accent="true"><mrow><mi>x</mi><mo>+</mo>' +
      '<mi>y</mi></mrow><mo>˜</mo></mover><mo>¯</mo></mover>';
  this.executeRuleTest(mml, 'ModifyingAbove above ModifyingAbove x plus y' +
                       ' with tilde with bar', 'default');
  this.executeRuleTest(mml, 'ModAbove above ModAbove x plus y with tilde' +
                       ' with bar', 'brief');
  this.executeRuleTest(mml, 'ModAbove above ModAbove x plus y with tilde' +
                       ' with bar', 'sbrief');
};


/**
 * Testing Rule 11.7, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_11_7_1 = function() {
  var mml = '<mrow><munderover><mo>∑</mo><mrow><mi>n</mi><mo>=</mo>' +
      '<mn>1</mn></mrow><mi>∞</mi></munderover><msub><mi>a</mi><mi>n</mi>' +
      '</msub></mrow>';
  this.executeRuleTest(mml, 'sigma-summation Underscript n equals 1' +
                       ' Overscript infinity Endscripts a Subscript' +
                       ' n', 'default');
  this.executeRuleTest(mml, 'sigma-summation Underscript n equals 1' +
                       ' Overscript infinity Endscripts a Sub n', 'brief');
  this.executeRuleTest(mml, 'sigma-summation Underscript n equals 1' +
                       ' Overscript infinity Endscripts a Sub n', 'sbrief');
};


/**
 * Testing Rule 11.8, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_11_8_1 = function() {
  var mml = '<mrow><mover><mstyle scriptlevel="2" displaystyle="false">' +
      '<mrow/></mstyle><mo>[</mo></mover><mtable><mtr><mtd><mrow>' +
      '<mi>a</mi><mo>=</mo><mn>5</mn></mrow></mtd></mtr><mtr><mtd><mrow>' +
      '<mi>b</mi><mo>=</mo><mn>3</mn></mrow></mtd></mtr></mtable><mrow>' +
      '<mo>]</mo></mrow><munder><mrow><mi>x</mi><mo>+</mo><mi>y</mi>' +
      '</mrow><mo>̲</mo></munder><mrow/></mrow>';
  this.executeRuleTest(mml, 'ModifyingBelow x plus y with bar Underscript a' +
                       ' equals 5 UnderUnderscript b equals 3 Endscripts',
                       'default');
  this.executeRuleTest(mml, 'ModBelow x plus y with bar Underscript a equals' +
                       ' 5 UnderUnderscript b equals 3 Endscripts', 'brief');
  this.executeRuleTest(mml, 'ModBelow x plus y with bar Underscript a equals' +
                       ' 5 UnderUnderscript b equals 3 Endscripts', 'sbrief');
};


/**
 * Testing Rule 11.8, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_11_8_2 = function() {
  var mml = '<mrow><mover><mover><mrow><mi>x</mi><mo>+</mo><mi>y</mi></mrow>' +
      '<mo>¯</mo></mover><mstyle scriptlevel="2" displaystyle="false">' +
      '<mtable><mtr><mtd><mrow><mi>m</mi><mo>=</mo><mn>2</mn></mrow></mtd>' +
      '</mtr><mtr><mtd><mrow><mi>n</mi><mo>=</mo><mn>1</mn></mrow></mtd>' +
      '</mtr></mtable></mstyle></mover><mrow/></mrow>';
  this.executeRuleTest(mml, 'ModifyingAbove x plus y with bar Overscript n' +
                       ' equals 1 OverOverscript m equals 2 Endscripts',
                       'default');
  this.executeRuleTest(mml, 'ModAbove x plus y with bar Overscript n equals' +
                       ' 1 OverOverscript m equals 2 Endscripts', 'brief');
  this.executeRuleTest(mml, 'ModAbove x plus y with bar Overscript n equals' +
                       ' 1 OverOverscript m equals 2 Endscripts', 'sbrief');
};


/**
 * Testing Rule 11.9, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_11_9_1 = function() {
  var mml = '<mrow><mfrac><mn>7</mn><mn>12</mn></mfrac><mo>=</mo><mo>.</mo>' +
      '<mn>58</mn><mover accent="true"><mn>3</mn><mo>˙</mo></mover>' +
      '<mover accent="true"><mn>3</mn><mo>˙</mo></mover>' +
      '<mover accent="true"><mn>3</mn><mo>˙</mo></mover></mrow>';
  this.executeRuleTest(mml, 'seven-twelfths equals .58 modifyingeachabove 3' +
                       ' 3 3 with dot', 'default');
  this.executeRuleTest(mml, 'seven-twelfths equals .58 modeachabove 3 3 3' +
                       ' with dot', 'brief');
  this.executeRuleTest(mml, 'seven-twelfths equals .58 modeachabove 3 3 3' +
                       ' with dot', 'sbrief');
};


/**
 * Testing Rule 12.1, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_12_1_1 = function() {
  var mml = '<mrow><msub><mo form="prefix">log</mo><mi>b</mi></msub>' +
      '<mi>x</mi></mrow>';
  this.executeRuleTest(mml, 'log Subscript b Baseline x', 'default');
  this.executeRuleTest(mml, 'log Sub b Base x', 'brief');
  this.executeRuleTest(mml, 'log Sub b Base x', 'sbrief');
};


/**
 * Testing Rule 12.1, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_12_1_2 = function() {
  var mml = '<mrow><mo form="prefix">cos</mo><mi>y</mi></mrow>';
  this.executeRuleTest(mml, 'cosine y', 'default');
  this.executeRuleTest(mml, 'cosine y', 'brief');
  this.executeRuleTest(mml, 'cosine y', 'sbrief');
};


/**
 * Testing Rule 12.1, Example 3.
 */
sre.MathspeakRuleTest.prototype.untestSample_12_1_3 = function() {
  var mml = '<mrow><mo form="prefix">sin</mo><mi>x</mi></mrow>';
  this.executeRuleTest(mml, 'sine x', 'default');
  this.executeRuleTest(mml, 'sine x', 'brief');
  this.executeRuleTest(mml, 'sine x', 'sbrief');
};


/**
 * Testing Rule 13.1, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_13_1_1 = function() {
  var mml = '<mrow><mfrac><mrow><mn>60</mn>' +
      '<menclose notation="updiagonalstrike"><mtext>mi</mtext></menclose>' +
      '</mrow><menclose notation="updiagonalstrike"><mtext>hr</mtext>' +
      '</menclose></mfrac><mo>×</mo><mfrac><mrow><mn>5</mn><mo>,</mo>' +
      '<mn>280</mn><mtext>ft</mtext></mrow><mrow><mn>1</mn>' +
      '<menclose notation="updiagonalstrike"><mtext>mi</mtext></menclose>' +
      '</mrow></mfrac><mo>×</mo><mfrac><mrow><mn>1</mn>' +
      '<menclose notation="updiagonalstrike"><mtext>mi</mtext></menclose>' +
      '</mrow><mrow><mn>60</mn><mtext>min</mtext></mrow></mfrac><mo>=</mo>' +
      '<mfrac><mrow><mn>5</mn><mo>,</mo><mn>280</mn><mtext>ft</mtext>' +
      '</mrow><mtext>min</mtext></mfrac></mrow>';
  this.executeRuleTest(mml, 'Startfraction 60 crossout miles Endcrossout' +
                       ' Over crossout hours Endcrossout Endfraction times' +
                       ' Startfraction 5,280 feet Over 1 crossout miles' +
                       ' Endcrossout Endfraction times Startfraction 1' +
                       ' crossout hours Endcrossout Over 60 minutes' +
                       ' Endfraction equals Startfraction 5,280 feet Over' +
                       ' minutes Endfraction', 'default');
  this.executeRuleTest(mml, 'Startfrac 60 crossout miles Endcrossout Over' +
                       ' crossout hours Endcrossout Endfrac times Startfrac' +
                       ' 5,280 feet Over 1 crossout miles Endcrossout' +
                       ' Endfrac times Startfrac 1 crossout hours' +
                       ' Endcrossout Over 60 minutes Endfrac equals' +
                       ' Startfrac 5,280 feet Over minutes Endfrac', 'brief');
  this.executeRuleTest(mml, 'frac 60 crossout miles Endcrossout Over' +
                       ' crossout hours Endcrossout Endfrac times frac 5,280' +
                       ' feet Over 1 crossout miles Endcrossout Endfrac' +
                       ' times frac 1 crossout hours Endcrossout Over 60' +
                       ' minutes Endfrac equals frac 5,280 feet Over minutes' +
                       ' Endfrac', 'sbrief');
};


/**
 * Testing Rule 13.1, Example 2.
 */
sre.MathspeakRuleTest.prototype.untestSample_13_1_2 = function() {
  var mml = '<mrow><mn>1</mn><mtext>J</mtext><mo>=</mo><mn>1</mn>' +
      '<mtext>kg</mtext><mo>·</mo><msup><mtext>m</mtext><mn>2</mn></msup>' +
      '<mo>·</mo><msup><mtext>s</mtext><mrow><mo>-</mo><mn>2</mn></mrow>' +
      '</msup><mi>x</mi></mrow>';
  this.executeRuleTest(mml, '1 joules equals 1 kilograms dot meters squared' +
                       ' dot seconds Superscript minus 2', 'default');
  this.executeRuleTest(mml, '1 joules equals 1 kilograms dot meters squared' +
                       ' dot seconds sup minus 2', 'brief');
  this.executeRuleTest(mml, '1 joules equals 1 kilograms dot meters squared' +
                       ' dot seconds sup minus 2', 'sbrief');
};


/**
 * Testing Rule 13.1, Example 3.
 */
sre.MathspeakRuleTest.prototype.untestSample_13_1_3 = function() {
  var mml = '<mrow><mi>m</mi><mtext>m</mtext><mo>=</mo><mn>100</mn>' +
      '<mi>m</mi><mtext>cm</mtext><mo>=</mo><mfrac><mi>m</mi><mrow>' +
      '<mn>1</mn><mo>,</mo><mn>000</mn></mrow></mfrac><mtext>km</mtext>' +
      '</mrow>';
  this.executeRuleTest(mml, 'm meters equals 100 m centimeters equals' +
                       ' Startfraction m Over 1,000 Endfraction kilometers',
                       'default');
  this.executeRuleTest(mml, 'm meters equals 100 m centimeters equals' +
                       ' Startfrac m Over 1,000 Endfrac kilometers', 'brief');
  this.executeRuleTest(mml, 'm meters equals 100 m centimeters equals frac m' +
                       ' Over 1,000 Endfrac kilometers', 'sbrief');
};


/**
 * Testing Rule 13.1, Example 4.
 */
sre.MathspeakRuleTest.prototype.untestSample_13_1_4 = function() {
  var mml = '<mrow><mn>1</mn><mtext>in</mtext><mo>=</mo><mn>2</mn><mo>,</mo>' +
      '<mn>54</mn><mtext>cm</mtext></mrow>';
  this.executeRuleTest(mml, '1 miles almost-equals 1.6 kilometers', 'default');
  this.executeRuleTest(mml, '1 miles almost-equals 1.6 kilometers', 'brief');
  this.executeRuleTest(mml, '1 miles almost-equals 1.6 kilometers', 'sbrief');
};


/**
 * Testing Rule 14.1, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_14_1_1 = function() {
  var mml = '<mtable><mtr><mtd><msub><mi>H</mi><mn>2</mn></msub></mtd><mtd>' +
      '<mo>+</mo></mtd><mtd><msub><mi>F</mi><mn>2</mn></msub></mtd><mtd>' +
      '<mo>→</mo></mtd><mtd><mrow><mn>2</mn><mi>H</mi><mi>F</mi></mrow>' +
      '</mtd></mtr><mtr><mtd><mtext>hydorgen</mtext></mtd><mtd/><mtd>' +
      '<mtext>flourine</mtext></mtd><mtd/><mtd><mrow>' +
      '<mtext>hydrogen</mtext><mspace width="4.pt"/>' +
      '<mtext>flouride</mtext></mrow></mtd></mtr></mtable>';
  this.executeRuleTest(mml, 'Startlayout 1st Row  1st Column upper h 2 2nd' +
                       ' Column plus 3rd Column upper f 2 4th Column' +
                       ' right-arrow 5th Column 2 upper h upper f 2nd row' +
                       ' 1st Column hydrogen 2nd Column blank 3rd Column' +
                       ' flourine 4th Column blank 5th Column hydrogen' +
                       ' fluoride Endlayout', 'default');
  this.executeRuleTest(mml, 'Startlayout 1st Row 1st Column upper h 2 2nd' +
                       ' Column plus 3rd Column upper f 2 4th Column' +
                       ' right-arrow 5th Column 2 upper h upper f 2nd row' +
                       ' 1st Column hydrogen 2nd Column blank 3rd Column' +
                       ' flourine 4th Column blank 5th Column hydrogen' +
                       ' fluoride Endlayout', 'brief');
  this.executeRuleTest(mml, 'layout 1st Row 1st Column upper h 2 2nd Column' +
                       ' plus 3rd Column upper f 2 4th Column r arrow 5th' +
                       ' Column 2 upper h upper f 2nd Row 1st Column' +
                       ' hydrogen 2nd Column blank 3rd Column flourine 4th' +
                       ' Column blank 5th Column hydrogen fluoride' +
                       ' Endlayout', 'sbrief');
};


/**
 * Testing Rule 14.3, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_14_3_1 = function() {
  var mml = '<mrow><mi>x</mi><mo>=</mo>' +
      '<mfenced separators="" open="{" close=""><mtable><mtr><mtd><mrow>' +
      '<mi>y</mi><mo>&lt;</mo><mn>0</mn></mrow></mtd><mtd><mn>0</mn></mtd>' +
      '</mtr><mtr><mtd><mrow><mi>y</mi><mo>≥</mo><mn>0</mn></mrow></mtd>' +
      '<mtd><mrow><mn>2</mn><mi>y</mi></mrow></mtd></mtr></mtable>' +
      '</mfenced></mrow>';
  this.executeRuleTest(mml, 'x equals Startlayout enlarged left-brace 1st' +
                       ' Row 1st Column y less-than 0 2nd Column 0 2nd row' +
                       ' 1st Column y greater-than-or-equal-to 0 2nd Column' +
                       ' 2 y Endlayout', 'default');
  this.executeRuleTest(mml, 'x equals Startlayout enlarged left-brace 1st' +
                       ' Row 1st Column y less-than 0 2nd Column 0 2nd row' +
                       ' 1st Column y greater-than-or-equal-to 0 2nd Column' +
                       ' 2 y Endlayout', 'brief');
  this.executeRuleTest(mml, 'x equals layout enlarged L brace 1st Row 1st' +
                       ' Column y less-than 0 2nd Column 0 2nd Row 1st' +
                       ' Column y greater-than-or-equal-to 0 2nd Column 2 y' +
                       ' Endlayout', 'sbrief');
};


/**
 * Testing Rule 15.1, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_15_1_1 = function() {
  var mml = '<mfenced open="[" close="]"><mtable><mtr><mtd><mrow><mi>x</mi>' +
      '<mo>+</mo><mi>a</mi></mrow></mtd><mtd><mrow><mi>x</mi><mo>+</mo>' +
      '<mi>b</mi></mrow></mtd><mtd><mrow><mi>x</mi><mo>+</mo><mi>c</mi>' +
      '</mrow></mtd></mtr><mtr><mtd><mrow><mi>y</mi><mo>+</mo><mi>a</mi>' +
      '</mrow></mtd><mtd><mrow><mi>y</mi><mo>+</mo><mi>b</mi></mrow></mtd>' +
      '<mtd><mrow><mi>y</mi><mo>+</mo><mi>c</mi></mrow></mtd></mtr><mtr>' +
      '<mtd><mrow><mi>z</mi><mo>+</mo><mi>a</mi></mrow></mtd><mtd><mrow>' +
      '<mi>z</mi><mo>+</mo><mi>b</mi></mrow></mtd><mtd><mrow><mi>z</mi>' +
      '<mo>+</mo><mi>c</mi></mrow></mtd></mtr></mtable></mfenced>';
  this.executeRuleTest(mml, 'Start 3 by 3 matrix 1st Row 1st Column x plus a' +
                       ' 2nd Column x plus b 3rd Column x plus c 2nd Row 1st' +
                       ' Column y plus a 2nd Column y plus b 3rd Column y' +
                       ' plus c 3rd Row 1st Column z plus a 2nd Column z' +
                       ' plus b 3rd Column z plus c Endmatrix', 'default');
  this.executeRuleTest(mml, 'Start 3 by 3 matrix 1st Row 1st Column x plus a' +
                       ' 2nd Column x plus b 3rd Column x plus c 2nd Row 1st' +
                       ' Column y plus a 2nd Column y plus b 3rd Column y' +
                       ' plus c 3rd Row 1st Column z plus a 2nd Column z' +
                       ' plus b 3rd Column z plus c Endmatrix', 'brief');
  this.executeRuleTest(mml, '3 by 3 matrix 1st Row 1st Column x plus a 2nd' +
                       ' Column x plus b 3rd Column x plus c 2nd Row 1st' +
                       ' Column y plus a 2nd Column y plus b 3rd Column y' +
                       ' plus c 3rd Row 1st Column z plus a 2nd Column z' +
                       ' plus b 3rd Column z plus c Endmatrix', 'sbrief');
};


/**
 * Testing Rule 15.2, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_15_2_1 = function() {
  var mml = '<mrow><mfenced open="|" close="|"><mtable><mtr><mtd><mrow>' +
      '<mi>a</mi><mo>+</mo><mn>1</mn></mrow></mtd><mtd><mi>b</mi></mtd>' +
      '</mtr><mtr><mtd><mi>c</mi></mtd><mtd><mi>d</mi></mtd></mtr>' +
      '</mtable></mfenced><mo>=</mo><mrow><mo>(</mo><mi>a</mi><mo>+</mo>' +
      '<mn>1</mn><mo>)</mo></mrow><mi>d</mi><mo>-</mo><mi>b</mi><mi>c</mi>' +
      '</mrow>';
  this.executeRuleTest(mml, 'Start 2 by 2 Determinant 1st Row 1st Column a' +
                       ' plus 1 2nd Column b 2nd Row 1st Column c 2nd Column' +
                       ' d EndDeterminant equals left-parenthesis a plus 1' +
                       ' right-parenthesis d minus b c', 'default');
  this.executeRuleTest(mml, 'Start 2 by 2 Determinant 1st Row 1st Column a' +
                       ' plus 1 2nd Column b 2nd Row 1st Column c 2nd Column' +
                       ' d EndDeterminant equals left-pren a plus 1' +
                       ' right-pren d minus b c', 'brief');
  this.executeRuleTest(mml, '2 by 2 Determinant 1st Row 1st Column a plus 1' +
                       ' 2nd Column b 2nd Row 1st Column c 2nd Column d' +
                       ' EndDeterminant equals L pren a plus 1 R pren d' +
                       ' minus b c', 'sbrief');
};


/**
 * Testing Rule 15.4, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_15_4_1 = function() {
  var mml = '<mrow><mfenced open="|" close="|"><mtable><mtr><mtd><mi>a</mi>' +
      '</mtd><mtd><mi>b</mi></mtd></mtr><mtr><mtd><mi>c</mi></mtd><mtd>' +
      '<mi>d</mi></mtd></mtr></mtable></mfenced><mo>=</mo><mi>a</mi>' +
      '<mi>d</mi><mo>-</mo><mi>b</mi><mi>c</mi></mrow>';
  this.executeRuleTest(mml, 'Start 2 by 2 Determinant 1st Row a b 2nd Row c' +
                       ' d EndDeterminant equals a d minus b c', 'default');
  this.executeRuleTest(mml, 'Start 2 by 2 Determinant 1st Row a b 2nd Row c' +
                       ' d EndDeterminant equals a d minus b c', 'brief');
  this.executeRuleTest(mml, '2 by 2 Determinant 1st Row a b 2nd Row c d' +
                       ' EndDeterminant equals a d minus b c', 'sbrief');
};


/**
 * Testing Rule 15.6, Example 1.
 */
sre.MathspeakRuleTest.prototype.untestSample_15_6_1 = function() {
  var mml = '<mfenced open="(" close=")"><mtable><mtr><mtd><mi>x</mi></mtd>' +
      '</mtr><mtr><mtd><mi>y</mi></mtd></mtr></mtable></mfenced>';
  this.executeRuleTest(mml, 'StartBinomialOrMatrix x choose y' +
                       ' EndBinomialOrMatrix', 'default');
  this.executeRuleTest(mml, 'StartBinomialOrMatrix x choose y' +
                       ' EndBinomialOrMatrix', 'brief');
  this.executeRuleTest(mml, 'BinomialOrMatrix x choose y' +
                       ' EndBinomialOrMatrix', 'sbrief');
};
