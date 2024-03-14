FROM node:alpine

# Set working directory
WORKDIR /usr/src/app

# Copy project files
COPY . /usr/src/app

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Install project dependencies
RUN npm install

# Expose port 80 for serving the application
EXPOSE 80

# Serve the application over port 80
CMD ["ng", "serve"]
