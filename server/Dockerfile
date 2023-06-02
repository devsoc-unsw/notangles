# Dependency versions should be pinned
FROM node:20.2.0-alpine as builder

WORKDIR /server

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build


FROM node:20.2.0-alpine

WORKDIR /server

ENV NODE_ENV production
COPY package.json package-lock.json ./
RUN npm install --production

COPY --from=builder /server/dist .
COPY ./src/proto/*.js ./src/proto/

EXPOSE 3001

CMD ["npm", "run", "start:production"]
