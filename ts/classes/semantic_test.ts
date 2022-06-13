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
 * @file Testcases for the semantic tree.
 * @author sorge@google.com (Volker Sorge)
 */

import xmldom = require('xmldom-sre');
import { AbstractExamples } from './abstract_examples';

import * as Enrich from '../../speech-rule-engine/js/enrich_mathml/enrich';
import {
  Attribute,
  removeAttributePrefix
} from '../../speech-rule-engine/js/enrich_mathml/enrich_attr';
import { enrich } from '../../speech-rule-engine/js/enrich_mathml/enrich_mathml';
import * as DomUtil from '../../speech-rule-engine/js/common/dom_util';
import { SemanticTree } from '../../speech-rule-engine/js/semantic_tree/semantic_tree';
import * as Semantic from '../../speech-rule-engine/js/semantic_tree/semantic';
import { RebuildStree } from '../../speech-rule-engine/js/walker/rebuild_stree';
import * as EngineConst from '../../speech-rule-engine/js/common/engine_const';
import * as System from '../../speech-rule-engine/js/common/system';
import * as WalkerUtil from '../../speech-rule-engine/js/walker/walker_util';

/**
 * Base class for all the semantic tree related tests.
 */
export abstract class SemanticTest extends AbstractExamples {

  /**
   * @override
   */
  public async setUpTest() {
    await super.setUpTest();
    return System.setupEngine({
      domain: 'mathspeak',
      style: 'default'
    });
  }

  /**
   * @override
   */
  public async tearDownTest() {
    await System.setupEngine({
      domain: 'default'
    });
    return super.tearDownTest();
  }

