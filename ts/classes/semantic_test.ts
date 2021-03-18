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

import {sre, xmldom} from '../base/test_external';
import {AbstractExamples} from './abstract_examples';

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
    let mathMl = sre.Enrich.prepareMmlString(expr);
    let mml = sre.DomUtil.parseInput(mathMl);
    let stree = new sre.SemanticTree(mml);
    let emml = sre.EnrichMathml.enrich(mml, stree);
    let reass = (new sre.RebuildStree(emml)).getTree();
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
    sre.System.getInstance().setupEngine(
      {domain: 'mathspeak',
       style: 'default',
       speech: sre.Engine.Speech.SHALLOW});
  }

  /**
   * @override
   */
  public tearDownTest() {
    sre.System.getInstance().setupEngine(
      {domain: 'default',
       style: 'default',
       speech: sre.Engine.Speech.NONE});
    super.tearDownTest();
  }

  /**
   * Tests if speech strings computed directly for a MathML expression are
   * equivalent to those computed for enriched expressions.
   *
   * @override
   */
  public executeTest(expr: string) {
    let mml = sre.Enrich.prepareMmlString(expr);
    let sysSpeech = sre.System.getInstance().toSpeech(mml);
    let enr = sre.WalkerUtil.getSemanticRoot(
      sre.System.getInstance().toEnriched(mml));
    let enrSpeech = enr.getAttribute(sre.EnrichMathml.Attribute.SPEECH);
    this.assert.equal(sysSpeech, enrSpeech);
  }
}

/**
 * Semantic Tree Tests
 */
export class SemanticTreeTest extends SemanticTest {

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
    let mathMl = sre.Enrich.prepareMmlString(mml);
    let node = sre.DomUtil.parseInput(mathMl);
    let sxml = (new sre.SemanticTree(node)).xml(opt_brief);
    let dp = new xmldom.DOMParser();
    let xml = dp.parseFromString(this.prepareStree(sml), 'text/xml');
    let xmls = new xmldom.XMLSerializer();
    this.assert.equal(this.cleanStree(xmls.serializeToString(sxml)),
                      xmls.serializeToString(xml));
  }

  protected cleanStree(stree: string): string {
    return stree;
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
 * Semantic Tree Tests without certain attributes.
 */
export class SemanticTreeSelectTest extends SemanticTreeTest {

  /**
   * @override
   */
  protected cleanStree(stree: string): string {
    return stree.replace(/ id=\"\d+\"/g, '');
  }

}

/**
 * Tests for enriched MathML expressions.
 */
export class EnrichMathmlTest extends SemanticTest {

  private attrBlacklist: string[] = [];

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
   * @override
   */
  public setUpTest() {
    super.setUpTest();
    this.attrBlacklist = [
      'data-semantic-annotation',
      'data-semantic-font',
      'data-semantic-embellished',
      'data-semantic-fencepointer',
      'data-semantic-structure'];
  }

  /**
   * Tests if for a given mathml snippet results in a particular semantic tree.
   *
   * @param mml MathML expression.
   * @param smml MathML snippet for the semantic information.
   */
  public executeTest(mml: string, smml: string) {
    let mathMl = sre.Enrich.prepareMmlString(mml);
    let node = sre.Enrich.semanticMathmlSync(mathMl);
    let dp = new xmldom.DOMParser();
    let xml = smml ? dp.parseFromString(smml) : '';
    let xmls = new xmldom.XMLSerializer();
    this.customizeXml(node);
    this.appendExamples('', mml);
    let cleaned = sre.EnrichMathml.removeAttributePrefix(
      xmls.serializeToString(node));
    this.assert.equal(cleaned, xmls.serializeToString(xml));
  }

  /**
   * Removes XML nodes according to the XPath elements in the blacklist.
   *
   * @param xml Xml representation of the semantic node.
   */
  public customizeXml(xml: Element) {
    this.attrBlacklist.forEach(
      attr => {
        xml.removeAttribute(attr);
        let removes = sre.DomUtil.querySelectorAllByAttr(xml, attr);
        if (xml.hasAttribute(attr)) {
          removes.push(xml);
        }
        removes.forEach((node: Element) => node.removeAttribute(attr));
      });
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
    let mathMl = sre.Enrich.prepareMmlString(expr);
    let mml = sre.DomUtil.parseInput(mathMl);
    this.treeVsXml(mml);
    this.stringVsXml(mml, mathMl);
    this.stringVsTree(mml, mathMl);
  }

  /**
   * Tests Tree generation vs Xml output.
   *
   * @param mml The node.
   */
  public treeVsXml(mml: Node) {
    this.assert.equal(
      this.xmls(sre.Semantic.getTree(mml).xml()),
      this.xmls(sre.Semantic.xmlTree(mml)));
  }

  /**
   * Tests Tree generation vs Xml output.
   *
   * @param mml The node.
   * @param mstr The XML as string.
   */
  public stringVsXml(mml: Node, mstr: string) {
    this.assert.equal(
      this.xmls(sre.Semantic.getTreeFromString(mstr).xml()),
      this.xmls(sre.Semantic.xmlTree(mml)));
  }

  /**
   * Tests Tree generation vs Xml output.
   *
   * @param mml The node.
   * @param mstr The XML as string.
   */
  public stringVsTree(mml: Node, mstr: string) {
    this.assert.equal(
      this.xmls(sre.Semantic.getTreeFromString(mstr).xml()),
      this.xmls(sre.Semantic.getTree(mml).xml()));
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
    let mathMl = sre.Enrich.prepareMmlString(expr);
    let mml = sre.DomUtil.parseInput(mathMl);
    let stree = new sre.SemanticTree(mml);
    let xml = stree.xml();
    this.assert.equal(xml.toString(),
                      sre.SemanticTree.fromXml(xml).xml().toString());
  }

}
