# CryptoEase - Telegram Mini App for Crypto Purchases

A complete Telegram Mini App that allows users to buy cryptocurrency (BTC, ETH, USDC, STRK) with Nigerian Naira. Built with React, Express, and integrated with Starknet blockchain for secure token transactions.

## 🚀 Features

- **No Account Required**: Anonymous crypto purchases with just wallet address
- **Multiple Tokens**: Support for BTC, ETH, USDC, and STRK tokens
- **Real-time Rates**: Live cryptocurrency rates from CoinGecko API
- **Mobile-First**: Optimized for Telegram's mobile interface
- **Secure Payments**: Integration with Flutterwave/Paystack payment gateways
- **Blockchain Integration**: Direct token transfers via Starknet
- **Transaction History**: Local storage of transaction records
- **Multi-language**: Responsive design with Telegram theme integration

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** components with shadcn/ui
- **TanStack Query** for data fetching
- **Wouter** for routing
- **Vite** for build tooling

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** with PostgreSQL
- **Starknet.js** for blockchain interactions
- **Rate limiting** and security middleware

### Blockchain
- **Starknet** mainnet integration
- **Token contracts** for BTC, ETH, USDC, STRK
- **Wallet validation** and transaction monitoring

## 📋 Prerequisites

Before running this project locally, ensure you have:

- **Node.js 20+** installed
- **npm** or **yarn** package manager
- **PostgreSQL** database (local or cloud)
- **Git** for version control

## 🏃‍♂️ Local Development Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd cryptoease-telegram-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/cryptoease
PGHOST=localhost
PGPORT=5432
PGDATABASE=cryptoease
PGUSER=postgres
PGPASSWORD=your_password

# Development Mode
NODE_ENV=development
PORT=5000

# Payment Gateway (Development Keys)
PAYMENT_PROVIDER=flutterwave
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-test-key
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your-test-key

# External APIs
COINGECKO_API_KEY=CG-demo-api-key

# Telegram (Optional for local development)
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_BOT_USERNAME=your-bot-username
```

### 4. Database Setup

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres createdb cryptoease
sudo -u postgres createuser cryptoease_user -P
sudo -u postgres psql
# In PostgreSQL shell:
GRANT ALL PRIVILEGES ON DATABASE cryptoease TO cryptoease_user;
\\q
```

#### Option B: Cloud Database (Recommended)
- Sign up for [Neon](https://neon.tech) or [Supabase](https://supabase.com)
- Create a new PostgreSQL database
- Copy the connection string to your `.env` file

### 5. Initialize Database

```bash
# Push schema to database
npm run db:push
```

### 6. Start Development Server

```bash
# Start the full-stack application
npm run dev
```

This will start:
- **Backend API** on `http://localhost:5000`
- **Frontend** accessible through the same port
- **Hot reload** for both frontend and backend changes

### 7. Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

You should see the CryptoEase interface with:
- Token selection dropdown (BTC, ETH, USDC, STRK)
- Amount input field
- Wallet address input
- Real-time rate display

## 🧪 Testing the Application

### 1. Test Basic Flow
1. Select a token (e.g., USDC)
2. Enter amount (e.g., 50000 for ₦500)
3. Enter any wallet address for testing
4. Click "GET QUOTE" to see transaction summary
5. Proceed through the mock payment flow

### 2. Test API Endpoints

```bash
# Test rates endpoint
curl http://localhost:5000/api/rates

# Test quote endpoint
curl -X POST http://localhost:5000/api/quote \\
  -H "Content-Type: application/json" \\
  -d '{"tokenSymbol":"USDC","amountNgn":50000}'
```

### 3. Database Inspection

```bash
# Open Drizzle Studio to inspect data
npm run db:studio
```

## 📁 Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   └── index.css      # Global styles
│   └── index.html
├── server/                 # Backend Express application
│   ├── db.ts              # Database connection
│   ├── storage.ts         # Data access layer
│   ├── routes.ts          # API routes
│   ├── payments.ts        # Payment gateway integration
│   ├── blockchain.ts      # Starknet integration
│   ├── middleware.ts      # Security and validation
│   ├── cache.ts           # Caching system
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schemas
├── docs/                   # Documentation
│   ├── DEPLOYMENT_GUIDE.md
│   ├── TELEGRAM_SETUP.md
│   └── LEGAL_COMPLIANCE.md
└── config files           # Configuration files
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run db:push          # Push schema changes to database
npm run db:studio        # Open Drizzle Studio

# Building
npm run build            # Build for production
npm run build:client     # Build frontend only
npm run build:server     # Build backend only

# Production
npm start                # Start production server

# Database
npm run db:migrate       # Run database migrations
npm run db:studio        # Database management interface

# Utility
npm run check            # Type checking
npm test                 # Run tests
npm run lint             # Code linting
```

## 🌐 Production Deployment

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with automatic builds on push

### Backend Deployment (Railway)
1. Connect repository to Railway
2. Configure environment variables
3. Deploy with automatic scaling

### Database Deployment
- Use Neon, Supabase, or AWS RDS for PostgreSQL
- Run `npm run db:push` to set up tables

Detailed deployment instructions are available in [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## 🔐 Security Features

- **Rate Limiting**: API endpoints protected against abuse
- **Input Validation**: All user inputs sanitized and validated
- **Security Headers**: Helmet.js for security headers
- **Webhook Verification**: Payment gateway webhook signatures verified
- **Environment Isolation**: Separate development and production configurations

## 📱 Telegram Integration

To use as a Telegram Mini App:

1. Create a Telegram bot via [@BotFather](https://t.me/BotFather)
2. Configure web app URL
3. Set up webhooks for production
4. Follow [TELEGRAM_SETUP.md](./TELEGRAM_SETUP.md) for detailed instructions

## 🏛 Legal Compliance

This application includes compliance features for Nigerian regulations:

- **KYC/AML**: Know Your Customer and Anti-Money Laundering checks
- **Transaction Limits**: Configurable limits based on user verification
- **NDPR Compliance**: Nigeria Data Protection Regulation compliance
- **Audit Logging**: Comprehensive transaction and activity logging

See [LEGAL_COMPLIANCE.md](./LEGAL_COMPLIANCE.md) for detailed information.

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Error**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -h localhost -U cryptoease_user -d cryptoease
```

**2. Port Already in Use**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

**3. Module Not Found Errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**4. TypeScript Errors**
```bash
# Check TypeScript compilation
npm run check

# Clear TypeScript cache
npx tsc --build --clean
```

### Development Tips

- Use `npm run db:studio` to inspect database tables
- Check browser console for frontend errors
- Monitor server logs for backend issues
- Use environment variables for all configuration
- Test payment flows with test API keys first

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- 📧 Email: support@cryptoease.com
- 💬 Telegram: [@cryptoease_support](https://t.me/cryptoease_support)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/cryptoease/issues)

## 📝 Changelog

### v1.0.0 (2025-01-03)
- Initial release
- Support for BTC, ETH, USDC, STRK tokens
- Flutterwave/Paystack payment integration
- Starknet blockchain integration
- Telegram Mini App functionality
- Nigerian Naira support
- Production-ready security features

---

**⚠️ Disclaimer**: This software is for educational and development purposes. Ensure compliance with local regulations before deploying in production. Always conduct thorough testing with small amounts before handling larger transactions.