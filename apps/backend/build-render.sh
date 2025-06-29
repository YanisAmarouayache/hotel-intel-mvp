#!/bin/bash

# Build script for Render deployment
echo "🚀 Starting build process for Render..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application (Chrome will be installed automatically by Puppeteer)
echo "🔨 Building the application..."
npm run build

# Check if build was successful
echo "📁 Checking build output..."
if [ -d "dist" ]; then
    echo "✅ Build directory exists!"
    echo "📁 Contents of dist/:"
    ls -la dist/
    
    if [ -f "dist/main.js" ]; then
        echo "✅ main.js found in dist/"
    else
        echo "❌ main.js NOT found in dist/"
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