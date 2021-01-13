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
import {JsonTests, TestUtil} from '../base/test_util';
import {AbstractJsonTest} from '../classes/abstract_test';
import {get} from '../classes/test_factory';
import * as FC from './fire_constants';
import * as FU from './fire_util';

/**
 * Inits the firebase communication
 *
 * @param {string} credentials File with credentials.
 * @param {string} url URL of the firebase.
 */
export function initFirebase(
  credentials: string, url: string = FC.NemethUrl) {
  let serviceAccount = require(credentials);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: url
  });
  return admin.firestore();
}

/**
 * Uploads tests to the firebase store.
 *
 * @param {any} db The firestore.
 * @param {string} file The test file to upload.
 * @param {string} collection The collection name.
 */
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
  FU.setPath(db, collection, testcases['jsonFile'],
             [testcases.jsonTests.name, testcases.information]);
}

/**
 * @return Promise with the list of uids.
 */
export async function getUsers() {
  let users = await admin.auth().listUsers();
  return users.users.map(y => y.uid);
}

// This forces an update of a field for every user. Be careful!
/**
 * @param db
 * @param doc
 * @param field
 * @param value
 */
export async function updateField(
  db: any, doc: string, field: string, value: any) {
  let users = await getUsers();
  for (let user of users) {
    let paths = await FU.getPaths(db, user, doc);
    for (let path of Object.keys(paths)) {
      FU.updateField(db, user, path, field, value);
    }
  }
}

/**
 * This restores a field value from tests for all users. Be careful!
 *
 * @param db The database
 * @param doc Document with full path.
 * @param field The field torestore.
 */
export async function restoreField(
  db: any, doc: string, field: string) {
  let users = await getUsers();
  for (let user of users) {
    console.log(user);
    await FU.restoreField(db, FC.TestsCollection, user, doc, field);
  }
  console.log('Done restoring fields');
}

export async function backup(db: any, dir: string = '/tmp/backup') {
  let users = await getUsers();
  for (let user of users) {
    await downloadUser(db, user, dir);
  }
  await downloadUser(db, FC.TestsCollection, dir);
  console.log('Firebase backup complete!');
}

export async function downloadUser(
  db: any, user: string, dir: string = '/tmp/backup') {
  let paths = await FU.getPaths(db, user, FC.NemethCollection);
  TestUtil.saveJson(`${dir}/${user}/paths.json`, paths);
  if (!paths) {
    return;
  }
  for (let path of Object.keys(paths)) {
    let data = await FU.downloadData(db, user, path);
    if (data) {
      TestUtil.saveJson(`${dir}/${user}/` + path, data);
    }
  }
}

// Missing:
// * Differences between user and original
// * Harvest user input
//
