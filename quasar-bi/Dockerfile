FROM node:20-slim as pre-quasar-bi
RUN corepack enable
RUN mkdir -p /home/node/app
RUN chown -R node:node /home/node/app
COPY . /home/node/app
WORKDIR /home/node/app
# COPY .prod.env .env
RUN yarn install
RUN yarn quasar build --mode pwa

FROM docker.io/nginx:stable-alpine as quasar-bi
RUN mkdir -p /usr/share/nginx/html/public
#COPY --from=pre-quasar-bi /home/node/app/public /usr/share/nginx/html/public
COPY --from=pre-quasar-bi /home/node/app/dist/pwa /usr/share/nginx/html
#COPY --from=pre-quasar-bi /home/node/app/.env /usr/share/nginx/html/.env
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
