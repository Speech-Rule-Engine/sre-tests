export namespace DomUtil {
  export function parseInput(expr: string): Node;
  export function querySelectorAllByAttr(xml: string, attr: string): NodeList;
}

export namespace EventUtil {
  export const KeyCode: {[key: string]: number}
}

export interface Focus {
  getNodes(): Node[];
}

export interface Walker {
  modifier: boolean;
  activate(): void;
  deactivate(): void;
  speech(): string;
  move(key: number): boolean;
  getFocus(update?: boolean): Focus;
  update(options: {[key: string]: string}): void;
}

// Speech rule related interface
declare class Component {
  attributes: {[key: string]: string};
}

declare class Action {
  attributes: {[key: string]: string};
  hasType(str: string): boolean;
  localizable(): boolean;
}

declare class Rule {
  components: Component[];
  getAttributes(): string[];
  grammarToString(): string;
  attributesToString(): string;
}

declare class Precondition {
  constraints: string[];
  query: string;
}

export interface SpeechRuleStore {
  domain: string;
  modality: string;
  locale: string;
  speechRules_: SpeechRule[];
}

export class DynamicConstraint {
  getValues(): string[];
}

export class SpeechRule {
  dynamicCstr: DynamicConstraint;
  precondition: Precondition;
  action: Action;
  localizable(): boolean;
  hasType(str: string): boolean;
}

export namespace SpeechRule {
  enum Type { NODE, MULTI, PERSONALITY, TEXT }
}


export namespace SpeechRule.Component {
  export function fromString(str: string): Rule;
  export function grammarFromString(str: string): Rule;
  export function attributesFromString(str: string): void;
}
  

export namespace SpeechRule.Action {
  export function fromString(str: string): Rule;
  export function hasType(str: string): boolean;
}


// Walker related factories
export interface SpeechGenerator {
  generateSpeech(node: HTMLElement, xml: HTMLElement): void;
  setOptions(options: Object): void;
  getOptions(): {[key: string]: string};
}

type ChannelColor = {red: number, green: number, blue: number, alpha?: number}
type NamedColor = {color: string, alpha?: number};
export type colorType = ChannelColor | NamedColor;
type colorString = {foreground: string, background: string};

export interface Highlighter {
  highlight(nodes: Node[]): void;
  unhighlight(): void;
  highlightAll(node: Node): void;
  unhighlightAll(node: Node): void;
  colorString(): colorString;
  isMactionNode(node: Node): boolean;
  colorizeAll(node: Node): void;
  uncolorizeAll(node: Node): void;
}

export namespace WalkerFactory {
  export function walker(kind: string,
                         node: Node,
                         generator: SpeechGenerator,
                         highlighter: Highlighter,
                         mml: string): Walker;
}

export namespace SpeechGeneratorFactory {
  export function generator(kind: string): SpeechGenerator;
}

export namespace HighlighterFactory {

  export function highlighter(fore: colorType,
                              back: colorType,
                              info: {renderer: string, browser?: string}
                             ): Highlighter;

}

export interface Trie {

  locale: string;
  json(): any;
  collectRules(): SpeechRule[];
  singleStyle(style: string): SpeechRule[];
  getSingletonDynamic_(): any;
  byConstraint(c1: any): any;
}


// System and Engine related entries
type config = {
  locale?: string,
  modality?: string,
  domain?: string,
  style?: string,
  markup?: string,
  speech?: string,
  semantics?: boolean,
  cache?: boolean
};

export namespace Engine {
  export const DOMAIN_TO_STYLES: {[rules: string]: string};
  export const Markup: {[rules: string]: string};
  export const Speech: {[rules: string]: string};
  export function isReady(): boolean;
  export function getInstance(): config;
}


declare class sre {
  toEnriched(mml: string): Node;
  toDescription(mml: string): string[];  // This type is fake!
  setupEngine(obj: config): void;
  engineSetup(): config;
}

export namespace System {
  export function getInstance(): sre;
}


// Rest
declare class AudioRenderer {
  markup(descrs: string[]): string;
}

export namespace AuralRendering {
  export function getInstance(): AudioRenderer;
}

export class ColorPicker {
  constructor(color: colorType);
  rgba(): colorString;
}

export class SemanticAnnotator {}

export class SemanticVisitor {}
