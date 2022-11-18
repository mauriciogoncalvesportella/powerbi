#!/bin/bash
set -e

printf ">>>>> Building image <<<<<\n\n"
buildah bud -t quasar-bi .
buildah tag quasar-bi registry.digitalocean.com/datacompany/quasar-bi

printf "\n>>>>> Uploading image to registry <<<<<\n\n"
buildah push registry.digitalocean.com/datacompany/quasar-bi

printf "\n>>>>> Getting image sha256 <<<<<\n\n"
repository_list=$(doctl registry repository list-v2)
sha256quasar=$(echo "$repository_list" | awk '$1=="quasar-bi"{print $2}')
echo "quasar-bi = $sha256quasar"

printf "\n>>>>> Generating yaml <<<<<\n\n"
yaml="$(cat ./deploy.yaml | sed "s/{{quasar-bi_sha256}}/$sha256quasar/g")"
printf "OK!\n"

printf "\n>>>>> Deploying to kubernetes <<<<<\n\n"
echo "$yaml" | kubectl apply -f -
