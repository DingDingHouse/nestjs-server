# Stage 1: Build the application
FROM node:18-alpine as builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the project files
COPY . .

# Build NestJS project
RUN npm run build

# Stage 2: Create a smaller image for production
FROM node:18-alpine

WORKDIR /app

# Copy necessary files from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Set environment and expose port
ENV NODE_ENV=production
EXPOSE 3000

# Start application
CMD ["node", "dist/main"]
