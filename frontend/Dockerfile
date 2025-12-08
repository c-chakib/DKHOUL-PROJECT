# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies (with legacy peer deps for Angular compatibility)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# ---- Stage 2: Development ----
FROM node:20-alpine

WORKDIR /app

# Copy from builder
COPY --from=builder /app .

# Expose port
EXPOSE 4200

# Start Angular dev server with host binding and polling for Docker
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "2000"]
