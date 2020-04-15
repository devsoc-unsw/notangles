# Grab the latest Node base image
FROM node:latest

# Set the current working directory inside the container
WORKDIR /server

# Copy package.json and package-lock.json into the container
COPY package.json package-lock.json ./

# Install node modules inside the container using the copied package.json
RUN npm install

# Copy the entire project into the container
COPY . .

# Run the server
CMD ["npm", "run", "start:production"]