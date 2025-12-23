# ----------------------------
# Install all deps (including dev)
# ----------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ----------------------------
# Build stage
# ----------------------------
FROM node:20-alpine AS build
RUN apk add --no-cache python3 make g++
WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set memory limit and run build
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# ----------------------------
# Production stage
# ----------------------------
FROM node:20-alpine
WORKDIR /app

# only production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# copy build output (React Router uses build)
COPY --from=build /app/build ./build

EXPOSE 3000
CMD ["npm", "run", "start"]
