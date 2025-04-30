# Dependency versions should be pinned
FROM node:22.15.0-alpine AS builder
RUN apk add --no-cache openssl

RUN npm i -g pnpm
RUN pnpm install @nestjs/cli
WORKDIR /server

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma/

RUN pnpm i --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:22.15.0-alpine
WORKDIR /server
RUN npm i -g pnpm

ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --production --frozen-lockfile

COPY --from=builder /server .
RUN npx prisma generate

EXPOSE 3001

CMD ["pnpm", "run", "start:migrate:prod"]
