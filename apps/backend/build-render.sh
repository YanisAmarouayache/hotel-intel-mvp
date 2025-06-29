#!/bin/bash

# Build script for Render deployment
echo "🚀 Starting build process for Render..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install Puppeteer Chrome browser for Render
echo "🔧 Installing Puppeteer Chrome browser..."
npx puppeteer browsers install chrome --unsafe-perm=true 

# Find Chrome executable
echo "🔍 Looking for Chrome executable..."
CHROME_PATH=$(find /opt/render/.cache/puppeteer -name "chrome" -type f 2>/dev/null | head -1)
if [ -n "$CHROME_PATH" ]; then
    echo "✅ Found Chrome at: $CHROME_PATH"
    echo "🔧 Set this environment variable in Render:"
    echo "   PUPPETEER_EXECUTABLE_PATH=$CHROME_PATH"
else
    echo "⚠️ Chrome not found in Puppeteer cache, checking system paths..."
    SYSTEM_CHROME=$(which google-chrome-stable 2>/dev/null || which chromium-browser 2>/dev/null)
    if [ -n "$SYSTEM_CHROME" ]; then
        echo "✅ Found system Chrome at: $SYSTEM_CHROME"
        echo "🔧 Set this environment variable in Render:"
        echo "   PUPPETEER_EXECUTABLE_PATH=$SYSTEM_CHROME"
    else
        echo "❌ Chrome not found anywhere"
    fi
fi

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