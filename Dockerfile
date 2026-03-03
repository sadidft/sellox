FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production=false

# Copy everything
COPY . .

# Non-root user (HF Space requirement)
RUN adduser -D sellox && chown -R sellox:sellox /app
USER sellox

# HF Space port
ENV PORT=7860
ENV NODE_ENV=production

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=10s \
  CMD wget -qO- http://localhost:7860/health || exit 1

CMD ["npx", "tsx", "core/server.ts"]
