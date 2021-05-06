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
 * @fileoverview Testcases for the semantic tree.
 * @author sorge@google.com (Volker Sorge)
 */

import xmldom = require('xmldom-sre');
import {AbstractExamples} from './abstract_examples';

import * as Enrich from '../../../speech-rule-engine-tots/js/enrich_mathml/enrich';
import * as EnrichMathml from '../../../speech-rule-engine-tots/js/enrich_mathml/enrich_mathml';
import * as DomUtil from '../../../speech-rule-engine-tots/js/common/dom_util';
import {SemanticTree} from '../../../speech-rule-engine-tots/js/semantic_tree/semantic_tree';
import * as Semantic from '../../../speech-rule-engine-tots/js/semantic_tree/semantic';
import {RebuildStree} from '../../../speech-rule-engine-tots/js/walker/rebuild_stree';
import {EngineConst} from '../../../speech-rule-engine-tots/js/common/engine';
import * as System from '../../../speech-rule-engine-tots/js/common/system';
import * as WalkerUtil from '../../../speech-rule-engine-tots/js/walker/walker_util';


/**
 * Base class for all the semantic tree related tests.
 */
export abstract class SemanticTest extends AbstractExamples {

  /**
   * @override
   */
  public method(...args: any[]) {
    this.executeTest(args[0], args[1]);
  }

  /**
   * Executes a single test. This is called by the method.
   *
   * @param input The input element.
   * @param expected The expected output.
   */
  public abstract executeTest(input: string, expected: string): void;

}

/**
 * Testcases for reconstructing semantic trees from enriched mathml.
 */
export class RebuildStreeTest extends SemanticTest {

  /**
   * @override
   */
  public pickFields = ['input'];

  /**
   * Tests if for a given mathml snippet results in a particular semantic tree.
   *
   * @param expr MathML expression.
   */
  public executeTest(expr: string) {
    let mathMl = Enrich.prepareMmlString(expr);
    let mml = DomUtil.parseInput(mathMl);
    let stree = new SemanticTree(mml);
    let emml = EnrichMathml.enrich(mml, stree);
    let reass = (new RebuildStree(emml)).getTree();
    this.assert.equal(stree.toString(), reass.toString());
  }
}

/**
 * Enriched Speech Tests
 */
export class EnrichSpeechTest extends SemanticTest {

  /**
   * @override
   */
  public pickFields = ['input'];

  /**
   * @override
   */
  public setUpTest() {
    super.setUpTest();
    System.setupEngine(
      {domain: 'mathspeak',
       style: 'default',
       speech: EngineConst.Speech.SHALLOW});
  }

  /**
   * @override
   */
  public tearDownTest() {
    System.setupEngine(
      {domain: 'default',
       style: 'default',
       speech: EngineConst.Speech.NONE});
    super.tearDownTest();
  }

  /**
   * Tests if speech strings computed directly for a MathML expression are
   * equivalent to those computed for enriched expressions.
   *
   * @override
   */
  public executeTest(expr: string) {
    let mml = Enrich.prepareMmlString(expr);
    let sysSpeech = System.toSpeech(mml);
    let enr = WalkerUtil.getSemanticRoot(
      System.toEnriched(mml));
    let enrSpeech = enr.getAttribute(EnrichMathml.Attribute.SPEECH);
    this.assert.equal(sysSpeech, enrSpeech);
  }
}

/**
 * Tests that can remove elements from an XML element.
 */
export abstract class SemanticBlacklistTest extends SemanticTest {

  /**
   * The blacklist of attributes to be removed before comparison.
   */
  protected blacklist: string[] = [];

  /**
   * Removes XML nodes according to the XPath elements in the blacklist.
   *
   * @param xml Xml representation of the semantic node.
   */
  protected customizeXml(xml: Element) {
    this.blacklist.forEach(
      attr => {
        xml.removeAttribute(attr);
        let removes = DomUtil.querySelectorAllByAttr(xml, attr);
        if (xml.hasAttribute(attr)) {
          removes.push(xml);
        }
        removes.forEach((node: Element) => node.removeAttribute(attr));
      });
  }

  /**
   * @override
   */
  public prepare() {
    super.prepare();
    this.blacklist = this.jsonTests.blacklist || this.blacklist;
  }

}

/**
 * Semantic Tree Tests
 */
export class SemanticTreeTest extends SemanticBlacklistTest {

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
  public method(...args: any[]) {
    this.executeTest(args[0], args[1], args[2]);
  }

