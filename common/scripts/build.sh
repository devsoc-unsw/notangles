#!/bin/bash -ex

npm run lint

rm -rf dist
tsc -p .
