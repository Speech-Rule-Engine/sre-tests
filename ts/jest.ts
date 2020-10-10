// import {ExampleFiles} from './classes/abstract_examples';
import {get} from './classes/test_factory';

/**
 * Runs tests for a json file.
 * @param file The filename.
 */
export function runJsonTest(file: string) {
  let testcases = get(file);
  if (!testcases) {
    return;
  }
  testcases.prepare();
  // afterAll(() => {
  //   ExampleFiles.closeFiles();
  // });
  beforeEach(() => {
    testcases.setUpTest();
  });
  afterEach(() => {
    testcases.tearDownTest();
  });
  describe(testcases.information,
           () => {
             for (let testcase of testcases.inputTests) {
               if (!testcase.test) {
                 continue;
               }
               test(testcase.name, () => {
                 testcases.method.bind(testcases).
                   apply(null, testcases.pick(testcase));
               });
             }
           });
}
