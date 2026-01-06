#!/bin/bash
git add .
git commit -m "chore: save state before sync"
git fetch origin fullstack-beta
git merge FETCH_HEAD -m "chore: merge remote changes"
git push origin HEAD:fullstack-beta
