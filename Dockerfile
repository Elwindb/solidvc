# Use a slim Node.js base image
FROM node:20-slim AS base

# Set environment variable for pnpm store location
ENV PNPM_HOME="/pnpm"

# Add pnpm to PATH using corepack
RUN corepack enable

# Copy project files to working directory
COPY . /app

# Set working directory
WORKDIR /app

# Install dependencies (production only)
FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Build the Angular application
FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

# Install Angular CLI within the build stage
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install -g @angular/cli

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm run build

# Final image (copy production build and start server)
FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist

# Install Angular CLI in the final image
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install -g @angular/cli

EXPOSE 4200
CMD [ "pnpm", "start" ]