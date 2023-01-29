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
 * @file Transformers for TeX input.
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import { liteAdaptor } from '../../node_modules/mathjax-full/js/adaptors/liteAdaptor';
import { STATE } from '../../node_modules/mathjax-full/js/core/MathItem';
import { SerializedMmlVisitor } from '../../node_modules/mathjax-full/js/core/MmlTree/SerializedMmlVisitor';
import { RegisterHTMLHandler } from '../../node_modules/mathjax-full/js/handlers/html';
import { TeX } from '../../node_modules/mathjax-full/js/input/tex';
import { AllPackages } from '../../node_modules/mathjax-full/js/input/tex/AllPackages';
import { mathjax } from '../../node_modules/mathjax-full/js/mathjax';
import { SVG } from '../../node_modules/mathjax-full/js/output/svg';
import { AbstractTransformer } from './transformers';

export class Tex2Mml extends AbstractTransformer {
  /**
   * Display math input. Default is true.
   */
  public display: boolean = true;

  /**
   * Remove out layer of mml tags.
   */
  public short: boolean = true;

  private visitor = new SerializedMmlVisitor();
  private document: any = null;

  /**
   * @override
   */
  public constructor(src = 'tex', dst = 'input') {
    super(src, dst);
    RegisterHTMLHandler(liteAdaptor());
    this.document = mathjax.document('', {
      InputJax: new TeX({ packages: AllPackages }),
      OutputJax: new SVG()
    });
  }

  /**
   * @override
   */
  public via(src: string) {
    return this.tex2mml(src);
  }

  protected tex2mml(input: string) {
    const math = this.document.convert(input, {
      display: this.display,
      end: STATE.CONVERT
    });
    let str = this.visitor.visitTree(math);
    str = str.replace(/>\n *</g, '><');
    if (this.short) {
      str = str.replace(/^\s*<math[^>]*>/g, '').replace(/<\/math>$/g, '');
    }
    return str;
  }
}


export class TexMml2Mml extends Tex2Mml {

  /**
   * @override
   */
  public via(src: string) {
    return src.match(/^\s*<m.+>\s*$/) ? src : super.via(src);
  }

}
