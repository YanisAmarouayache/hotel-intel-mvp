#!/bin/bash

# Build script optimized for Render deployment with Puppeteer
set -e

echo "🚀 Starting Render build process with Puppeteer..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# Build the application
echo "🔨 Building application..."
npm run build

echo "✅ Render build completed successfully with Puppeteer!" 