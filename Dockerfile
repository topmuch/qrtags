# ─── QRTags — Optimized Dockerfile for Coolify ───
# Multi-stage: base → deps → build → runner (standalone)

# ─── Base ───
FROM node:20-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssl \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# ─── Stage 1: Install dependencies only ───
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* bun.lock* ./
RUN npm install --legacy-peer-deps 2>&1 | tail -3

# ─── Stage 2: Build ───
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js (standalone output)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npx next build

# ─── Stage 3: Minimal production runner ───
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone output (includes its own node_modules for traced deps)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static assets & public
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma runtime (schema + generated client + query engine)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Copy serverExternalPackages (modules not bundled by Next.js standalone)
# These are needed at runtime because Next.js excludes them from the bundle
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/archiver ./node_modules/archiver
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/nodemailer ./node_modules/nodemailer
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/qrcode ./node_modules/qrcode
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pdfkit ./node_modules/pdfkit

# Copy Prisma CLI for db push at startup
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma

# Copy admin creation script
COPY --from=builder --chown=nextjs:nodejs /app/scripts/create-admin.cjs ./scripts/create-admin.cjs

# Persistent data directory for SQLite
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# ─── Entrypoint: init db → create admin → start server ───
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'set -e' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo 'echo "══ QRTags Starting ══"' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo 'export DATABASE_URL="file:/app/data/qrtags.db"' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Sync database schema' >> /app/entrypoint.sh && \
    echo 'echo "Syncing database schema..."' >> /app/entrypoint.sh && \
    echo 'npx prisma db push --skip-generate 2>&1 || echo "DB push warning (non-fatal)"' >> /app/entrypoint.sh && \
    echo 'echo "Database ready"' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo '# Create default users if needed' >> /app/entrypoint.sh && \
    echo 'node /app/scripts/create-admin.cjs 2>&1 || echo "Admin init warning (non-fatal)"' >> /app/entrypoint.sh && \
    echo '' >> /app/entrypoint.sh && \
    echo 'echo "Starting QRTags on port ${PORT:-3000}..."' >> /app/entrypoint.sh && \
    echo 'exec node server.js' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/app/entrypoint.sh"]