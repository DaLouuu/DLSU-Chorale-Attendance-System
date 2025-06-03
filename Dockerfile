# syntax=docker/dockerfile:1.4

################################
# 1. Install dependencies
################################
FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

################################
# 2. Build the application
################################
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable

# Accept build arguments
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG RESEND_API_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV RESEND_API_KEY=${RESEND_API_KEY}

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

################################
# 3. Runtime image
################################
FROM node:20-alpine AS runner
WORKDIR /app
RUN corepack enable

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only built assets and prod deps
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

# Set proper permissions
RUN chown -R nextjs:nodejs /app/.next /app/public /app/node_modules /app/package.json

# Switch to non-root user
USER nextjs

# Default command
CMD ["pnpm", "start"]
