# QRBag - Dockerfile for Coolify Deployment
# 100% npm/npx — no bun in Docker (tarball extraction + build issues)
FROM node:20-slim AS base

# ─── Stage 1: Install dependencies ───
FROM base AS deps
WORKDIR /app

COPY package.json ./
RUN npm install

# ─── Stage 2: Build ───
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN npx next build

# ─── Stage 3: Production ───
FROM base AS runner
WORKDIR /app

# Install sqlite3 CLI
RUN apt-get update && apt-get install -y --no-install-recommends sqlite3 && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma files for runtime
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/bcrypt ./node_modules/bcrypt
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder /app/prisma ./prisma

# Copy package.json for scripts
COPY --from=builder /app/package.json ./package.json

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "🚀 Starting QRBag..."' >> /app/start.sh && \
    echo 'mkdir -p /app/data' >> /app/start.sh && \
    echo 'export DATABASE_URL=file:/app/data/custom.db' >> /app/start.sh && \
    echo 'cd /app' >> /app/start.sh && \
    echo 'npx prisma db push --skip-generate 2>/dev/null || true' >> /app/start.sh && \
    echo 'echo "✅ Starting server..."' >> /app/start.sh && \
    echo 'exec node server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Change ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/app/start.sh"]