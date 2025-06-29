#!/bin/bash

# Build script for Render deployment
echo "🚀 Starting build process for Render..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install Puppeteer Chrome browser for Render
echo "🔧 Installing Puppeteer Chrome browser..."
npm install puppeteer --unsafe-perm=true

# Build the application
echo "🔨 Building the application..."
npm run build

# Check if build was successful
echo "📁 Checking build output..."
if [ -d "dist" ]; then
    echo "✅ Build directory exists!"
    echo "📁 Contents of dist/:"
    ls -la dist/
    
    if [ -f "dist/src/main.js" ]; then
        echo "✅ main.js found in dist/src/"
    else
        echo "❌ main.js NOT found in dist/src/"
        echo "📁 Available files in dist/:"
        find dist/ -type f -name "*.js" | head -10
        exit 1
    fi
else
    echo "❌ Build failed - dist directory not found"
    echo "📁 Current directory contents:"
    ls -la
    exit 1
fi

echo "🎉 Build process completed successfully!" 