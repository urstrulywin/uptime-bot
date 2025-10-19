# -------------------------
# 1️⃣  BUILD STAGE
# -------------------------
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy all project files
COPY . .

# Build the Next.js app (standalone output)
RUN npm run build

# -------------------------
# 2️⃣  RUNNER STAGE
# -------------------------
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy the minimal standalone build from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Expose port 8080 for Fly.io
EXPOSE 8080

# Start the Next.js standalone server
CMD ["node", "server.js"]
