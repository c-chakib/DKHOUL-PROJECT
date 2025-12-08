# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# ---- Stage 2: Development ----
FROM node:20-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app .

# Expose port
EXPOSE 5000

# Start with nodemon for development
CMD ["npm", "run", "dev"]
