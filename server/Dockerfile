# Dependency versions should be pinned
FROM node:20.5.1-alpine as builder
RUN npm i -g pnpm
WORKDIR /server

COPY package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile

COPY . .
RUN pnpm run build


FROM node:20.5.1-alpine
RUN npm i -g pnpm
WORKDIR /server

ENV NODE_ENV production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --production

# COPY --from=builder /server/dist .
# COPY ./src/proto/*.js ./src/proto/

EXPOSE 3001

CMD ["pnpm", "run", "start:prod"]
