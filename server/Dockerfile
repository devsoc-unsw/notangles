# # Dependency versions should be pinned
# FROM node:21.0.0-alpine as builder
# RUN npm i -g pnpm
# WORKDIR /server

# COPY package.json pnpm-lock.yaml ./
# RUN pnpm i --frozen-lockfile

# COPY . .
# RUN pnpm run build


# FROM node:21.0.0-alpine
# RUN npm i -g pnpm
# WORKDIR /server

# ENV NODE_ENV production
# COPY package.json pnpm-lock.yaml ./
# RUN pnpm install --production

# # COPY --from=builder /server/dist .
# # COPY ./src/proto/*.js ./src/proto/

# EXPOSE 3001

# CMD ["pnpm", "run", "start:prod"]

# Use an official Node.js image as the base image
FROM node:21.0.0-alpine
RUN npm i -g pnpm

# Set the working directory inside the container
WORKDIR /server

# Copy package.json and pnpm-lock.yaml to the working directory
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Expose the port your application listens on
EXPOSE 3001

# Command to run your application using PNPM
CMD ["pnpm", "run", "start"]