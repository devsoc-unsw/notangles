# Dependency versions should be pinned
FROM node:21.0.0-alpine as builder
RUN npm i -g pnpm
RUN pnpm install @nestjs/cli
WORKDIR /server

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm i --no-frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:21.0.0-alpine
WORKDIR /server
RUN npm i -g pnpm

ENV NODE_ENV production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --production

COPY --from=builder /server .
RUN npx prisma generate

EXPOSE 3001

CMD ["pnpm", "run", "start:migrate:prod"]
# CMD ["pnpm", "run", "start"]