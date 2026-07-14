# ─── QRTags — Dockerfile for Coolify ───
# Multi-stage build: deps → build → runner (standalone output)

# ─── Base ───
FROM node:20-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# ─── Stage 1: Dependencies ───
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

# ─── Stage 2: Build ───
FROM base AS builder
WORKDIR /app

# Copy node_modules from deps
COPY --from=deps /app/node_modules ./node_modules

# Copy source
COPY . .

# Generate Prisma Client (before build so imports resolve)
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npx next build

# ─── Stage 3: Production runner ───
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma runtime (schema + generated client + engine)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs

# Copy package.json (needed for prisma db push script)
COPY --from=builder /app/package.json ./package.json

# Persistent data directory for SQLite
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# ─── Entrypoint: migrate + start ───
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'set -e' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo 'echo "══ QRTags Container ══"' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Auto-migrate database on first run' >> /app/entrypoint.sh && \
    echo 'if [ ! -f /app/data/qrtags.db ]; then' >> /app/entrypoint.sh && \
    echo '  echo "📦 First run — creating database..."' >> /app/entrypoint.sh && \
    echo '  export DATABASE_URL="file:/app/data/qrtags.db"' >> /app/entrypoint.sh && \
    echo '  npx prisma db push --skip-generate --accept-data-loss 2>/dev/null || true' >> /app/entrypoint.sh && \
    echo '  echo "✅ Database ready"' >> /app/entrypoint.sh && \
    echo 'else' >> /app/entrypoint.sh && \
    echo '  echo "📦 Database exists — skipping init"' >> /app/entrypoint.sh && \
    echo 'fi' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo 'echo "🚀 Starting QRTags on port ${PORT:-3000}..."' >> /app/entrypoint.sh && \
    echo 'exec node server.js' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/app/entrypoint.sh"]