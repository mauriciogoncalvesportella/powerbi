#!/bin/bash

set -e

build_nestjsbi(){
  echo "[nestjs] building image"
  buildah bud -t nestjs-bi . > /dev/null
  buildah tag nestjs-bi registry.digitalocean.com/datacompany/nestjs-bi > /dev/null

  echo "[nestjs] uploading image"
  buildah push registry.digitalocean.com/datacompany/nestjs-bi > /dev/null

  echo "[nestjs] ok!"
}

deploy(){
  echo "[deploy] updating images sha256"
  repository_list=$(doctl registry repository list-v2)
  sha256nest=$(echo "$repository_list" | awk '$1=="nestjs-bi"{print $2}')
  echo "[deploy] nestjs-bi = $sha256nest"

  echo "[deploy] generating yaml file"
  yaml="$(cat ../kube/deploy-nestjs-bi.yaml | sed "s/{{nestjs-bi_sha256}}/$sha256nest/g")"

  echo "[deploy] deploying to kubernetes"
  echo "$yaml" | kubectl apply -f -
}

build_nestjsbi &
wait
deploy