# Stage 1: Build Angular application
FROM node:latest AS build-step

# Set working directory
WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies with npm (or pnpm if preferred)
RUN apt-get update && apt-get install -y git && npm install -g pnpm && pnpm setup && pnpm install -g @angular/cli && pnpm install

# Copy the rest of the project files (excluding node_modules)
COPY . .

# Build for production
RUN ng build --prod

# Stage 2: Use a smaller nginx image for serving
FROM nginx:alpine

# Copy built Angular application from previous stage
COPY --from=build-step /app/dist /usr/share/nginx/html

# Expose the default port (usually 80)
EXPOSE 80

# Use the default nginx configuration
CMD ["nginx", "-g", "daemon off;"]