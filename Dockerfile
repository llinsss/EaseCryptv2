# Multi-stage Docker build for production deployment

# Build stage for frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY client/ ./client/
COPY shared/ ./shared/
COPY *.json *.ts ./
RUN npm run build

# Build stage for backend
FROM node:20-alpine AS backend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY server/ ./server/
COPY shared/ ./shared/
COPY *.json *.ts ./
RUN npm run build:server

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built applications
COPY --from=frontend-builder /app/dist ./dist
COPY --from=backend-builder /app/server ./server
COPY --from=backend-builder /app/shared ./shared

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node health-check.js

# Start the server
CMD ["npm", "run", "start:server"]