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
 * @fileoverview Transformers for TeX input.
 *
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import {liteAdaptor} from '../../node_modules/mathjax-full/js/adaptors/liteAdaptor';
import {STATE} from '../../node_modules/mathjax-full/js/core/MathItem';
import {SerializedMmlVisitor} from '../../node_modules/mathjax-full/js/core/MmlTree/SerializedMmlVisitor';
import {RegisterHTMLHandler} from '../../node_modules/mathjax-full/js/handlers/html';
import {TeX} from '../../node_modules/mathjax-full/js/input/tex';
import {AllPackages} from '../../node_modules/mathjax-full/js/input/tex/AllPackages';
import {mathjax} from '../../node_modules/mathjax-full/js/mathjax';
import {SVG} from '../../node_modules/mathjax-full/js/output/svg';
import {AbstractTransformer} from './transformers';

export class Tex2Mml extends AbstractTransformer {

  /**
   * @override
   */
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
