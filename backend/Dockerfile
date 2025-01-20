FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker caching
COPY package*.json ./

# Install dependencies inside the container
RUN apk add --no-cache python3 py3-pip make g++ && npm install

# Copy the rest of the application code
COPY . .

EXPOSE 5100

# CMD ["node", "src/index.js"]
CMD ["npm", "start"]

