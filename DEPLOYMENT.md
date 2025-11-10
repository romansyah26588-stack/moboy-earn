# MoBoy Web3 - Cloudflare Deployment Guide

## 🚀 One-Click Deployment to Cloudflare

This guide will help you deploy MoBoy Web3 to Cloudflare Pages without any configuration.

### Step 1: Upload Files to Git Repository

1. Create a new repository on GitHub/GitLab
2. Upload all files from the MoBoy project
3. Make sure the repository is public (or accessible by Cloudflare)

### Step 2: Deploy to Cloudflare Pages

1. **Go to Cloudflare Dashboard**
   - Visit: https://dash.cloudflare.com/
   - Login to your account

2. **Navigate to Pages**
   - Click "Pages" in the left sidebar
   - Click "Create a project"

3. **Connect Your Repository**
   - Choose your Git provider (GitHub, GitLab, etc.)
   - Authorize Cloudflare to access your repositories
   - Select the MoBoy repository

4. **Configure Build Settings**
   ```
   Framework preset: Next.js
   Build command: npm run build
   Build output directory: out
   Root directory: / (leave empty)
   ```

5. **Add Environment Variables**
   ```
   DATABASE_URL = file:./dev.db
   NEXTAUTH_SECRET = your-secure-secret-key-here
   ```

6. **Deploy**
   - Click "Save and Deploy"
   - Wait for deployment to complete (2-3 minutes)

### Step 3: Configure Custom Domain (Optional)

1. In Cloudflare Pages dashboard
2. Click "Custom domains"
3. Add your domain name
4. Update DNS records as instructed

## 📋 Required Files Checklist

Make sure your repository contains these files:

### Core Files
- ✅ `package.json` - Dependencies and scripts
- ✅ `next.config.js` - Next.js configuration for Cloudflare
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `README.md` - Documentation
- ✅ `.gitignore` - Git ignore rules

### Source Code
- ✅ `src/app/layout.tsx` - App layout
- ✅ `src/app/page.tsx` - Main page component
- ✅ `src/app/api/` - API routes
- ✅ `src/components/ui/` - UI components
- ✅ `src/lib/` - Utility functions
- ✅ `src/styles/globals.css` - Global styles

### Configuration
- ✅ `prisma/schema.prisma` - Database schema
- ✅ `.env.example` - Environment variables template

## 🔧 Automatic Configuration

The project is pre-configured for Cloudflare:

### Build Configuration
- Static export enabled (`output: 'export'`)
- Image optimization disabled for compatibility
- Proper build output directory set

### Database Setup
- SQLite database with Prisma ORM
- Automatic database creation on first run
- Cloudflare Pages compatible file-based storage

### Environment Variables
- Pre-configured environment variable names
- Default values for quick deployment
- Security best practices

## 🎯 Post-Deployment Checklist

After deployment, verify these features:

### Basic Functionality
- [ ] Page loads without errors
- [ ] All three tabs (Post, Links, Profile) work
- [ ] MoBoy logo displays correctly
- [ ] Navy blue theme applied

### Wallet Integration
- [ ] Connect wallet button works
- [ ] Phantom wallet detection
- [ ] Wallet address displays correctly

### Posting System
- [ ] Can submit valid URLs
- [ ] Duplicate prevention works
- [ ] Invalid URL rejection works
- [ ] Success notifications appear

### Public Features
- [ ] Links tab works without wallet connection
- [ ] Community posts display
- [ ] Copy buttons work
- [ ] Links open in new tabs

### Profile Features
- [ ] Post count displays correctly
- [ ] Reward calculation works (25,000 per post)
- [ ] Claim button enables at 1M coins
- [ ] Claim rewards functionality works

## 🐛 Common Issues & Solutions

### Build Fails
**Problem**: Build process fails on Cloudflare
**Solution**: 
- Check package.json dependencies
- Verify Node.js version compatibility
- Review build logs in Cloudflare dashboard

### Database Errors
**Problem**: Database connection issues
**Solution**:
- Verify DATABASE_URL environment variable
- Check Prisma schema syntax
- Ensure file permissions are correct

### Wallet Connection Issues
**Problem**: Wallet won't connect
**Solution**:
- Install Phantom wallet browser extension
- Check browser compatibility
- Verify wallet is unlocked

### Images Not Loading
**Problem**: MoBoy logo doesn't display
**Solution**:
- Check image URL accessibility
- Verify image format is supported
- Test with different browsers

## 📞 Getting Help

If you encounter issues:

1. **Check Cloudflare Logs**
   - Go to Pages dashboard
   - Click on your deployment
   - View build and function logs

2. **Test Locally**
   ```bash
   npm install
   npm run dev
   ```
   - Verify functionality locally
   - Compare with deployed version

3. **Browser Console**
   - Open developer tools (F12)
   - Check for JavaScript errors
   - Review network requests

4. **Community Support**
   - Check GitHub issues
   - Review documentation
   - Contact support forums

## 🎉 Success!

Once deployed, your MoBoy Web3 platform will be live and ready for users to:
- Connect their Solana wallets
- Post Momo Coin content
- View community posts
- Earn and claim rewards

**Your platform is now live at**: `https://your-project.pages.dev`

---

**MoBoy Web3** 🐮
*Built for Cloudflare Pages - Deploy in minutes, scale instantly*