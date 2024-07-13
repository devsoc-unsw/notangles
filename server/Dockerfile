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

COPY migrate.sh /server/
RUN chmod +x /server/migrate.sh
RUN /server/migrate.sh

EXPOSE 3001

CMD ["pnpm", "run", "start:migrate:prod"]