  /**
   * Tests if for a given mathml snippet results in a particular semantic tree.
   *
   * @param mml MathML expression.
   * @param sml XML snippet for the semantic tree.
   * @param opt_brief Brief XML output.
   */
  public executeTest(mml: string, sml: string, opt_brief?: boolean) {
    let mathMl = Enrich.prepareMmlString(mml);
    let node = DomUtil.parseInput(mathMl);
    let sxml = (new SemanticTree(node)).xml(opt_brief);
    this.customizeXml(sxml);
    let dp = new xmldom.DOMParser();
    let xml = dp.parseFromString(this.prepareStree(sml), 'text/xml');
    let xmls = new xmldom.XMLSerializer();
    this.assert.equal(xmls.serializeToString(sxml),
                      xmls.serializeToString(xml));
  }

  /**
   * Adds stree tags to a semantic tree string, if necessary.
   *
   * @param sml Stree XML string.
   * @return The augmented expression.
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

}

/**
 * Tests for enriched MathML expressions.
 */
export class EnrichMathmlTest extends SemanticBlacklistTest {

  /**
   * @override
   */
  protected blacklist: string[] = [
    'data-semantic-annotation',
    'data-semantic-font',
    'data-semantic-embellished',
    'data-semantic-fencepointer',
    'data-semantic-structure'
  ];

  /**
   * @override
   */
  public prepare() {
    super.prepare();
    if (this.jsonTests.active) {
      this.setActive(this.jsonTests.active, 'json');
    }
  }

  /**
   * Tests if for a given mathml snippet results in a particular semantic tree.
   *
   * @param mml MathML expression.
   * @param smml MathML snippet for the semantic information.
   */
  public executeTest(mml: string, smml: string) {
    let mathMl = Enrich.prepareMmlString(mml);
    let node = Enrich.semanticMathmlSync(mathMl);
    let dp = new xmldom.DOMParser();
    let xml = smml ? dp.parseFromString(smml) : '';
    let xmls = new xmldom.XMLSerializer();
    this.customizeXml(node);
    this.appendExamples('', mml);
    let cleaned = EnrichMathml.removeAttributePrefix(
      xmls.serializeToString(node));
    this.assert.equal(cleaned, xmls.serializeToString(xml));
  }

}

/**
 * Tests for the semantic API.
 */
export class SemanticApiTest extends SemanticTest {

  /**
   * @override
   */
  public information = 'Semantic API tests.';

  /**
   * @override
   */
  public pickFields = ['input'];

  private xmls = (new xmldom.XMLSerializer()).serializeToString;

  /**
   * Tests if for a given mathml snippet results in a particular semantic tree.
   *
   * @param expr MathML expression.
   */
  public executeTest(expr: string) {
    let mathMl = Enrich.prepareMmlString(expr);
    let mml = DomUtil.parseInput(mathMl);
    this.treeVsXml(mml);
    this.stringVsXml(mml, mathMl);
    this.stringVsTree(mml, mathMl);
  }

  /**
   * Tests Tree generation vs Xml output.
   *
   * @param mml The node.
   */
  public treeVsXml(mml: Element) {
    this.assert.equal(
      this.xmls(Semantic.getTree(mml).xml()),
      this.xmls(Semantic.xmlTree(mml)));
  }

  /**
   * Tests Tree generation vs Xml output.
   *
   * @param mml The node.
   * @param mstr The XML as string.
   */
  public stringVsXml(mml: Element, mstr: string) {
    this.assert.equal(
      this.xmls(Semantic.getTreeFromString(mstr).xml()),
      this.xmls(Semantic.xmlTree(mml)));
  }

  /**
   * Tests Tree generation vs Xml output.
   *
   * @param mml The node.
   * @param mstr The XML as string.
   */
  public stringVsTree(mml: Element, mstr: string) {
    this.assert.equal(
      this.xmls(Semantic.getTreeFromString(mstr).xml()),
      this.xmls(Semantic.getTree(mml).xml()));
  }

}

/**
 * Tests for the XML parser for the semantic tree.
 */
export class SemanticXmlTest extends SemanticTest {

  /**
   * @override
   */
  public information = 'Semantic Xml parser tests.';

  /**
   * @override
   */
  public pickFields = ['input'];

  /**
   * Tests if for a given mathml snippet results in a particular semantic tree.
   *
   * @param expr MathML expression.
   */
  public executeTest(expr: string) {
    let mathMl = Enrich.prepareMmlString(expr);
    let mml = DomUtil.parseInput(mathMl);
    let stree = new SemanticTree(mml);
    let xml = stree.xml();
    this.assert.equal(xml.toString(),
                      SemanticTree.fromXml(xml).xml().toString());
  }

}