  /**
   * @override
   */
  public method() {
    this.executeTest(this.field('input'), this.field('expected'));
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
   * Tests if the semantic tree rebuilt from an enriched mathml is the same as
   * the semantic tree constructed from the original mathml snippet.
   *
   * @param expr MathML expression.
   */
  public executeTest(expr: string) {
    const mathMl = Enrich.prepareMmlString(expr);
    const mml = DomUtil.parseInput(mathMl);
    const stree = new SemanticTree(mml);
    const emml = enrich(mml, stree);
    const reass = new RebuildStree(emml).getTree();
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
   * Nesting depth of generated speech.
   */
  protected speech = EngineConst.Speech.SHALLOW;

  /**
   * @override
   */
  public async setUpTest() {
    await super.setUpTest();
    return System.setupEngine({
      speech: this.speech
    });
  }

  /**
   * @override
   */
  public async tearDownTest() {
    await System.setupEngine({
      speech: EngineConst.Speech.NONE
    });
    return super.tearDownTest();
  }

  /**
   * Tests if speech strings computed directly for a MathML expression are
   * equivalent to those computed for enriched expressions.
   *
   * @override
   */
  public executeTest(expr: string) {
    const mml = Enrich.prepareMmlString(expr);
    const sysSpeech = System.toSpeech(mml);
    const enr = WalkerUtil.getSemanticRoot(System.toEnriched(mml));
    const enrSpeech = enr.getAttribute(Attribute.SPEECH);
    this.assert.equal(sysSpeech, enrSpeech);
  }
}

/**
 * Enriched Speech Tests
 */
export class DeepSpeechTest extends EnrichSpeechTest {

  /**
   * @override
   */
  protected speech = EngineConst.Speech.DEEP;

  /**
   * Tests if speech strings computed directly for a MathML expression are
   * equivalent to those computed for enriched expressions.
   *
   * @override
   */
  public executeTest(expr: string) {
    const mml = Enrich.prepareMmlString(expr);
    const enr = System.toEnriched(mml);
    const ids = DomUtil.querySelectorAllByAttr(enr, 'data-semantic-id');
    for (let id of ids) {
      expect(id.hasAttribute('data-semantic-speech')).toBe(true);
    }
    const speechs = DomUtil.querySelectorAllByAttr(enr, 'data-semantic-speech');
    for (let speech of speechs) {
      expect(speech.hasAttribute('data-semantic-id')).toBe(true);
    }
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
    this.blacklist.forEach((attr) => {
      xml.removeAttribute(attr);
      const removes = DomUtil.querySelectorAllByAttr(xml, attr);
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
 * Testcases for reconstructing semantic trees from enriched mathml.
 */
export class RebuildEnrichedTest extends SemanticBlacklistTest {

  /**
   * @override
   */
  protected blacklist: string[] = [
    'data-semantic-collapsed',
    'fencepointer'
  ];

  /**
   * @override
   */
  public pickFields = ['input'];

  /**
   * Tests if enrichment is idempotent.
   *
   * @param expr MathML expression.
   */
  public executeTest(expr: string) {
    const original = this.semanticTree(expr);
    const enriched = this.enrichMml(expr);
    const newTree = this.semanticTree(enriched.toString());
    let oldXml = original.xml();
    let newXml = newTree.xml();
    this.customizeXml(oldXml);
    this.customizeXml(newXml);
    this.assert.equal(oldXml.toString(), newXml.toString());
  }


  /**
   * Semantically enriches a mathml expression.
   *
   * @param {string} expr The mathml expression.
   */
  private semanticTree(expr: string) {
    const mathMl = Enrich.prepareMmlString(expr);
    const mml = DomUtil.parseInput(mathMl);
    const stree = new SemanticTree(mml);
    this.canonicalize(stree);
    return stree;
  }

  /**
   * Semantically enriches a mathml expression.
   *
   * @param {string} expr The mathml expression.
   */
  private enrichMml(expr: string) {
    const mathMl = Enrich.prepareMmlString(expr);
    const mml = DomUtil.parseInput(mathMl);
    const stree = new SemanticTree(mml);
    this.canonicalize(stree);
    return enrich(mml, stree);
  }

  /**
   * Renumbers the tree in a canonical depth-first order.
   *
   * @param {SemanticTree} stree The semantic tree.
   */
  private canonicalize(stree: SemanticTree) {
    let id = 0;
    const processed = new Map();
    let nodes = [stree.root];
    while (nodes.length) {
      let node = nodes.shift();
      if (processed.get(node)) continue;
      nodes = nodes.concat(node.contentNodes, node.childNodes);
      node.id = id++;
      processed.set(node, true);
    }
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
    const mathMl = Enrich.prepareMmlString(mml);
    const node = DomUtil.parseInput(mathMl);
    const sxml = new SemanticTree(node).xml(opt_brief);
    const xmls = new xmldom.XMLSerializer();
    this.customizeXml(sxml);
    const dp = new xmldom.DOMParser();
    const xml = dp.parseFromString(this.prepareStree(sml), 'text/xml');
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
}

/**
 * Tests for enriched MathML expressions.
 */
export class EnrichMathmlTest extends SemanticBlacklistTest {

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
    const mathMl = Enrich.prepareMmlString(mml);
    const node = Enrich.semanticMathmlSync(mathMl);
    const dp = new xmldom.DOMParser();
    const xml = smml ? dp.parseFromString(smml) : '';
    const xmls = new xmldom.XMLSerializer();
    this.customizeXml(node);
    this.appendExamples('', mml);
    const cleaned = removeAttributePrefix(xmls.serializeToString(node));
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

  private xmls = new xmldom.XMLSerializer().serializeToString;

  /**
   * Tests if for a given mathml snippet results in a particular semantic tree.
   *
   * @param expr MathML expression.
   */
  public executeTest(expr: string) {
    const mathMl = Enrich.prepareMmlString(expr);
    const mml = DomUtil.parseInput(mathMl);
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
      this.xmls(Semantic.xmlTree(mml))
    );
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
      this.xmls(Semantic.xmlTree(mml))
    );
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
      this.xmls(Semantic.getTree(mml).xml())
    );
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
    const mathMl = Enrich.prepareMmlString(expr);
    const mml = DomUtil.parseInput(mathMl);
    const stree = new SemanticTree(mml);
    const xml = stree.xml();
    this.assert.equal(
      xml.toString(),
      SemanticTree.fromXml(xml).xml().toString()
    );
  }
}
