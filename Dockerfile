# Build stage
FROM node:20-alpine AS build

# Pass environment variables needed for Vite build
ARG VITE_GEMINI_API_KEY
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GEMINI_API_KEY=$VITE_GEMINI_API_KEY
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Vite application for production
RUN npm run build

# Serve stage using lightweight Nginx
FROM nginx:alpine

# Copy the custom Nginx configuration to listen on port 8080
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose Cloud Run required port
EXPOSE 8080

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
