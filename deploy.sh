#!/bin/bash

# Moboy Post to Earn - Deployment Script
# This script helps deploy the application to Cloudflare Pages

echo "🚀 Starting Moboy Post to Earn deployment..."

# Check if required tools are installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run linting
echo "🔍 Running linting..."
npm run lint

# Build the application
echo "🏗️ Building application..."
npm run build

# Check if wrangler is installed (for Cloudflare Workers deployment)
if ! command -v wrangler &> /dev/null; then
    echo "📥 Installing Wrangler CLI..."
    npm install -g wrangler
fi

# Deploy to Cloudflare Pages (if authenticated)
echo "☁️ Deploying to Cloudflare Pages..."
if command -v wrangler &> /dev/null; then
    wrangler pages project create moboy-post-to-earn --compatibility-date=2024-01-15
    wrangler pages deploy out --project-name=moboy-post-to-earn
else
    echo "⚠️ Wrangler not found. Please deploy manually to Cloudflare Pages."
fi

# Setup database
echo "🗄️ Setting up database..."
npx prisma db push

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should be available at: https://moboy-post-to-earn.pages.dev"
echo ""
echo "📝 Next steps:"
echo "1. Configure your environment variables in Cloudflare Pages dashboard"
echo "2. Set up your custom domain if needed"
echo "3. Test the application functionality"
echo "4. Configure Solana wallet integration for production"