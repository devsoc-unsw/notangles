# Grab the latest Node base image
FROM node:latest

# Set the current working directory inside the container
WORKDIR /server

# Copy packages.json and package-lock.json into the container
COPY package.json package-lock.json ./

# Install node modules inside the container using the copied package.json
RUN npm install

# Copy the entire project into the container
COPY . .

# Expose the port to the outside world
EXPOSE 3000

# Run the server
CMD ["npm","run","start:mock"]