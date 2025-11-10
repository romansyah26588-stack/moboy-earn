# MoBoy - Posting About Momo Coin

A Web3 platform for posting and sharing Momo Coin content with Solana wallet integration, optimized for Cloudflare deployment.

## 🚀 Features

- **Solana Wallet Integration** - Connect with Phantom wallet
- **Three-Tab Interface** - Post, Links, and Profile sections
- **Public Content Discovery** - Anyone can view community posts without login
- **Reward System** - Earn 25,000 Momo Coin per post
- **Link Validation** - Prevent duplicate submissions and ensure valid URLs
- **Responsive Design** - Navy blue futuristic theme with mobile support
- **Cloudflare Ready** - Optimized for Cloudflare Pages deployment

## 📋 Requirements

- Cloudflare account (Free tier works)
- Git repository (GitHub, GitLab, etc.)
- Node.js (for local development only)

## 🛠️ Quick Start - Cloudflare Deployment

### Step 1: Prepare Your Repository
1. Upload all project files to your Git repository
2. Make sure the repository is public or accessible by Cloudflare

### Step 2: Deploy to Cloudflare Pages
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** section
3. Click **"Create a project"**
4. Connect your Git repository
5. Select the repository containing MoBoy files
6. Configure build settings:
   - **Framework preset**: `Next.js`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
7. Click **"Save and Deploy"**

### Step 3: Environment Variables
Add these environment variables in Cloudflare Pages settings:
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key-here"
```

### Step 4: Database Setup
The application uses SQLite with Prisma ORM. The database file will be automatically created on first deployment.

## 📁 Project Structure

```
moboy-web3/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── posts/
│   │   │   │   └── route.ts
│   │   │   └── user/
│   │   │       ├── claim-rewards/
│   │   │       │   └── route.ts
│   │   │       └── profile/
│   │   │           └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   └── ui/
│   │       ├── alert.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── label.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       └── toaster.tsx
│   ├── lib/
│   │   ├── db.ts
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
├── prisma/
│   └── schema.prisma
├── public/
│   └── favicon.ico
├── .env.example
├── .gitignore
├── next.config.js
├── package.json
├── README.md
└── tsconfig.json
```

## ⚙️ Configuration Files

### package.json
```json
{
  "name": "moboy-web3",
  "version": "1.0.0",
  "description": "MoBoy - Posting About Momo Coin",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:generate": "prisma generate"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0",
    "lucide-react": "^0.400.0",
    "sonner": "^1.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "autoprefixer": "^10.0.0",
    "postcss": "^8.0.0",
    "tailwindcss": "^3.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^15.0.0"
  }
}
```

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL
  }
}

module.exports = nextConfig
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  walletAddress String  @unique
  postCount    Int      @default(0)
  rewardsClaimed Int    @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  posts        Post[]
}

model Post {
  id           String   @id @default(cuid())
  linkUrl      String   @unique
  walletAddress String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  user         User     @relation(fields: [walletAddress], references: [walletAddress])
}
```

## 🎨 Features Explained

### Post Tab
- Submit Momo Coin related content links
- URL validation to prevent invalid submissions
- Duplicate link detection
- Real-time feedback with toast notifications

### Links Tab
- **Public Access** - No wallet connection required
- View all community posts
- Copy links and wallet addresses
- Sort by date (newest first)

### Profile Tab
- Personal statistics dashboard
- Reward tracking (25,000 Momo Coin per post)
- Claim rewards when reaching 1,000,000 Momo Coin
- Wallet information display

## 🔐 Security Features

- Input validation for all forms
- URL format verification
- Duplicate content prevention
- Wallet address validation
- XSS protection through React

## 🌐 Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📱 Mobile Responsive

- Touch-friendly interface
- Optimized for mobile devices
- Progressive Web App ready

## 🚀 Deployment Tips

### For Cloudflare Pages
1. Use the **Next.js** framework preset
2. Enable **Node.js compatibility** in settings
3. Set **Build output directory** to `out`
4. Configure **environment variables** in Cloudflare dashboard

### Environment Variables Required
```
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secure-secret-key"
```

## 🐛 Troubleshooting

### Common Issues
1. **Build fails**: Check Node.js version compatibility
2. **Database errors**: Verify DATABASE_URL environment variable
3. **Wallet connection**: Ensure Phantom wallet is installed
4. **Posts not showing**: Check API endpoints are accessible

### Solutions
- Clear browser cache and reload
- Check Cloudflare deployment logs
- Verify environment variables
- Test with different browsers

## 📞 Support

For issues and questions:
1. Check this README first
2. Review Cloudflare deployment logs
3. Test locally with `npm run dev`
4. Check browser console for errors

## 📄 License

MIT License - Free to use and modify

---

**MoBoy - Posting About Momo Coin** 🐮
Built with Next.js, TypeScript, and Tailwind CSS
Optimized for Cloudflare Pages deployment