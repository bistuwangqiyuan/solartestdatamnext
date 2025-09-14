#!/bin/bash

# Solar Test Data Management System - Deployment Script

echo "🚀 Starting deployment process..."

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Run linting
echo "🔍 Running linter..."
pnpm run lint || true

# Build the application
echo "🏗️ Building application..."
pnpm run build

# Deploy to Netlify
if command -v netlify &> /dev/null; then
    echo "☁️ Deploying to Netlify..."
    netlify deploy --prod --no-build
else
    echo "⚠️ Netlify CLI not found. Please install it with: npm install -g netlify-cli"
    echo "Then run: netlify deploy --prod --no-build"
fi

echo "✅ Deployment process completed!"