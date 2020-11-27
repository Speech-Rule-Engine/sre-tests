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

export async function uploadData(db: any, collection: string,
                                 doc: string, data: any) {
  db.collection(collection).doc(doc).set(data).
    then(() => {
      console.log(`Data for document ${doc} successfully uploaded to collection ${collection}`);
    }).
    catch((error: Error) => {
      console.log(`Uploading data to document ${doc} in collection ${collection} failed with: ${error}`);
    });
}

export async function downloadData(db: any, collection: string, path: string) {
  let doc = await db.collection(collection).doc(path).get();
  return doc.data();
}

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

export async function getPaths(db: any, collection: string, doc: string) {
  let path = doc.split('/')[0];
  let paths = await db.collection(collection).doc(path).get();
  return paths.data();
}


/**
 * Updates date in collection B from collection A.
 * @param {any} db The databae.
 * @param {string} collA Source collection.
 * @param {string} collB Target collection.
 * @param {string} doc The document to update.
 */
export async function updateData(
  db: any, collA: string, collB: string, doc: string) {
  console.log(3);
  let paths = await getPaths(db, collA, doc);
  console.log(paths);
  if (!paths) {
    return;
  }
  for (let path of Object.keys(paths)) {
    console.log(path);
    let dataB = await downloadData(db, collB, path);
    console.log(dataB);
    if (!dataB) {
      let dataA = await downloadData(db, collA, path);
      console.log(dataA);
      await uploadData(db, collB, path, dataA);
      await setPath(db, collB, path);
    }
  }
}
