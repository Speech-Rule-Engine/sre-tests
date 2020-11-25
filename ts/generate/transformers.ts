// Copyright 2020 Volker Sorge
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
 * @fileoverview Transformers to translate fields in test specifications.
 *
 * @author volker.sorge@gmail.com (Volker Sorge)
 */


import {mathjax} from '../../node_modules/mathjax-full/js/mathjax';
import {TeX} from '../../node_modules/mathjax-full/js/input/tex';
import {RegisterHTMLHandler} from '../../node_modules/mathjax-full/js/handlers/html';
import {liteAdaptor} from '../../node_modules/mathjax-full/js/adaptors/liteAdaptor';
import {AllPackages} from '../../node_modules/mathjax-full/js/input/tex/AllPackages';
import {STATE} from '../../node_modules/mathjax-full/js/core/MathItem';
import {SVG} from '../../node_modules/mathjax-full/js/output/svg';
import {SerializedMmlVisitor} from '../../node_modules/mathjax-full/js/core/MmlTree/SerializedMmlVisitor';

/**
 * Interface for test transformers.
 */
export interface Transformer {

  /**
   * Source field to transform from.
   */
  src: string;

  /**
   * Destination field to transform to.
   */
  dst: string;

  /**
   * Transformer method.
   */
  via: (src: string) => string;
  
}

abstract class AbstractTransformer implements Transformer {

  constructor(public src: string, public dst: string) {}

  /**
   * @override
   */
  public via(src: string) {
    return src;
  }
}


export class Tex2Mml extends AbstractTransformer {

  constructor(src: string = 'tex', dst: string = 'input') {
    super(src, dst);
  }

  /**
   * @override
   */
  public via(src: string) {
    return this.tex2mml(src);
  }

  private tex2mml(input: string) {
    RegisterHTMLHandler(liteAdaptor());
    let document = mathjax.document('<html></html>', {
      InputJax: new TeX({packages: AllPackages}),
      OutputJax: new SVG()
    });
    let visitor = new SerializedMmlVisitor();
    let math = document.convert(input, {end: STATE.CONVERT});
    let str = visitor.visitTree(math);
    return str.replace(/>\n *</g, '><');
  }
  
}

abstract class BrailleTransformer extends AbstractTransformer {

  protected format = {
    NABT: ' A1B\'K2L@CIF/MSP"E3H9O6R^DJG>NTQ,*5<-U8V.%[$+X!&;:4\\0Z7(_?W]#Y)=',
    BLDT: ' a1b\'k2l`cif/msp"e3h9o6r~djg>ntq,*5<-u8v.%{$+x!&;:4|0z7(_?w}#y)='
  }

  protected translate: Map<string, string> = new Map();

  protected getFormat() {
    return (this.kind === 'NABT' ? this.format.NABT : this.format.BLDT)
  }

  protected abstract setupMap(): void;

  constructor(private _kind: string = 'BLDT',
              src: string = 'brf', dst: string = 'output') {
    super(src, dst);
    this.kind = this._kind;
  }

  public get kind() {
    return this._kind;
  }
  
  public set kind(kind: string) {
    this._kind = kind;
    this.translate = new Map();
    this.setupMap();
  }
  
  /**
   * @override
   */
  public via(src: string) {
    let result = '';
    for (let str of src.split('')) {
      let dst = this.translate.get(str);
      if (!dst) {
        throw new Error('Illegal input character: ' + str);
      }
      result += dst;
    }
    return result;
  }

}

export class Unicode2Brf extends BrailleTransformer {

  protected setupMap() {
    let count = 0;
    for (let str of this.getFormat().split('')) {
      this.translate.set(String.fromCodePoint(0x2800 + count++), str);
    }
  }

}

export class Brf2Unicode extends BrailleTransformer {

  protected setupMap() {
    let count = 0;
    for (let str of this.getFormat().split('')) {
      this.translate.set(str, String.fromCodePoint(0x2800 + count++));
    }
  }

}
