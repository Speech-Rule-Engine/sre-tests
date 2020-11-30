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
 * @fileoverview Utilities for firebase that work both in node and web.
 *
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import {JsonTest, JsonTests} from '../base/test_util';
import * as FC from './fire_constants';

/**
 * Verbosity flag.
 */
export let verbose: boolean = true;

/**
 * Output method for controlling verbosity.
 * @param {string} str The output string.
 */
function output(str: string) {
  if (verbose) {
    console.log(str);
  }
}

/**
 * Uploads an entire data set to firebase.
 * @param {any} db The database.
 * @param {string} collection The collection to add data to.
 * @param {string} doc The document to add data to.
 * @param {any} data The data to upload.
 */
export async function uploadData(db: any, collection: string,
                                 doc: string, data: any) {
  db.collection(collection).doc(doc).set(data).
    then(() => {
      output(`Data for document ${doc} successfully uploaded to collection ${collection}`);
    }).
    catch((error: Error) => {
      output(`Uploading data to document ${doc} in collection ${collection} failed with: ${error}`);
    });
}

/**
 * Updates data in a nested firebase entry.
 * @param {any} db The database.
 * @param {string} collection The collection to add data to.
 * @param {string} path The path to the data to update.
 * @param {any} data The data to upload.
 */
export async function updateData(db: any, collection: string,
                                 path: string, data: any, nesting: string[]) {
  let entry: JsonTest = {};
  let key = nesting.join('.');
  entry[key] = data;
  db.collection(collection).doc(path).update(entry).
    then(() => {
      output(`Data successfully updated in collection ${collection} with path ${path}`);
    }).
    catch((error: Error) => {
      output(`Updating data in collection ${collection} with path ${path} failed with: ${error}`);
    });
}

/**
 * Downloads data from a document specified by a path.
 * @param {any} db The database.
 * @param {string} collection The collection containing the document.
 * @param {string} path The path to the data to download.
 * @return The data content.
 */
export async function downloadData(db: any, collection: string, path: string) {
  let doc = await db.collection(collection).doc(path).get();
  return doc.data();
}

/**
 * Sets the path Downloads data from a document specified by a path.
 * @param {any} db The database.
 * @param {string} collection The collection containing the document.
 * @param {string} path The path to the data to download.
 */
export async function setPath(db: any, collection: string, path: string) {
  let doc = path.split('/')[0];
  let paths = await db.collection(collection).doc(doc).get();
  let data = paths.data();
  if (!data) {
    data = {};
  }
  data[path] = true;
  uploadData(db, collection, doc, data);
}

/**
 * Retrieves all paths for a given document in a collection.
 * @param {any} db The database.
 * @param {string} collection The collection containing the document.
 * @param {string} doc The document name.
 * @return The paths object.
 */
export async function getPaths(db: any, collection: string, doc: string) {
  let path = doc.split('/')[0];
  let paths = await db.collection(collection).doc(path).get();
  return paths.data();
}

/**
 * Updates data in collection B from collection A for a given document.
 * @param {any} db The databae.
 * @param {string} collA Source collection.
 * @param {string} collB Target collection.
 * @param {string} doc The document to update.
 * @return List of info on loaded documents.
 */
export async function updateCollection(
  db: any, collA: string, collB: string, doc: string) {
  let result: {name: string, information: string, path: string}[] = [];
  let paths = await getPaths(db, collA, doc);
  if (!paths) {
    return result;
  }
  for (let path of Object.keys(paths)) {
    let dataA = await downloadData(db, collA, path);
    let dataB = await downloadData(db, collB, path);
    result.push({
      name: dataA.name,
      information: dataA.information,
      path: path
    });
    if (!dataB) {
      setTestsStatus(dataA);
      await uploadData(db, collB, path, dataA);
      await setPath(db, collB, path);
      continue;
    }
    // Update single entries.
    let tests = dataB.tests;
    for (let key of dataA.order) {
      if (tests[key]) {
        continue;
      }
      let entryA: JsonTest = dataA.tests[key];
      setStatus(entryA);
      await updateData(db, collB, path, entryA, ['tests', key]);
    }
    await updateData(db, collB, path, dataA.order, ['order']);
  }
  return result;
}

/**
 * Sets the status of all tests to new.
 * @param {JsonTests} tests The tests object.
 */
function setTestsStatus(tests: JsonTests) {
  for (let entry of Object.values(tests.tests)) {
    setStatus(entry);
  }
}

/**
 * Sets the status of a single test entry to new.
 * @param {JsonTest} entry The test entry.
 */
function setStatus(entry: JsonTest) {
  entry[FC.Interaction] = FC.Status.NEW;
}
