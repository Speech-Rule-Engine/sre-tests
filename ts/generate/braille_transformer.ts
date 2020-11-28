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
 * @fileoverview Transformers for Braille formats and input.
 *
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import {AbstractTransformer} from './transformers';

abstract class BrailleTransformer extends AbstractTransformer {

  protected static format = {
    NABT: ' A1B\'K2L@CIF/MSP"E3H9O6R^DJG>NTQ,*5<-U8V.%[$+X!&;:4\\0Z7(_?W]#Y)=',
    BLDT: ' a1b\'k2l`cif/msp"e3h9o6r~djg>ntq,*5<-u8v.%{$+x!&;:4|0z7(_?w}#y)='
  }

  protected static getFormat(kind: string) {
    return (kind === 'NABT' ? BrailleTransformer.format.NABT :
      BrailleTransformer.format.BLDT)
  }

  protected translate: Map<string, string> = new Map();

  /**
   * Sets up the brf to unicode map.
   */
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
    this.translate.clear();
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

  /**
   * @override
   */
  protected setupMap() {
    let count = 0;
    for (let str of BrailleTransformer.getFormat(this.kind).split('')) {
      this.translate.set(String.fromCodePoint(0x2800 + count++), str);
    }
  }

}

export class Brf2Unicode extends BrailleTransformer {

  /**
   * @override
   */
  protected setupMap() {
    let count = 0;
    for (let str of BrailleTransformer.getFormat(this.kind).split('')) {
      this.translate.set(str, String.fromCodePoint(0x2800 + count++));
    }
  }

}
