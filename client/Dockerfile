# Grab the latest Node base image
FROM node:latest

# Install serve
RUN npm install -g serve

# Set the current working directory inside the container
WORKDIR /server

# Copy packages.json and package-lock.json into the container
COPY package.json package-lock.json ./

# Install node modules inside the container using the copied package.json
RUN npm install

# Copy the entire project into the container
COPY . .

EXPOSE 3000

# Run the server
CMD ["/bin/bash", "-c", "'npm run build && serve -s build -l 3000'"]
