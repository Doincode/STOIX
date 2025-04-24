FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies only
COPY package*.json ./
COPY tsconfig.json ./

RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:18-alpine AS production

WORKDIR /app

# Copy built files and dependencies
COPY --from=base /app/dist ./dist
COPY --from=base /app/package*.json ./
COPY --from=base /app/node_modules ./node_modules

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/server.js"] 
