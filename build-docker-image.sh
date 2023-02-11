#!/bin/bash

set -xe

cd client
rm -rf .next
yarn
yarn build
cd ..

bash ./bundle-client.sh
docker build --network=host -t nfrederick023/better-clipface:latest .
rm client/docker-bundle.tgz
