# ==============================================================================
# EZWATY CLOUD & ON-PREMISE HYBRID DOCKERFILE
# Multi-stage production build for Node.js / Express & React
# ==============================================================================

# STAGE 1: Build React Frontend Assets
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first for Docker caching
COPY package.json package-lock.json* ./
RUN npm ci

# Copy full application source code
COPY . .

# Build production assets (Vite outputs to /dist)
RUN npm run build

# ==============================================================================
# STAGE 2: Production Runtime (Optimized for Local On-Premise Air-Gapped Server)
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev && npm install -g tsx

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy backend server and shared source files
COPY server.ts ./
COPY src/shared ./src/shared
COPY src/server ./src/server
COPY src/types ./src/types

# Create non-privileged system user for container security
RUN addgroup -S ezwaty && adduser -S ezwaty -G ezwaty
USER ezwaty

# Healthcheck to verify system availability
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

EXPOSE 3000

# Start server using tsx
CMD ["tsx", "server.ts"]
