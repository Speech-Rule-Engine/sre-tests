import * as fs from 'fs';
import * as assert from 'assert';
import { TestRunner } from './js/base/runner.js';
import { XplatSpeech, XplatSemantic } from './js/classes/xplatmath_test.js';
import { TestPath, TestUtil } from './js/base/test_util.js';
let _test = await import('./speech-rule-engine/lib/app.js');


function loadTests(files, factory) {
  let str = TestUtil.cleanFiles(TestUtil.readDir(files));
  return str.
    map(x => TestUtil.fileExists(x, TestPath.EXPECTED)).
    map(x => [x, JSON.parse(fs.readFileSync(x))]).
    filter(([, x]) => x.factory === factory);
}

function getSemanticTests() {
  return loadTests('semantic/semantic_tree/', 'stree').
    map(([file, test]) => {
      const semanticTest = new XplatSemantic();
      semanticTest.jsonFile = file;
      semanticTest.jsonTests = test;
      return semanticTest;
    });
}

function getSpeechTests() {
  return loadTests('en/mathspeak/', 'speech').
    map(([file, test]) => {
      const speechTest = new XplatSpeech();
      speechTest.jsonFile = file;
      speechTest.jsonTests = test;
      return speechTest;
    });
}


let input = JSON.parse(fs.readFileSync('./input/mathspeak/mathspeak_test.json'));
let expected = JSON.parse(fs.readFileSync('./expected/en/mathspeak/mathspeak_test.json'));

let speechTest = new XplatSpeech();
speechTest.jsonFile = './expected/en/mathspeak/mathspeak_test.json';
speechTest.jsonTests = expected;


// console.log(input);
// console.log(expected);
// input = JSON.parse(fs.readFileSync('./input/semantic/base.json'));
// expected = JSON.parse(fs.readFileSync('./expected/semantic/semantic_tree/base.json'));

// let semanticTest = new XplatSemantic();
// semanticTest.jsonFile = './expected/semantic/semantic_tree/base.json';
// semanticTest.jsonTests = expected;

let promise = await Sre.setup({
  locale: expected.locale || 'en',
  domain: expected.domain || 'mathspeak',
  style: expected.preference || 'default',
});

let runner = new TestRunner();

// let semanticTests = getSemanticTests();
// semanticTests.forEach(x => runner.registerTest(x));
let speechTests = getSpeechTests();
console.log(speechTests.length);
speechTests.forEach(x => runner.registerTest(x));

runner.runTests();

// for (let [name, expt] of Object.entries(expected.tests)) {
//   if (name.match(/^_comment/)) {
//     continue;
//   }
//   let inp = input.tests[name];
//   if (inp && inp.test !== false) {
//     let promise = await Sre.setup({
//       style: inp.preference || 'default',
//     });
//     let speech = Sre.speech(`<math>${inp.input}</math>`);
//     assert.equal(speech, expt.expected);
//   }
// }


