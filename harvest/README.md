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

``` bash
node
process.env.SRE_JSON_PATH='../speech-rule-engine/lib/mathmaps';
fb = require('./js/firebase/fire_backend');
db = fb.initFirebase(CREDENTIALS);
fb.uploadTest(db, FILE);
```

`CREDENTIALS` is the path to the `json` file with the firebase credentials.

`FILE` is the path to the expected values file of the test. Can be relative or
absolute as it is loaded with the usual test loader.

## 

## Harvesting the Database
