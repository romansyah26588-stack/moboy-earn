# Moboy Post to Earn - Solana Ecosystem

A futuristic web application that allows users to submit social media content and earn rewards based on views in the Solana ecosystem.

## Features

- **Wallet Integration**: Connect your Solana wallet (Phantom, Solflare, etc.)
- **Content Submission**: Submit links from Twitter, Instagram, YouTube, TikTok, and Facebook
- **Duplicate Prevention**: Automatic validation to prevent duplicate content submissions
- **Performance Tracking**: Real-time tracking of views and earnings
- **Reward System**: Earn SOL tokens based on content performance
- **Futuristic UI**: Navy blue themed interface with Moboy character

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (for development), PostgreSQL (for production)
- **Blockchain**: Solana ecosystem integration
- **Deployment**: Cloudflare Pages, GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Solana wallet (Phantom, Solflare, etc.)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/moboy-post-to-earn.git
cd moboy-post-to-earn
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SOLANA_NETWORK="devnet"
```

5. Set up the database:
```bash
npm run db:push
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Cloudflare Pages

1. Fork this repository
2. Connect your GitHub account to Cloudflare Pages
3. Set up the following environment variables in Cloudflare Pages:
   - `DATABASE_URL`: Your production database URL
   - `NEXTAUTH_SECRET`: A random secret string
   - `NEXTAUTH_URL`: Your Cloudflare Pages domain
   - `NEXT_PUBLIC_SOLANA_NETWORK`: "mainnet-beta"

4. Deploy automatically on push to main branch

### GitHub Actions

The project includes a GitHub Actions workflow that automatically:
- Runs linting and tests
- Builds the application
- Deploys to Cloudflare Pages
- Sets up the database

## API Endpoints

### Authentication
- `POST /api/auth/wallet` - Connect wallet

### Content Management
- `POST /api/content/submit` - Submit new content
- `GET /api/content/list?walletAddress={address}` - Get user's submissions

### Rewards
- `POST /api/rewards/claim` - Claim available rewards

### User Profile
- `GET /api/user/profile?walletAddress={address}` - Get user profile

## Supported Platforms

- Twitter/X
- Instagram
- YouTube
- TikTok
- Facebook

## Database Schema

The application uses Prisma ORM with the following models:

- **User**: Stores wallet address and user statistics
- **ContentSubmission**: Tracks submitted content and performance
- **ViewMetric**: Records view metrics over time
- **RewardClaim**: Tracks reward claims and transactions

## Security Features

- URL validation for social media platforms
- Duplicate content prevention
- Wallet address validation
- Secure API endpoints
- Environment variable protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

---

Built with ❤️ for the Solana ecosystem