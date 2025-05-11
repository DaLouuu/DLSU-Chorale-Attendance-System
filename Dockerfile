# syntax=docker/dockerfile:1.4

################################
# 1. Install dependencies
################################
FROM node:20-alpine AS deps
WORKDIR /app
# Copy only manifest files
COPY package.json pnpm-lock.yaml ./
# Bootstrap pnpm and install exactly what's in lockfile
RUN corepack enable && pnpm install --frozen-lockfile

################################
# 2. Build the application
################################
FROM node:20-alpine AS builder
WORKDIR /app
# Copy installed modules and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Build (e.g. Next.js, Vue, etc.)
RUN pnpm build

################################
# 3. Runtime image
################################
FROM node:20-alpine AS runner
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only built assets and prod deps
COPY --from=builder /app/.next ./.next
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Set proper permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Default command
CMD ["pnpm", "start"]
