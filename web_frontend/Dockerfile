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
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

# ----------------------------
# Production stage
# ----------------------------
FROM node:20-alpine
WORKDIR /app

# only production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# copy build output (Vite uses dist)
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["npm", "run", "start"]
