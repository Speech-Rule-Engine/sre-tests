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
import {JsonTests} from '../base/test_util';
import {AbstractJsonTest} from '../classes/abstract_test';
// import {JsonTest, JsonTests, TestUtil} from '../base/test_util';
import {get} from '../classes/test_factory';
import * as FC from './fire_constants';
import * as FU from './fire_util';

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
  let testMap: JsonTests = {};
  let order = testcases.inputTests.map(x => {
    testMap[x.name] = x;
    return x.name;
  });
  FU.uploadData(db, collection, testcases['jsonFile'],
                {information: testcases.information,
                 name: testcases.jsonTests.name,
                 order: order,
                 tests: testMap
                });
  FU.setPath(db, collection, testcases['jsonFile']);
}

export async function info(db: any, collection: string) {
  const snapshot = await db.collection(collection).get();
  snapshot.forEach((doc: any) => {console.log(doc.id);});
}
