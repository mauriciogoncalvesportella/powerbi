FROM node:12.13-alpine AS nestjs-bi-build
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY . /home/node/app
RUN yarn install
RUN yarn build
RUN yarn install:prod
COPY .prod.env dist/.env
COPY ca-certificate.crt dist/database/ca-certificate.crt

FROM node:12.13-alpine AS wsfat-prod
RUN mkdir -p /home/node/app
WORKDIR /home/node/app
COPY --from=nestjs-bi-build /home/node/app/dist .
EXPOSE 3000
CMD ["node", "main"]
