# █████████████████████████████████████████████████████████████
# █ C.H.A.O.S. BACKEND DOCKERFILE                            █
# █ Production-ready Node.js container for backend services  █
# █████████████████████████████████████████████████████████████

# [BASE] Use Node 18 LTS Alpine for a smaller footprint
FROM node:18-alpine AS base

# [ENV] Set production environment
ENV NODE_ENV=production

# [WORK] Set working directory
WORKDIR /app

# [BUILD] Build stage for dependencies and compilation
FROM base AS builder

# [DEPS] Copy package files for installation
COPY package*.json ./
COPY prisma ./prisma/

# [INSTALL] Install dependencies including dev dependencies
RUN npm ci

# [SRC] Copy source code
COPY . .

# [COMPILE] Generate Prisma client and build TypeScript
RUN npx prisma generate
RUN npm run build

# [PROD] Production stage with minimal dependencies
FROM base AS production

# [SECURITY] Run as non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# [RUNTIME] Copy production dependencies and build output
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# [PORT] Expose API port
EXPOSE 3000

# [HEALTH] Healthcheck to verify API is responding
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# [START] Start the server
CMD ["node", "dist/index.js"]
