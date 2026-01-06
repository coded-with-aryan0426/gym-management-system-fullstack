#!/bin/bash
rm -rf backend/target
git add .
git commit -m "chore: remove build artifacts and sync"
git pull origin fullstack-beta --no-rebase
git push origin fullstack-beta
