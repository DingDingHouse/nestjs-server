# Stage 1: Build the application using Node 20
FROM node:20 as builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Build NestJS project
RUN npm run build

# Stage 2: Create a smaller image for production using Node 20 (alpine if you prefer)
FROM node:20-alpine

WORKDIR /app

# Expose correct port (matching your .env)
EXPOSE 5001

# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./ 
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Start application (adjust if your main file is different)
CMD ["node", "dist/main"]
