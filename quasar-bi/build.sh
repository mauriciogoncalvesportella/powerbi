#!/bin/bash
set -e

build_quasarbi(){
  echo "[quasar-bi] building image"
  buildah bud -t quasar-bi . > /dev/null
  buildah tag quasar-bi registry.digitalocean.com/datacompany/quasar-bi > /dev/null

  echo "[quasar-bi] uploading image"
  buildah push registry.digitalocean.com/datacompany/quasar-bi > /dev/null

  echo "[quasar-bi] ok!"
}

deploy(){
  echo "[deploy] updating images sha256"
  repository_list=$(doctl registry repository list-v2)
  sha256quasar=$(echo "$repository_list" | awk '$1=="quasar-bi"{print $2}')

  echo "[deploy] quasar-bi = $sha256quasar"
  echo "[deploy] generating yaml file"
  yaml="$(cat ../kube/deploy-quasar-bi.yaml | sed "s/{{quasar-bi_sha256}}/$sha256quasar/g")"

  echo "[deploy] deploying to kubernetes"
  echo "$yaml" | kubectl apply -f -
}

build_quasarbi &
wait
deploy