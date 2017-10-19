#!/bin/sh

rm -rf dist

webpack
result=$?
[ $result -ne 0 ] && exit $result

main=$(cat package.json | jq -r '.main')
typings=$(cat package.json | jq -r '.typings')

main=${main##*dist/}
typings=${typings##*dist/}

(cat package.json | jq 'del(.devDependencies, .files, .scripts)' | jq .main=\"$main\" | jq .typings=\"$typings\") > dist/package.json
