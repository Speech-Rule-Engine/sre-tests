# Harvest App for Nemeth Tests

``` bash
npx firebase login
```

Not sure if that is needed everytime?
``` bash
npx firebase init
```

Deploys on `nemeth-project.web.app`

``` bash
npx firebase deploy
```

``` bash
npx firebase emulators:start
```

or 

``` bash
npx firebase serve
```


## Supplying the Database

This is done with the backend module.

``` javascript
node
process.env.SRE_JSON_PATH='../speech-rule-engine/lib/mathmaps';
fb = require('./js/firebase/fire_backend');
db = fb.initFirebase(CREDENTIALS);
fb.uploadTest(db, FILE);
```

`CREDENTIALS` is the path to the `json` file with the firebase credentials.

`FILE` is the path to the expected values file of the test. Can be relative or
absolute as it is loaded with the usual test loader.

## Updating in the Database

Most commonly we want to update a single field. Either in the base files or for every user.

### Updating a Single Field

``` javascript
fu = require('./js/firebase/fire_util');
fu.updateField(db, collection, path, field, key);
```

This updates in the collection every test at a path `path` by adding/overwriting the
`field` with the given `key`.

Example:

``` javascript
fu.updateField(db, 'tests', 'nemeth/rules/aata.json', FIELD, KEY);
```

### Updating a Field for All Users

``` javascript
fb = require('./js/firebase/fire_backend');
fb.updateField(db, doc, field, key)
```

Updates for every user all tests in the given document with the `field, key` pair.
Effectively it iterates over all users of the firebase, retrieves the paths for the
document and then updates tests for each of entry in the paths list.

Example:

``` javascript
fb.updateField(db, 'nemeth', FIELD, KEY);
```


## Harvesting the Database
