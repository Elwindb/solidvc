FROM node:alpine

# Set working directory
WORKDIR /usr/src/app

SHELL ["/bin/bash", "-c"]

# Copy project files
COPY . /usr/src/app

# Install Angular CLI globally
RUN sh -c "npm install -g pnpm && pnpm setup && pnpm install -g @angular/cli"

# Install project dependencies
RUN pnpm install

# Build the Angular application for production
RUN ng build --prod

# Expose port 80 for serving the application
EXPOSE 80

# Serve the built application using a simple HTTP server (serve package)
CMD ["npx", "serve", "-s", "-l", "80", "dist"]