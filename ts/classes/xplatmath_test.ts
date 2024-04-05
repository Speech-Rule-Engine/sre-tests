//
// Copyright 2016 Volker Sorge
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
 * @file Tests of XPlatMath API.
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import * as xmldom from '@xmldom/xmldom';
import { AbstractJsonTest } from './abstract_test.js';

declare let Sre: any;

export class XplatSpeech extends AbstractJsonTest {
  
  /**
   * The speech style of the tests.
   */
  public style: string = 'default';

  /**
   * The speech rules for the tests.
   */
  public domain: string = 'mathspeak';

  /**
   * The locale for the tests.
   */
  public locale: string = 'en';

  /**
   * The subiso for the tests.
   */
  public subiso: string = '';

  /**
   * The modality for the tests.
   */
  public modality: string = 'speech';

  /**
   * Flag indicating if the actual output should be written to the HTML example
   * file, rather than the expected output.
   */
  public actual = false;

  /**
   * @class
   */
  public constructor() {
    super();
    this.pickFields.push('preference');
  }

  /**
   * @override
   */
  public executeTest(mml: string, answer: string, opt_style?: string) {
    const style = opt_style || this.style;
    const mathMl =
      '<math xmlns="http://www.w3.org/1998/Math/MathML">' + mml + '</math>';
    Sre.setupSync({
      domain: this.domain,
      style: style,
      modality: this.modality,
      subiso: this.subiso
    })
    const actual = Sre.speech(mathMl);
    const expected = this.actual ? actual : answer;
    this.assert.equal(actual, expected);
  }
  
  /**
   * @override
   */
  public async setUpTest() {
    await super.setUpTest();
    return Sre.setup({
      domain: this.domain,
      modality: this.modality,
      locale: this.locale,
      subiso: this.subiso
    });
  }

  /**
   * @override
   */
  public prepare() {
    super.prepare();
    this.modality = this.jsonTests.modality || this.modality;
    this.locale = this.jsonTests.locale || this.locale;
    this.domain = this.jsonTests.domain || this.domain;
    this.style = this.jsonTests.style || this.style;
    this.subiso = this.jsonTests.subiso || this.subiso;
    this.actual = this.jsonTests.actual || this.actual;
  }

  /**
   * @override
   */
  public method() {
    this.executeTest(
      this.field('input'),
      this.field('expected'),
      this.field('preference')
    );
  }

}

export class XplatSemantic extends AbstractJsonTest {
  
  /**
   * @override
   */
  public setUpTest() {
    super.setUpTest();
    Sre.deactivateAnnotation('depth', 'depth');
    return Sre.setup({
      domain: 'mathspeak',
      style: 'default'
    });
  }

  /**
   * @override
   */
  public async tearDownTest() {
    await Sre.setup({
      domain: 'default'
    });
    return super.tearDownTest();
  }

  /**
   * @override
   */
  public constructor() {
    super();
    this.pickFields.push('brief');
  }

  /**
   * @override
   */
  public method() {
    this.executeTest(
      this.field('input'),
      this.field('expected'),
      this.field('brief')
    );
  }

  /**
   * Tests if for a given mathml snippet results in a particular semantic tree.
   *
   * @param mml MathML expression.
   * @param sml XML snippet for the semantic tree.
   * @param opt_brief Brief XML output.
   */
  public executeTest(mml: string, sml: string, opt_brief?: boolean) {
    const mathMl = this.prepareMathml(mml);
    let sxml;
    try {
      sxml = new Sre.tree(mathMl, opt_brief);
    } catch (e) {
      console.log(e);
    }
    // const sxml = new Sre.tree(mathMl, opt_brief);
    const xmls = new xmldom.XMLSerializer();
    // this.customizeXml(sxml);
    const dp = new xmldom.DOMParser();
    const xml = dp.parseFromString(
      this.prepareStree(sml), xmldom.MIME_TYPE.XML_TEXT);
    this.assert.equal(
      xmls.serializeToString(sxml),
      xmls.serializeToString(xml)
    );
  }

  /**
   * Adds stree tags to a semantic tree string, if necessary.
   *
   * @param sml Stree XML string.
   * @returns The augmented expression.
   */
  private prepareStree(sml: string): string {
    if (!sml) {
      return '<stree></stree>';
    }
    if (!sml.match(/^<stree/)) {
      sml = '<stree>' + sml;
    }
    if (!sml.match(/\/stree>$/)) {
      sml += '</stree>';
    }
    return sml;
  }

  private prepareMathml(mml: string): string {
    if (!mml) {
      return '<math></math>';
    }
    if (!mml.match(/^<math/)) {
      mml = '<math>' + mml;
    }
    if (!mml.match(/\/math>$/)) {
      mml += '</math>';
    }
    return mml;
  }

}
