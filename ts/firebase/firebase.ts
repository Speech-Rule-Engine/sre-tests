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
 * @fileoverview Functionality to work server side with firebase, in particular
 *     to fill, update and harvest firestore.
 *
 * @author volker.sorge@gmail.com (Volker Sorge)
 */

import admin = require('firebase-admin');
import {AbstractJsonTest} from '../classes/abstract_test';
// import {JsonTest, JsonTests, TestUtil} from '../base/test_util';
import {get} from '../classes/test_factory';
import * as FC from './fire_constants';

export function initFirebase(
  credentials: string, url: string = FC.NemethUrl) {
  let serviceAccount = require(credentials);
  admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    databaseURL: url
  });
  return admin.firestore();
}

export async function uploadTest(db: any, file: string,
                                 collection: string = FC.TestsCollection) {
  let testcases: AbstractJsonTest = null;
  try {
    testcases = get(file);
  } catch (e) {
    console.log(`Problem loading test file ${file}: ` + e);
  }
  if (!testcases) {
    return;
  }
  testcases.prepare();
  let path = testcases['jsonFile'].split('/');
  db.collection(collection).doc(testcases['jsonFile']).set(
    {information: testcases.information,
     name: testcases.jsonTests.name,
     tests: testcases.inputTests
    }).
    then(() => {
    console.log(`Tests for ${file} successfully uploaded to collection ${collection}`);
    }).
    catch((error: Error) => {
      console.log(`Uploading ${file} to collection ${collection} failed with: ${error}`);
      return;
    });
  let paths = await db.collection(collection).doc(path[0]).get('paths');
  let data = paths.data();
  data[testcases['jsonFile']] = true;
  db.collection(collection).doc(path[0]).set({paths: data}).
    catch((error: Error) => {
      console.log(`Setting path failed for ${path[0]} with: ${error}`);
      return;
    });
}

export async function info(db: any, collection: string) {
  const snapshot = await db.collection(collection).get();
  snapshot.forEach((doc: any) => {console.log(doc.id);});
}
