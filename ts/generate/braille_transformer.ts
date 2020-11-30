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

import {AbstractTransformer, Transformer} from './transformers';

export interface BrailleTransformer extends Transformer {

  /**
   * What kind of Braille representation.
   */
  kind(): string;

}

abstract class BrfTransformer extends AbstractTransformer implements BrailleTransformer {

  /**
   * Translations for the brf tables.
   */
  protected static format = {
    NABT: ' a1b\'k2l@cif/msp"e3h9o6r^djg>ntq,*5<-u8v.%[$+x!&;:4\\0z7(_?w]#y)=',
    BLDT: ' a1b\'k2l`cif/msp"e3h9o6r~djg>ntq,*5<-u8v.%{$+x!&;:4|0z7(_?w}#y)='
  };

  /**
   * @override
   */
  public abstract kind(): string;

  /**
   * Translation map.
   */
  protected translate: Map<string, string> = new Map();

  /**
   * Get translation string for format.
   * @param kind The format.
   */
  protected static getFormat(kind: string) {
    return (kind.toUpperCase() === 'BLDT' ? BrfTransformer.format.BLDT :
      BrfTransformer.format.NABT);
  }

  /**
   * Sets up the brf to unicode map.
   */
  protected abstract setupMap(): void;

  /**
   * @override
   */
  constructor(src: string, dst: string) {
    super(src, dst);
    this.setupMap();
  }

  /**
   * @override
   */
  public via(src: string) {
    let result = '';
    for (let str of src.split('')) {
      let dst = this.translate.get(str.toLowerCase());
      if (!dst) {
        // TODO: Make this more informative! Maybe throw the error only at the
        // end, with position?
        throw new Error('Illegal input character: ' + str);
      }
      result += dst;
    }
    return result;
  }

}

abstract class Unicode2Brf extends BrfTransformer {
  
  /**
   * @override
   */
  constructor() {
    super('expected', '');
    this.dst = this.kind();
  }

  /**
   * @override
   */
  protected setupMap() {
    let count = 0;
    console.log(this.kind());
    for (let str of BrfTransformer.getFormat(this.kind()).split('')) {
      this.translate.set(String.fromCodePoint(0x2800 + count++), str);
    }
  }

}

abstract class Brf2Unicode extends BrfTransformer {

  /**
   * @override
   */
  constructor() {
    super('', 'expected');
    this.src = this.kind();
  }

  /**
   * @override
   */
  protected setupMap() {
    let count = 0;
    console.log(this.kind());
    for (let str of BrfTransformer.getFormat(this.kind()).split('')) {
      this.translate.set(str, String.fromCodePoint(0x2800 + count++));
    }
  }

}

export class Nabt2Unicode extends Brf2Unicode {

  /**
   * @override
   */
  public kind() {
    return 'NABT';
  }
}

export class Bldt2Unicode extends Brf2Unicode {

  /**
   * @override
   */
  public kind() {
    return 'BLDT';
  }
}

export class Unicode2Nabt extends Unicode2Brf {

  /**
   * @override
   */
  public kind() {
    return 'NABT';
  }
}

export class Unicode2Bldt extends Unicode2Brf {

  /**
   * @override
   */
  public kind() {
    return 'BLDT';
  }
}
