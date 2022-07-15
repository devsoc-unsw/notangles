# Grab the latest Node base image
FROM node:18.5.0-alpine as builder

# Set the current working directory inside the container
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ARG FACEBOOK_APP_ID
ARG GOOGLE_ANALYTICS_ID
ARG GOOGLE_API_KEY
ARG GOOGLE_OAUTH_CLIENT_ID
ARG SENTRY_INGEST_CLIENT
ARG SENTRY_TRACE_RATE_CLIENT

ENV REACT_APP_FACEBOOK_APP_ID=$FACEBOOK_APP_ID
ENV REACT_APP_GOOGLE_ANALYTICS_ID=$GOOGLE_ANALYTICS_ID
ENV REACT_APP_GOOGLE_API_KEY=$GOOGLE_API_KEY
ENV REACT_APP_GOOGLE_OAUTH_CLIENT_ID=$GOOGLE_OAUTH_CLIENT_ID
ENV REACT_APP_SENTRY_INGEST_CLIENT=$SENTRY_INGEST_CLIENT
ENV REACT_APP_SENTRY_TRACE_RATE_CLIENT=$SENTRY_TRACE_RATE_CLIENT

RUN npm run build

# nginx state for serving content
FROM nginx:1.23.0-alpine
# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html
# Remove default nginx static assets
RUN rm -rf ./*
# Copy static assets from builder stage
COPY --from=builder /app/build .

EXPOSE 80

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]
