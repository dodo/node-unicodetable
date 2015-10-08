#!/bin/bash

# Basically from https://github.com/w3ctag/promises-guide/blob/master/deploy-gh-pages.sh

git add category/*.js -f
git checkout -b tmp && git branch -D master && git checkout -b master && git branch -D tmp
git commit -am "Update Unicode Categories"
git push origin master -f
