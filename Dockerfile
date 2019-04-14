FROM node:11.14.0-alpine

WORKDIR /app

ADD package* ./

RUN npm ci

ADD . ./

RUN npm run verify

CMD ["npm","start"]