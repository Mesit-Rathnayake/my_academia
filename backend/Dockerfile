FROM node:20-alpine

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Copy package files and install dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --omit=dev || npm install --omit=dev

# Generate Prisma Client
RUN npx prisma generate

# Copy application source
COPY . .

EXPOSE 5001

ENV NODE_ENV=production
ENV PORT=5001

CMD ["node", "server.js"]
