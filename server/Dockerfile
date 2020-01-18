# Grab the latest Node base image
FROM node:latest

# Set the current working directory inside the container
WORKDIR /server

# Copy the entire project into the container
COPY package.json .
COPY src/secret.json src/secret.json

# Install node modules inside the container using the copied package.json
RUN npm install

COPY . .

EXPOSE 3001 

CMD ["npm", "start"]