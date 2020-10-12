#!/bin/bash

DIR=ts/jest
ALL=ts/all.test.ts
mkdir -p $DIR
pushd expected
jsonfiles=`find . -name '*.json' | sort`
echo $jsonfiles
popd
echo "import {runJsonTest} from './jest';" > $ALL
echo "import {ExampleFiles} from './classes/abstract_examples';" >> $ALL
echo "afterAll(() => {ExampleFiles.closeFiles();});" >> $ALL
for i in $jsonfiles; do
    dir=`dirname $i | sed "s/\//_/g" | sed "s/^\._//"`
    echo $dir
    name=`basename $i .json`
    name=$dir"_"$name
    echo "import {ExampleFiles} from './classes/abstract_examples';" >  $DIR/$name.test.ts
    echo "import {runJsonTest} from '../jest';" >> $DIR/$name.test.ts
    echo "ExampleFiles.noOutput = true;" >> $DIR/$name.test.ts
    echo "runJsonTest('$i');" >> $DIR/$name.test.ts
    echo "runJsonTest('$i');" >> $ALL
done
