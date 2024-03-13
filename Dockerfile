# Use a lightweight Node.js image
FROM node:latest

# Set working directory
WORKDIR /app

# Copy package.json
COPY package.json ./

RUN apt-get update && apt-get install -y git

# Install dependencies with pnpm
RUN npm install -g pnpm && pnpm install

# Copy the rest of the project files (excluding node_modules)
COPY . .

# Build for production (replace with your build command if different)
RUN pnpm run build --prod

# Use a smaller nginx image for serving
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy the built Angular application files
COPY --from=build-step /app/dist /usr/share/nginx/html

# Expose the default port (usually 80)
EXPOSE 80

# Use the default nginx configuration
CMD ["nginx", "-g", "daemon off;"]
