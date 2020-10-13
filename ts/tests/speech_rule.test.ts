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
      expect(sre.SpeechRule.Component.grammarFromString(
        'font:annotation="unit"'))
        .toEqual(
          {'font': true,
           'annotation': '"unit"'});
      expect(sre.SpeechRule.Component.grammarFromString(
        '!font:annotation=@unit'))
        .toEqual(
          {'font': false,
           'annotation': '@unit'});
      // Whitespace test.
      expect(sre.SpeechRule.Component.grammarFromString(
        ' !font : annotation = @unit '))
        .toEqual(
          {'font': false,
           'annotation': '@unit'});
    });

    /**
     * Test speech rule attributes.
     */
    test('Attributes', () => {
      expect(sre.SpeechRule.Component.attributesFromString(
        '(ctxtfunc:element,separator:"plus", volume:0.5)'))
        .toEqual(
          {'ctxtfunc': 'element',
           'separator': '"plus"',
           'volume': '0.5'});
      expect(sre.SpeechRule.Component.attributesFromString(
        '(context:"node",pitch:0.5,difference)'))
        .toEqual(
          {'context': '"node"',
           'pitch': '0.5',
           'difference': 'true'});
      expect(sre.SpeechRule.Component.attributesFromString(
        '(context:"node",grammar:font:annotation="unit")'))
        .toEqual(
          {'context': '"node"',
           'grammar': {
             'font': true,
             'annotation': '"unit"'}});
      expect(sre.SpeechRule.Component.attributesFromString(
        '(grammar:font:annotation="unit")'))
        .toEqual(
          {'grammar': {
            'font': true,
            'annotation': '"unit"'}});
      // Whitespace test.
      expect(sre.SpeechRule.Component.attributesFromString(
        '( context : "node" , pitch : 0.5 , difference )'))
        .toEqual(
          {'context': '"node"',
           'pitch': '0.5',
           'difference': 'true'});
    });

    /**
     * Test simple speech rule components.
     */
    test('SimpleComponents', () => {
      expect(sre.SpeechRule.Component.fromString('[m] ./*'))
        .toEqual(
          {'type': sre.SpeechRule.Type.MULTI,
           'content': './*'});
      expect(sre.SpeechRule.Component.fromString('[n] ./*[1]'))
        .toEqual(
          {'type': sre.SpeechRule.Type.NODE, 'content': './*[1]'});
      expect(sre.SpeechRule.Component.fromString('[p] (pause:200)'))
        .toEqual(
          {'type': sre.SpeechRule.Type.PERSONALITY,
           'attributes': {'pause': '200'}});
      expect(sre.SpeechRule.Component.fromString('[t] "super"'))
        .toEqual(
          {'type': sre.SpeechRule.Type.TEXT, 'content': '"super"'});
      expect(sre.SpeechRule.Component.fromString('[t] text()'))
        .toEqual(
          {'type': sre.SpeechRule.Type.TEXT, 'content': 'text()'});
    });
    /**
     * Test speech rule components with attributes.
     */
    test('ComplexComponents', () => {
      expect(sre.SpeechRule.Component.fromString(
        '[m] ./* (ctxtfunc:element,separator:"plus", volume:0.5)'))
        .toEqual(
          {'type': sre.SpeechRule.Type.MULTI,
           'content': './*',
           'attributes': {'ctxtfunc': 'element',
                          'separator': '"plus"',
                          'volume': '0.5'}});
      expect(sre.SpeechRule.Component.fromString(
        '[n] ./*[1] (context:"node",pitch:0.5)'))
        .toEqual(
          {'type': sre.SpeechRule.Type.NODE,
           'content': './*[1]',
           'attributes': {'context': '"node"', 'pitch': '0.5'}});
      expect(sre.SpeechRule.Component.fromString(
        '[n] ./*[1] (context:"node",grammar:font:annotation="unit")'))
        .toEqual(
          {'type': sre.SpeechRule.Type.NODE,
           'content': './*[1]',
           'attributes': {'context': '"node"'},
           'grammar': {'font': true, 'annotation': '"unit"'}});
      expect(sre.SpeechRule.Component.fromString(
        '[n] ./*[1] (grammar:font:annotation="unit")'))
        .toEqual(
          {'type': sre.SpeechRule.Type.NODE,
           'content': './*[1]',
           'grammar': {'font': true, 'annotation': '"unit"'}});
    });
    /**
     * Test speech rules.
     */
    test('Rules', () => {
      expect(sre.SpeechRule.Action.fromString(
        '[t] "Square root of"; [n] ./*[1] (rate:0.2); [p] (pause:400)').
        components)
        .toEqual(
          [
            {'type': sre.SpeechRule.Type.TEXT,
             'content': '"Square root of"'},
            {'type': sre.SpeechRule.Type.NODE,
             'content': './*[1]',
             'attributes': {'rate': '0.2'}},
            {'type': sre.SpeechRule.Type.PERSONALITY,
             'attributes': {'pause': '400'}}]);
      expect(sre.SpeechRule.Action.fromString(
        '[n] ./*[1]/*[1]/*[1]; [t] "sub"; [n] ./*[1]/*[3]/*[1] ' +
          '(pitch:-0.35) ;[p](pause:200); [t] "super";' +
          '[n] ./*[1]/*[2]/*[1] (pitch:0.35) ;  [p] (pause:300)  ').components)
        .toEqual(
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
            'attributes': {'pause': '300'}}]);
    });

    /**
     * Test translation of speech rule attributes.
     */
    test('AttributesList', () => {
      expect(sre.SpeechRule.Component.fromString(
        '[n] ./ (context:"node", pitch:0.5)').getAttributes())
        .toEqual(['context:"node"', 'pitch:0.5']);

      expect(sre.SpeechRule.Component.fromString(
        '[t] "irrelevant" (ctxtfunc:element,' +
          'separator:"plus",' +
          'volume:0.5)').getAttributes())
        .toEqual(['ctxtfunc:element', 'separator:"plus"', 'volume:0.5']);
    });

    /**
     * Test speech rule grammar annotations.
     */
    test('GrammarString', () => {
      let grammar1 = 'font:annotation="unit"';
      expect(sre.SpeechRule.Component.fromString(
        '[p] (grammar:' + grammar1 + ')').grammarToString())
        .toEqual(grammar1);
      let grammar2 = '!font:annotation=@unit';
      expect(sre.SpeechRule.Component.fromString(
        '[p] (grammar:' + grammar2 + ')').grammarToString())
        .toEqual(grammar2);
    });

    /**
     * Test speech rule attributes.
     */
    test('AttributesString', () => {
      let attrs1 = '(ctxtfunc:element, separator:"plus", volume:0.5)';
      expect(sre.SpeechRule.Component.fromString(
        '[p] ' + attrs1).attributesToString())
        .toEqual(attrs1);
      let attrs2 = '(context:"node", pitch:0.5, difference)';
      expect(sre.SpeechRule.Component.fromString(
        '[p] ' + attrs2).attributesToString())
        .toEqual(attrs2);
      let attrs3 = '(context:"node", grammar:font:annotation="unit")';
      expect(sre.SpeechRule.Component.fromString(
        '[p] ' + attrs3).attributesToString())
        .toEqual(attrs3);
      let attrs4 = '(grammar:font:annotation="unit")';
      expect(sre.SpeechRule.Component.fromString(
        '[p] ' + attrs4).attributesToString())
        .toEqual(attrs4);
    });

    /**
     * Test translation of simple speech rule components.
     */
    test('SimpleComponentsString', () => {
      expect(sre.SpeechRule.Component.fromString('[m] ./*').toString()).
        toEqual(
          '[m] ./*');
      expect(sre.SpeechRule.Component.fromString('[n] ./*[1]').toString())
        .toEqual('[n] ./*[1]');
      expect(sre.SpeechRule.Component.fromString('[p] (pause:200)').toString())
        .toEqual('[p] (pause:200)');
      expect(sre.SpeechRule.Component.fromString('[t] "super"').toString())
        .toEqual('[t] "super"');
      expect(sre.SpeechRule.Component.fromString('[t] text()').toString())
        .toEqual('[t] text()');
    });

    /**
     * Test translation of speech rule components with attributes.
     */
    test('ComplexComponentsString', () => {
      let comp1 = '[m] ./* (ctxtfunc:element, separator:"plus", volume:0.5)';
      expect(sre.SpeechRule.Component.fromString(comp1).toString())
        .toEqual(comp1);
      let comp2 = '[n] ./*[1] (context:"node", pitch:0.5)';
      expect(sre.SpeechRule.Component.fromString(comp2).toString())
        .toEqual(comp2);
      let comp3 = '[n] ./*[1] (context:"node", grammar:font:annotation="unit")';
      expect(sre.SpeechRule.Component.fromString(comp3).toString())
        .toEqual(comp3);
      let comp4 = '[n] ./*[1] (grammar:font:annotation="unit")';
      expect(sre.SpeechRule.Component.fromString(comp4).toString())
        .toEqual(comp4);
    });

    /**
     * Test translation of speech rules.
     */
    test('RulesString', () => {
      let rule1 = '[t] "Square root of"; [n] ./*[1] (rate:0.2);' +
        ' [p] (pause:400)';
      expect(sre.SpeechRule.Action.fromString(rule1).toString())
        .toEqual(rule1);
      let rule2 = '[n] ./*[1]/*[1]/*[1]; [t] "sub"; [n] ./*[1]/*[3]/*[1] ' +
        '(pitch:-0.35); [p] (pause:200); [t] "super";' +
        ' [n] ./*[1]/*[2]/*[1] (pitch:0.35); [p] (pause:300)';
      expect(sre.SpeechRule.Action.fromString(rule2).toString())
        .toEqual(rule2);
    });

    /**
     * Tests for double quoted string syntax.
     */
    test('SeparatorsInStrings', () => {
      let rule1 = '[t] "matrix; 3 by 3"; [n] ./*[1]';
      expect(sre.SpeechRule.Action.fromString(rule1).toString())
        .toEqual(rule1);
      let rule2 = '[t] "matrix; 3;""by 3"; [n] ./*[1]';
      expect(sre.SpeechRule.Action.fromString(rule2).toString())
        .toEqual(rule2);
      let rule3 = '[t] "matrix; by 3"; [n] ./*[1] ' +
        '(context:"where, who; why, when", separator:@separator)';
      let sprule3 = sre.SpeechRule.Action.fromString(rule3);
      expect(sprule3.toString()).toEqual(rule3);
      expect(sprule3.components[0].toString())
        .toEqual('[t] "matrix; by 3"');
      expect(
        sprule3.components[1].attributes['context'])
        .toEqual('"where, who; why, when"');
    });

  });
