# Use Node.js to build the React app
FROM node:18-alpine as build

# Set the working directory
WORKDIR /app

# Copy dependencies first (for caching)
COPY package*.json ./
RUN npm install

# Copy rest of the app and build it
COPY . .
RUN npm run build

# Use Nginx for serving static files
FROM nginx:stable-alpine

# Copy built frontend to Nginx directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose Nginx port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
