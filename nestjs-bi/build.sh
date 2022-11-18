#!/bin/bash

printf ">>>>> Building image <<<<<\n\n"
buildah bud -t nestjs-bi .
buildah tag -t nestjs-bi registry.digitalocean.com/datacompany/nestjs-bi

printf "\n>>>>> Uploading image to registry <<<<<\n\n"
buildah push registry.digitalocean.com/datacompany/nestjs-bi

printf "\n>>>>> Getting image sha256 <<<<<\n\n"
repository_list=$(doctl registry repository list-v2)
sha256nest=$(echo "$repository_list" | awk '$1=="nestjs-bi"{print $2}')
sha256quasar=$(echo "$repository_list" | awk '$1=="quasar-bi"{print $2}')
echo "nestjs-bi = $sha256nest"
echo "quasar-bi = $sha256quasar"

printf "\n>>>>> Generating yaml <<<<<\n\n"
yaml="$(cat ../kube/deploy.yaml | sed "s/{{nestjs-bi_sha256}}/$sha256nest/g")"
yaml="$(echo "$yaml" | sed "s/{{quasar-bi_sha256}}/$sha256quasar/g")"
printf "OK!\n"

printf "\n>>>>> Deploying to kubernetes <<<<<\n\n"
echo "$yaml" | kubectl apply -f -
