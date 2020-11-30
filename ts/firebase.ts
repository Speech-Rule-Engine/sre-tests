import * as fc from './firebase/fire_constants';
import * as fu from './firebase/fire_util';

export let Fu = fu;
export let Fc = fc;
export let update = async function(
  db: any, collA: string, collB: string, doc: string) {
  let result = await fu.updateCollection(db, collA, collB, doc);
  localStorage[fc.NemethProjectDocuments] = JSON.stringify(result);
};
