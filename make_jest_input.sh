#!/bin/bash

DIR=ts/jest
mkdir -p $DIR
pushd expected
jsonfiles=`find . -name '*.json'`
popd
for i in $jsonfiles; do
    dir=`dirname $i | sed "s/\//_/g" | sed "s/^\._//"`
    echo $dir
    name=`basename $i .json`
    name=$dir"_"$name
    echo "import {runJsonTest} from '../jest';" > $DIR/$name.test.ts
    echo "runJsonTest('$i');" >> $DIR/$name.test.ts
done
