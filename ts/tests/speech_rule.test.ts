//
// Copyright 2013 Google Inc.
//
//
// Copyright 2014 Volker Sorge
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
 * @fileoverview Testcases for math speech rules. Running directly with Jest.
 * @author sorge@google.com (Volker Sorge)
 */

import {sre} from '../base/test_external';

describe(
  'Speech rule tests.',
  () => {
    
    /**
     * Test speech rule grammar annotations.
     */
    test('testGrammar', () => {
      expect(
        {'font': true,
         'annotation': '"unit"'})
	.toEqual(sre.SpeechRule.Component.grammarFromString(
          'font:annotation="unit"'));
      expect(
        {'font': false,
         'annotation': '@unit'})
	.toEqual(sre.SpeechRule.Component.grammarFromString(
          '!font:annotation=@unit'));
      // Whitespace test.
      expect(
        {'font': false,
         'annotation': '@unit'})
	.toEqual(sre.SpeechRule.Component.grammarFromString(
          ' !font : annotation = @unit '));
    });

    /**
     * Test speech rule attributes.
     */
    test('Attributes', () => {
      expect(
        {'ctxtfunc': 'element',
         'separator': '"plus"',
         'volume': '0.5'})
	.toEqual(sre.SpeechRule.Component.attributesFromString(
          '(ctxtfunc:element,separator:"plus", volume:0.5)'));
      expect(
        {'context': '"node"',
         'pitch': '0.5',
         'difference': 'true'})
	.toEqual(sre.SpeechRule.Component.attributesFromString(
          '(context:"node",pitch:0.5,difference)'));
      expect(
        {'context': '"node"',
         'grammar': {
           'font': true,
           'annotation': '"unit"'}})
	.toEqual(sre.SpeechRule.Component.attributesFromString(
          '(context:"node",grammar:font:annotation="unit")'));
      expect(
        {'grammar': {
          'font': true,
          'annotation': '"unit"'}})
	.toEqual(sre.SpeechRule.Component.attributesFromString(
          '(grammar:font:annotation="unit")'));
      // Whitespace test.
      expect(
        {'context': '"node"',
         'pitch': '0.5',
         'difference': 'true'})
	.toEqual(sre.SpeechRule.Component.attributesFromString(
          '( context : "node" , pitch : 0.5 , difference )'));
    });

    /**
     * Test simple speech rule components.
     */
    test('SimpleComponents', () => {
      expect(
        {'type': sre.SpeechRule.Type.MULTI,
         'content': './*'})
        .toEqual(sre.SpeechRule.Component.fromString('[m] ./*'));
      expect(
        {'type': sre.SpeechRule.Type.NODE, 'content': './*[1]'})
        .toEqual(sre.SpeechRule.Component.fromString('[n] ./*[1]'));
      expect(
        {'type': sre.SpeechRule.Type.PERSONALITY, 'attributes': {'pause': '200'}})
	.toEqual(sre.SpeechRule.Component.fromString('[p] (pause:200)'));
      expect(
        {'type': sre.SpeechRule.Type.TEXT, 'content': '"super"'})
	.toEqual(sre.SpeechRule.Component.fromString('[t] "super"'));
      expect(
        {'type': sre.SpeechRule.Type.TEXT, 'content': 'text()'})
	.toEqual(sre.SpeechRule.Component.fromString('[t] text()'));
    });
    /**
     * Test speech rule components with attributes.
     */
    test('ComplexComponents', () => {
      expect(
        {'type': sre.SpeechRule.Type.MULTI,
         'content': './*',
         'attributes': {'ctxtfunc': 'element',
                        'separator': '"plus"',
                        'volume': '0.5'}})
	.toEqual(sre.SpeechRule.Component.fromString(
          '[m] ./* (ctxtfunc:element,separator:"plus", volume:0.5)'));
      expect(
        {'type': sre.SpeechRule.Type.NODE,
         'content': './*[1]',
         'attributes': {'context': '"node"', 'pitch': '0.5'}})
	.toEqual(sre.SpeechRule.Component.fromString(
          '[n] ./*[1] (context:"node",pitch:0.5)'));
      expect(
        {'type': sre.SpeechRule.Type.NODE,
         'content': './*[1]',
         'attributes': {'context': '"node"'},
         'grammar': {'font': true, 'annotation': '"unit"'}})
	.toEqual(sre.SpeechRule.Component.fromString(
          '[n] ./*[1] (context:"node",grammar:font:annotation="unit")'));
      expect(
        {'type': sre.SpeechRule.Type.NODE,
         'content': './*[1]',
         'grammar': {'font': true, 'annotation': '"unit"'}})
	.toEqual(sre.SpeechRule.Component.fromString(
          '[n] ./*[1] (grammar:font:annotation="unit")'));
    });
    /**
     * Test speech rules.
     */
    test('Rules', () => {
      expect(
        [
          {'type': sre.SpeechRule.Type.TEXT,
           'content': '"Square root of"'},
          {'type': sre.SpeechRule.Type.NODE,
           'content': './*[1]',
           'attributes': {'rate': '0.2'}},
          {'type': sre.SpeechRule.Type.PERSONALITY,
           'attributes': {'pause': '400'}}])
	.toEqual(sre.SpeechRule.Action.fromString(
          '[t] "Square root of"; [n] ./*[1] (rate:0.2); [p] (pause:400)').
          components);
      expect(
        [{'type': sre.SpeechRule.Type.NODE,
          'content': './*[1]/*[1]/*[1]'},
         {'type': sre.SpeechRule.Type.TEXT,
          'content': '"sub"'},
         {'type': sre.SpeechRule.Type.NODE,
          'content': './*[1]/*[3]/*[1]',
          'attributes': {'pitch': '-0.35'}},
         {'type': sre.SpeechRule.Type.PERSONALITY,
          'attributes': {'pause': '200'}},
         {'type': sre.SpeechRule.Type.TEXT,
          'content': '"super"'},
         {'type': sre.SpeechRule.Type.NODE,
          'content': './*[1]/*[2]/*[1]',
          'attributes': {'pitch': '0.35'}},
         {'type': sre.SpeechRule.Type.PERSONALITY,
          'attributes': {'pause': '300'}}])
	.toEqual(sre.SpeechRule.Action.fromString(
          '[n] ./*[1]/*[1]/*[1]; [t] "sub"; [n] ./*[1]/*[3]/*[1] ' +
            '(pitch:-0.35) ;[p](pause:200); [t] "super";' +
            '[n] ./*[1]/*[2]/*[1] (pitch:0.35) ;  [p] (pause:300)  ').components);
    });

    /**
     * Test translation of speech rule attributes.
     */
    test('AttributesList', () => {
      expect(
        ['context:"node"', 'pitch:0.5'])
	.toEqual(sre.SpeechRule.Component.fromString(
          '[n] ./ (context:"node", pitch:0.5)').getAttributes());

      expect(
        ['ctxtfunc:element', 'separator:"plus"', 'volume:0.5'])
	.toEqual(sre.SpeechRule.Component.fromString(
          '[t] "irrelevant" (ctxtfunc:element,' +
            'separator:"plus",' +
            'volume:0.5)').getAttributes());
    });

    /**
     * Test speech rule grammar annotations.
     */
    test('GrammarString', () => {
      let grammar1 = 'font:annotation="unit"';
      expect(
        grammar1)
	.toEqual(sre.SpeechRule.Component.fromString(
          '[p] (grammar:' + grammar1 + ')').grammarToString());
      let grammar2 = '!font:annotation=@unit';
      expect(
        grammar2)
	.toEqual(sre.SpeechRule.Component.fromString(
          '[p] (grammar:' + grammar2 + ')').grammarToString());
    });

    /**
     * Test speech rule attributes.
     */
    test('AttributesString', () => {
      let attrs1 = '(ctxtfunc:element, separator:"plus", volume:0.5)';
      expect(
        attrs1)
	.toEqual(sre.SpeechRule.Component.fromString(
          '[p] ' + attrs1).attributesToString());
      let attrs2 = '(context:"node", pitch:0.5, difference)';
      expect(
        attrs2)
	.toEqual(sre.SpeechRule.Component.fromString(
          '[p] ' + attrs2).attributesToString());
      let attrs3 = '(context:"node", grammar:font:annotation="unit")';
      expect(
        attrs3)
	.toEqual(sre.SpeechRule.Component.fromString(
          '[p] ' + attrs3).attributesToString());
      let attrs4 = '(grammar:font:annotation="unit")';
      expect(
        attrs4)
	.toEqual(sre.SpeechRule.Component.fromString(
          '[p] ' + attrs4).attributesToString());
    });

    /**
     * Test translation of simple speech rule components.
     */
    test('SimpleComponentsString', () => {
      expect(
        '[m] ./*').
        toEqual(sre.SpeechRule.Component.fromString('[m] ./*').toString());
      expect(
        '[n] ./*[1]')
	.toEqual(sre.SpeechRule.Component.fromString('[n] ./*[1]').toString());
      expect(
        '[p] (pause:200)')
	.toEqual(sre.SpeechRule.Component.fromString('[p] (pause:200)').toString());
      expect(
        '[t] "super"')
	.toEqual(sre.SpeechRule.Component.fromString('[t] "super"').toString());
      expect(
        '[t] text()')
	.toEqual(sre.SpeechRule.Component.fromString('[t] text()').toString());
    });

    /**
     * Test translation of speech rule components with attributes.
     */
    test('ComplexComponentsString', () => {
      let comp1 = '[m] ./* (ctxtfunc:element, separator:"plus", volume:0.5)';
      expect(
        comp1)
	.toEqual(sre.SpeechRule.Component.fromString(comp1).toString());
      let comp2 = '[n] ./*[1] (context:"node", pitch:0.5)';
      expect(
        comp2)
	.toEqual(sre.SpeechRule.Component.fromString(comp2).toString());
      let comp3 = '[n] ./*[1] (context:"node", grammar:font:annotation="unit")';
      expect(
        comp3)
	.toEqual(sre.SpeechRule.Component.fromString(comp3).toString());
      let comp4 = '[n] ./*[1] (grammar:font:annotation="unit")';
      expect(
        comp4)
	.toEqual(sre.SpeechRule.Component.fromString(comp4).toString());
    });

    /**
     * Test translation of speech rules.
     */
    test('RulesString', () => {
      let rule1 = '[t] "Square root of"; [n] ./*[1] (rate:0.2); [p] (pause:400)';
      expect(
        rule1)
	.toEqual(sre.SpeechRule.Action.fromString(rule1).toString());
      let rule2 = '[n] ./*[1]/*[1]/*[1]; [t] "sub"; [n] ./*[1]/*[3]/*[1] ' +
        '(pitch:-0.35); [p] (pause:200); [t] "super";' +
        ' [n] ./*[1]/*[2]/*[1] (pitch:0.35); [p] (pause:300)';
      expect(
        rule2)
	.toEqual(sre.SpeechRule.Action.fromString(rule2).toString());
    });

    /**
     * Tests for double quoted string syntax.
     */
    test('SeparatorsInStrings', () => {
      let rule1 = '[t] "matrix; 3 by 3"; [n] ./*[1]';
      expect(
        rule1)
	.toEqual(sre.SpeechRule.Action.fromString(rule1).toString());
      let rule2 = '[t] "matrix; 3;""by 3"; [n] ./*[1]';
      expect(
        rule2)
	.toEqual(sre.SpeechRule.Action.fromString(rule2).toString());
      let rule3 = '[t] "matrix; by 3"; [n] ./*[1] ' +
        '(context:"where, who; why, when", separator:@separator)';
      let sprule3 = sre.SpeechRule.Action.fromString(rule3);
      expect(rule3).toEqual(sprule3.toString());
      expect('[t] "matrix; by 3"').toEqual(sprule3.components[0].toString());
      expect('"where, who; why, when"').toEqual(
        sprule3.components[1].attributes['context']);
    });

  });

