#!/bin/bash

set -e

build_nestjsbi(){
  echo "[nestjs] building image"
  buildah bud -t nestjs-bi ./nestjs-bi/Dockerfile > /dev/null
  buildah tag nestjs-bi registry.digitalocean.com/datacompany/nestjs-bi > /dev/null

  echo "[nestjs] uploading image"
  buildah push registry.digitalocean.com/datacompany/nestjs-bi > /dev/null

  echo "[nestjs] ok!"
}

build_quasarbi(){
  echo "[quasar-bi] building image"
  buildah bud -t quasar-bi ./quasar-bi/Dockerfile > /dev/null
  buildah tag quasar-bi registry.digitalocean.com/datacompany/quasar-bi > /dev/null

  echo "[quasar-bi] uploading image"
  buildah push registry.digitalocean.com/datacompany/quasar-bi > /dev/null

  echo "[quasar-bi] ok!"
}

deploy(){
  echo "[deploy] updating images sha256"
  repository_list=$(doctl registry repository list-v2)
  sha256nest=$(echo "$repository_list" | awk '$1=="nestjs-bi"{print $2}')
  sha256quasar=$(echo "$repository_list" | awk '$1=="quasar-bi"{print $2}')
  echo "[deploy] nestjs-bi = $sha256nest"
  echo "[deploy] quasar-bi = $sha256quasar"

  echo "[deploy] generating yaml file"
  yaml="$(cat ./kube/deploy.yaml | sed "s/{{nestjs-bi_sha256}}/$sha256nest/g")"
  yaml="$(echo "$yaml" | sed "s/{{quasar-bi_sha256}}/$sha256quasar/g")"

  echo "[deploy] deploying to kubernetes"
  echo "$yaml" | kubectl apply -f -
}

build_quasarbi &
build_nestjsbi &
wait
deploy
