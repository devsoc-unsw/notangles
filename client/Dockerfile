# Grab the latest Node base image
FROM node:22.16.0-alpine AS builder
RUN npm i -g pnpm

# Set the current working directory inside the container
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

ARG CLARITY_PROJECT_ID
ENV VITE_CLARITY_PROJECT_ID=$CLARITY_PROJECT_ID

ENV VITE_APP_ENVIRONMENT=production
ENV NODE_ENV=production

ARG GIT_COMMIT
RUN if [ -n "$GIT_COMMIT" ]; then export VITE_COMMIT=$GIT_COMMIT; fi && \
    pnpm run build

FROM caddy:2.10.0-alpine
COPY ./Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /app/dist /srv 
