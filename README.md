# Tests for Speech Rule Engine

This is a separate repository for maintaining and running tests for [Speech Rule Engine](https://speechruleengine.org).

The majority of tests is available in a JSON format.

## JSON format

``` json
{
  "factory": "Mandatory",
  "information": "Optional but recommended",
  "name": "Optional, necessary for analytics only",
  "base": "Optional filename",
  "active": "Optional filename for test output",
  "exclude": [],
  "_commentX_": "Optional",
  ... other test class specific entries
  "tests": "ALL" |
    {
    "test1": {
        "test": true|false,
        "input": "Optional",
        "expected": "Mandatory test output"
        ... other test specific fields
        }
    ... More uniquely named tests
    }
}
```

### Class Fields

| Field         | Required    | Usage                                                              |
| -----         | ----        | :-------                                                           |
| `factory`     | Mandatory   | Specifies the test class factory entry that is used for this test. |
| `information` | Recommended | Information on the test used as description for JEST testsuites.   |
|               |             | See below for description conventions                              |
| `name`        | Optional    | Name of the testsuite. This is necessary for analytics only,       |
|               |             | Analytics files are use this name as prefix and only tests         |
|               |             | that contain a `name` field will be compiled for analytics.        |
|               |             | Consequently, names should be unique. See below for conventions.   |
| `base`        | Optional    | Filename of the input file if this is _input test_.                |
|               |             | This is either an absolute path or relative to the input folder.   |
| `active`      | Optional    | Target filename for tests that produce output.                     |
|               |             | It is used to compile output tests and does not have to be unique. |
|               |             | This is either an absolute path or relative to the ouptut folder.  |
| `exclude`     | Optional    | List of tests to be excluded. Useful if loading from `base` files. |
| `tests`       | Mandatory   | `"ALL"` or Association list of named tests.                        |
|               |             | In case of an _input test_ `"ALL"` specifies that all tests from   |
|               |             | the base file should be run for the given test class.              |
| `...`         | Optional    | Other fields needed to intialise the test class.                   |



### Test Fields

| Field      | Required  | Usage                                                           |
| -----      | ----      | :-------                                                        |
| `test`     | Optional  | Boolean specifying if the test should be run. Default is `true` |
| `input`    | Mandatory | Input for the tests.                                            |
| `expected` | Optional  | The expected output. Can be omitted, for example, in the case   |
|            |           | of tests that compare output for two methods.                   |
| `...`      | Optional  | Other fields that are needed to run a test.                     |


### Input vs Expected only tests

We distinguish _input tests_ and _expected only tests_. The latter contain all
the information for the test in the single JSON object, while the former load
input information from a common `base` file, generally given in the `input`
directory.

The structure of `base` files is similar to the `expected` files. `expected`
 can suppress running of certain tests using the `excluded` field.  Fields
from the expected file overwrite those of the input file.

The non-JEST test runner outputs warnings in case input tests have no expected
value and are not explicitly excluded.

### Names

* `name`: Names are used as prefixes for output in the analytics module. As the
  output structure is flat, they should be unique. For speech rule tests they
  should be of the form `${Locale}${Domain}${Type}` and camel cased.
* `information` entries of speech rule tests are of a similar form: `"${Locale}
  ${Domain} ${Description}"`
* Names and information entries of other tests follow a similar pattern,
  starting with the description of the common aspect moving to the more
  specialised one. E.g.,


## Running Tests via Jest

There are multiple ways to run tests for SRE.

1. From within the `speech-rule-engine` repository with `sre-tests` as `git
   submodule`.
1. From within the `speech-rule-engine` repository with a local copy of the
   `sre-tests` repository.
1. From within the `sre-tests` repository with respect to a local copy of the
   `speech-rule-engine` repository.

The last case is the most common one used during development and is therefore described first.

### Local Tests in `sre-tests` Repo

First we need to tell the tests repo where SRE is located locally. This is by
setting the `SRE_JSON_PATH` variable, e.g., as

``` shell
export SRE_JSON_PATH=../speech-rule-engine/lib/mathmaps
```

**Note, that setting this path can lead to unpredictable behaviour if running SRE in that shell.**


``` shell
npm run prepare
```
will build all the necessary files for the tests as well as for analytics. Those
files will be

``` shell
npm run test
```
runs tests separately without producing output. So there are no interactions between single test suites.

``` shell
npm run test-output
```
runs output producing tests only. Combines tests that share common output files into a single suite.

``` shell
npm run test-all
```
runs first singleton tests and then output producing tests.

``` shell
npm run clean
```
Removes all files generated by transpiling and testing.

#### Running locales or subsets of tests

``` shell
npx jest --testPathPattern js/json/de/
```
will run German locale only.

``` shell
npx jest --testPathPattern js/json/de/clearspeak js/json/base
```
will run Clearspeak German tests and base tests. Generally the switch `--testPathPattern` can be omitted. E.g., 

``` shell
npx jest js/output
```

will run all the test that produce output files.

### Running Tests via Make in the SRE repository

Run with
``` shell
make test (ENV=n)
```

`ENV` are optional environment parameters.



## Directory structure

### Basic structure

    ├── expected  JSON files with expected output of tests
    ├── input     JSON files with input of tests
    ├── output    Output files generated by tests (mainly HTML files)
    └── ts       Source files for tests

### Source directory structure

Source directory effectively consists of two parts:

1. Static sources that are used in test classes or for auxiliary task such as
   analytics or test generation.
2. Dynamic sources that are generated by the `tests.config.js` script and that
   actually run tests.

#### Static sources

    └── ts
        ├── analytics  Classes and utilities that run analytics on SRE.
        ├── base       Common files used by test classes.
        ├── classes    Classes for tests that take input and expected from JSON files.
        ├── generate   Utility methods to generate JSON test files from various sources.
        ├── tests      Test Classes that run tests via test functions.
        └── typings    Contains type definitions, e.g. for SRE.

#### Dynamic Sources

These sources are generated by running `npm run prepare` or the `build` function
from `tests.config.js`. They are removed with the `clean` function. The
generated files are of type `.test.ts` so they can be run with `jest` directly.

    └── ts
        ├── analyse    Files for running SRE analytics. There is on test file for every
        │              `.json` file that contains a `name` entry in the `expected` directory.
        │              Subdirectory structure is a mirror of the one in `expected`.
        ├── json       Runs all tests. There is one test file per `.json` file in the `expected` directory.
        │              Subdirectory structure is a mirror of the one in `expected`.
        │              Subdirectory structure is a mirror of the one in `expected`.
        └── output     Files for running tests that produce output. There is one file for each unique
                       entry given in the `active` field for test input files. That is, often multiple
                       test files are combined and run to generate on output file.
                       The directory structure is flat.


### Components of the Input directory

    └── input
        ├── base        Basic tests for components of the engine.
        ├── clearspeak  Speech tests for clearspeak rules.
        ├── common      Speech tests for common use (e.g., fonts, units)
        ├── mathspeak   Speech tests for mathspeak rules.
        └── nemeth      Speech tests for (Nemeth) Braille.


### Components of the Expected directory

    └── expected
        ├── base        Expected values for basic tests.
        ├── locale_1    Expected values for speech tests of locale_1.
        │               ....
        └── locale_n    Expected values for speech tests of locale_n.


### Conent of Expected directories by locales

    └── expected
        └── locale
            ├── clearspeak  Expected values for clearspeak tests
            ├── mathspeak   Expected values for mathspeak tests.
            ├── others      Expected values for all other speech rule tests (e.g., prefix, summary)
            └── symbols     Expected values for symbol tests (character, function, unit)
        │   ...
        └── nemeth
            ├── rules       Expected values for nemeth rules
            └── symbols     Expected values for symbol tests (character, function, unit)


### Components of the Output directory


    └── expected
        │               Potentially other files (with various extensions).
        │               ....
        ├── locale_1    HTML output for speech tests of locale_1.
        │               ....
        └── locale_n    HTML output for speech tests of locale_n.

## Current structure

    ├── expected
    │   ├── base
    │   ├── de
    │   │   ├── clearspeak
    │   │   ├── mathspeak
    │   │   ├── others
    │   │   └── symbols
    │   ├── en
    │   │   ├── clearspeak
    │   │   ├── mathspeak
    │   │   ├── others
    │   │   └── symbols
    │   ├── es
    │   │   ├── mathspeak
    │   │   ├── others
    │   │   └── symbols
    │   ├── fr
    │   │   ├── clearspeak
    │   │   ├── mathspeak
    │   │   ├── others
    │   │   └── symbols
    │   └── nemeth
    │       ├── rules
    │       └── symbols
    ├── input
    │   ├── base
    │   ├── clearspeak
    │   ├── common
    │   ├── mathspeak
    │   └── nemeth
    ├── output
    │   ├── de
    │   ├── en
    │   │   ├── sheets
    │   │   └── symbols
    │   ├── es
    │   │   └── symbols
    │   ├── fr
    │   │   ├── functions
    │   │   ├── sheets
    │   │   ├── symbols
    │   │   └── units
    │   └── nemeth
    │       ├── functions
    │       ├── sheets
    │       ├── symbols
    │       └── units
    └── ts
        ├── base
        ├── classes
        └── tests


# Analytics



Run with

``` shell
npm run prepare
npm run test:analytics
```

This will generate SRE analytics in the `analysis` folder. In particular it will
generate the following subfolders, which contains json files of the following
nature:

    ├── allRules            List of all rules available in each rule set.
    ├── applicableRules     List of all applicable rules for each test run.
    ├── appliedRules        List of all actually applied rules for each test run.
    ├── diffAppliedRules    Difference list of rules applied and available for each rule set.
    │                       Full test coverage for a rule set means that this list is empty.
    └── uniqueAppliedRules  List of all unique rules applied during tests for test suite.


# Generators

## Working in Node

The majority of test generation, copying, etc. will be handled on the Node
REPL. There are two ways to ensure that all the necessary files in SRE can be found. 

1. Run node in a shell on where the `SRE_JSON_PATH` variable is set. Or start an
   Emacs that will run the REPL in such a shell.

2. Set the `SRE_JSON_PATH` environment variable explicitly in node. For example:

    ``` javascript
    process.env['SRE_JSON_PATH'] = '../speech-rule-engine/lib/mathmaps';
    let gt = require('./js/generate/generate_tests.js');
    ...
    ```

## Generating Tests

Simplest way is to generate tests from experimental data using input
transformers.  The standard use case is: You have a set of expressions from
experiments or investigating an issue. These should now be transformed into
tests. Simply combine them into a single json file like where `foo` and `bar`
represent names for the issue or type of experiment.

```javascript
{
  "foo": [d0, d1, d2, ....],
  "bar": [e0, e1, e2, ....],
  ...
}
```

These case can be loaded and transformed into a regular `JsonTests` structure
using method:

``` javascript
gt.generateTestJson(INPUT, OUTPUT, option FIELD);
```

This transforms the `INPUT` file sets into `OUTPUT` fof the form

```javascript
{
  "foo_0": {"field": d0},
  "foo_1": {"field": d1},
  "foo_2": {"field": d2},
  ...
  "bar_0": {"field": e0},
  "bar_1": {"field": e1},
  "bar_2": {"field": e2},
  ...
}
```

The optional `FIELD` parameter can be used to specify the target field in the
single tests.  E.g. for a set of tex expressions you might want to choose `tex`
as field so a transformer can be applied directly. `FIELD` defaults to `input`.

To further transform the tests, apply one or more transformers to the file:

``` javascript
gt.transformJsonTests(INPUT, gt.getTransformers(['tex']));
```

Applies a TeX transformer to all `tex` fields in `INPUT` resulting in an `input`
field with a mml expression, writing the output to the same file. Other useful
transformers are found in `braille_transformer.ts`.

## Filling Tests and Expected Values

Tests can be generated or regenerated using the `fill_tests` module:

``` javascript
let ft = require('./js/generate/fill_tests.js');
```

Each of the following commands takes an path to a file with expected values and
optionally a flag indicating if it is a dry run or if the changes are to be made
destructively to the input file.

| `addMissing`    | Adds expected values for all missing tests.          |
| `addActual`     | Overwrites all expected values with the actual ones. |
| `addFailed`     | Overwrites expected values for all failed tests.     |
| `removeMissing` | Removes tests in expected file that has been removed |
|                 | from the base file.                                  |

`showMissing` prints all missing tests for all available test files. Output can
be restricted by providing a regular expression for filtering filenames.

## Splitting Tests

Although test files that provide complete tests (i.e., containing both `input`
and `expected` elements plus all necessary parameters) can be run, it is often
useful to have separate files for `input` and `expected` values in the
respective directories. For example, when running speech rule tests all locales
can use a single base file. Likewise the different types of semantic
interpretation tests can share the same base file. 

Splitting a comprehensive file into a base file and one with `expected` entries
only is done by:

``` javascript
gt.splitExpected(EXPECTED, BASE);
```

The `EXPECTED` filename is considered relative to the `expected` directory. The
name of the new base file is absolute. Note that this file will be overwritten!
__So apply only once!__


## Symbol Tests

### Basic Symbol Tests

Basic tests are generated for each domain (`default, mathspeak,
clearspeak`). One file per symbol type: `character, function, unit,
si_unit`. These are reflected in the naming of the tests. All these tests are
for the `default` style/preference only.

### Special Symbol Tests

Extra tests are generated for all symbols that have an entry for non-default
styles in the `extras_...json` files. Note, that these files do not have a
corresponding entry in the `base` files. Note also, that each test entry comes
with its individual `domain` and `style` entry. Since one symbol can have
multiple entries, the `name` elements is made unique by concatenating the
`domain, style, symbol` and a special `key` entry is actually used to represent
the symbol. Finally, currently no extra tests are generated for `si_unit`.


### Re-generating Tests

``` javascript
let cto = require('./js/generate/char_test_output.js');
```
Make sure the `AllConstraints` variable is up to date for all locales, before loading and running: 

``` javascript
cto.allTests(?dir)
```

generates tests in `dir`. If not given in `/tmp/symbols`.

``` javascript
cto.replaceTests(?dir)
```

replaces expected tests output in the corresponding files of the
`sre-tests/expected` directory. Note, that `dir` corresponds to the directory of
test files generated by `allTests`.


### Detailed and type specific methods

The following exported methods can be useful for specific updating of symbol tests of a locale:

#### Test computations

These methods compute and return a JSON test structure. They take a `locale`
string and a `symbol type` string as input.

| `cto` method     | Usage                                                             |
| -----            | ----                                                              |
| `testFromBase`   | Compute the tests from the base file for this symbol type.        |
| `testFromLocale` | Compute the tests from the symbol files in the locale's mathmaps. |
| `testFromExtras` | Compute tests for all extra definitions (i.e., none default       |
|                  | style) for the symbol type in the locale.                         |


#### Test computations

These methods compute and save a JSON test structure. They take a `locale`
string and a `symbol type` string as input. Optionally they take a target
directory for the output, which defaults to `/tmp`.

| `cto` method           | Usage                                |
| -----                  | ----                                 |
| `testOutputFromBase`   | As `testFromBase`.                   |
| `testOutputFromLocale` | As `testFromLocale`.                 |
| `testOutputFromBoth`   | Calls both previous methods in turn. |
| `testOutputFromExtras` | As `testFromExtras`.                 |

`cto.testOutputFromBoth` and `cto.testOutputFromExtras` are called in `cto.allTests`.

splitNemethForFire
  diffBaseVsLocale





## L10n Tools

### Copying tests

``` javascript
let ct = require('./js/generate/copy_tests.js');
```

Methods to copy test files from existing tests for a locale to tests for a new
locale.  Replaces all expected test entries with the actual results of
tests. Hence can also overwrite already existing tests.

Simple message replacement for information, output and analysis files is carried
out. This assumes that these files are canonically named as described above.


``` javascript
ct.copyTestLocale('en/mathspeak/mathspeak_tests.json', 'it', 'English', 'Italian');
```

Copies Mathspeak tests in English to the Italian locale. Messages/filenames
containing `English` as substring are replaced with equivalents containing
`Italian`.

``` javascript
ct.copyTestLocaleDir('en/', 'it', 'English', 'Italian');
```

Recursively performs the above action on a subdirectory.

### Comparison

Show the difference between test files existing in locale directories.

``` javascript
ct.localeDifference('en', 'it');
```

## Semantic Tests

They normally reside in the `semantic` test directory. The actual tests consist
of six different types, therefore their expected files are given in six
different sub-directories:

1. `enrich_mathml`, translate to enriched Mathml output.
2. `enrich_speech`, test if speech strings computed directly for a MathML
   expression are equivalent to those computed for enriched expressions.
3. `rebuild_stree`, test if semantic trees build from enriched MathML
   expressions are equivalent to hose computed directly.
4. `semantic_api`, tests consistency of the various semantic APIs.
5. `semantic_tree`, translate into semantic trees.
6. `semantic_xml`, tests consistency of the semantic tree parser, i.e., parsing
   the XML output of the semantic tree results in the equivalent semantic tree.

Note that tests 2, 3, 4, and 6, usually run with respect to `"tests": "ALL"`.


### Copying tests

Given a base file `BASE` in the `input` directory, we can generate the basic
structure for the above tests using

``` javascript
ct.copySemanticTest(BASE);
```

Note, that neither the `semantic_tree` nor the `enrich_mathml` tests will be
filled with expected. This has to be done manually, e.g., using `ft.addMissing`.
