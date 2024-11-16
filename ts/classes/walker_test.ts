//
// Copyright 2016 Volker Sorge
//
//
// Copyright (c) 2016 Progressive Accessibility Solutions
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
 * @file Tests for walkers.
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import * as EngineConst from '#sre/common/engine_const.js';
import * as System from '#sre/common/system.js';
import { Walker } from '#sre/walker/walker.js';
import { TableWalker } from '#sre/walker/table_walker.js';
import * as DomUtil from '#sre/common/dom_util.js';
import * as WalkerFactory from '#sre/walker/walker_factory.js';
import * as SpeechGeneratorFactory from '#sre/speech_generator/speech_generator_factory.js';
import { Highlighter } from '#sre/highlighter/highlighter.js';
import * as HighlighterFactory from '#sre/highlighter/highlighter_factory.js';

import { AbstractJsonTest } from '../classes/abstract_test.js';
import { Key } from './keycodes.js';

export class WalkerTest extends AbstractJsonTest {
  private walker: Walker;

  /**
   * @override
   */
  public constructor() {
    super();
    this.pickFields.push('modifier');
  }

  /**
   * @override
   */
  public prepare() {
    super.prepare();
    this.createWalker();
  }

  /**
   * @override
   */
  public async setUpTest() {
    return System.setupEngine({
      modality: 'speech',
      locale: 'en',
      domain: 'mathspeak',
      style: 'default',
      speech: EngineConst.Speech.NONE
    });
  }

  // /**
  //  * Tests summary speech generation for different representations of the
  //  * quadratic formula.
  //  */
  // public testSummary() {
  //   [this.quadratic.mml, this.quadratic.htmlCss,
  //    this.quadratic.chtml, this.quadratic.svg].forEach(
  //      this.executeSummaryQuadraticTest_.bind(this));
  // }

  /**
   * Executes single walker moves and tests the resulting speech.
   *
   * @param move The move of the walker.
   * @param result The expected result.
   * @param modifier
   */
  public executeTest(
    move: string | null,
    result: string | null,
    modifier = false
  ) {
    (this.walker as TableWalker).modifier = modifier;
    if (move) {
      this.walker.move(Key.get(move));
    }
    this.assert.equal(this.walker.speech(), result);
  }

  /**
   * @override
   */
  public method() {
    this.executeTest(
      this.field('input'),
      this.field('expected'),
      this.field('modifier')
    );
  }

  /**
   * Creates a walker.
   */
  private createWalker() {
    const renderer: { renderer: string; browser?: string } = {
      renderer: this.jsonTests['renderer']
    };
    const browser = this.jsonTests['browser'];
    if (browser) {
      renderer['browser'] = browser;
    }
    const expression = this.jsonTests['expression'];
    this.walker = WalkerFactory.walker(
      this.jsonTests['walker'],
      DomUtil.parseInput(this.baseTests['inputs'][expression]),
      SpeechGeneratorFactory.generator(this.jsonTests['generator']),
      HighlighterFactory.highlighter(
        { color: 'black' },
        { color: 'white' },
        renderer
      ) as Highlighter,
      this.baseTests['inputs'][expression.replace(/_.*$/, '_Mml')]
    );
  }
}

import * as Enrich from '#sre/enrich_mathml/enrich.js';
import { enrich } from '#sre/enrich_mathml/enrich_mathml.js';
import { SemanticTree } from '#sre/semantic_tree/semantic_tree.js';
import { SemanticSkeleton } from '#sre/semantic_tree/semantic_skeleton.js'

/**
 *
 * Semantic Skeleton and walking structure related functionality and tests.
 *
 */
// Full DFS exploration of the semantic tree using a syntax table walker.
export class ExplorationTest extends AbstractJsonTest {

  private walker: Walker;

  /**
   * @override
   */
  public method() {
    this.executeTest(
      this.field('input'),
      this.field('expected')
    );
  }

  /**
   * @override
   */
  public executeTest(expr: string, expected: number[] | number) {
    const mml = DomUtil.parseInput(Enrich.prepareMmlString(expr));
    const stree = new SemanticTree(mml);
    const emml = enrich(mml, stree);
    this.walker = WalkerFactory.walker(
      'table',
      emml,
      SpeechGeneratorFactory.generator('dummy'),
      HighlighterFactory.highlighter(
        { color: 'black' },
        { color: 'white' },
        { renderer: 'NativeMML'}),
      emml.toString()
    );
    // this.assert.equal(ExplorationTest.dfs(this.walker), expected);
    expect(ExplorationTest.dfs(this.walker)).toEqual(expected);
  }

  private static dfs(walker: Walker) {
    const id = (walker.getFocus() as any).primary.id;
    let result = id;
    if (walker.move(Key.get('DOWN'))) {
      result = [result, ExplorationTest.dfs(walker)];
    } else {
      return result;
    }
  while (walker.move(Key.get('RIGHT'))) {
    result.push(ExplorationTest.dfs(walker));
  }
  walker.move(Key.get('UP'));
  return result;
  }

}

export class SemanticSkeletonTest extends AbstractJsonTest {

  private walker: Walker;

  /**
   * @override
   */
  public method() {
    this.executeTest(
      this.field('input')
    );
  }

  /**
   * @override
   */
  public executeTest(expr: string) {
    const mml = DomUtil.parseInput(Enrich.prepareMmlString(expr));
    const stree = new SemanticTree(mml);
    const emml = enrich(mml, stree);
    this.walker = WalkerFactory.walker(
      'table',
      emml,
      SpeechGeneratorFactory.generator('dummy'),
      HighlighterFactory.highlighter(
        { color: 'black' },
        { color: 'white' },
        { renderer: 'NativeMML'}),
      emml.toString()
    );
    const explore = this.explore();
    const structure = SemanticSkeleton.fromStructure(
      this.walker.getXml(), this.walker.getRebuilt().stree).toString()
    this.assert.equal(
      explore,
      structure
    );
  }

  private explore() {
    return SemanticSkeletonTest.makeString(
      SemanticSkeletonTest.dfs(this.walker)
    );
  }
  
  private static dfs(walker: Walker) {
    const id = (walker.getFocus() as any).primary.id;
    let result = id;
    if (walker.move(Key.get('DOWN'))) {
      result = [result, SemanticSkeletonTest.dfs(walker)];
    } else {
      return result;
    }
  while (walker.move(Key.get('RIGHT'))) {
    result.push(SemanticSkeletonTest.dfs(walker));
  }
  walker.move(Key.get('UP'));
  return result;
  }

  private static makeString(sexp: number[] | number): string {
    if (Array.isArray(sexp)) {
      return `(${sexp.map(SemanticSkeletonTest.makeString).join(' ')})`;
    }
    return sexp.toString();
  }


}
