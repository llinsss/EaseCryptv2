# Production Deployment Guide

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database (Neon, Supabase, or self-hosted)
- Domain name with SSL certificate
- Payment gateway account (Flutterwave or Paystack)
- Starknet wallet with tokens for dispensing
- CoinGecko API key

## 1. Database Setup

### Using Neon (Recommended)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Get your connection string
4. Run: `npm run db:push` to create tables

### Self-hosted PostgreSQL
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb cryptoease
sudo -u postgres createuser cryptoease_user -P

# Grant privileges
sudo -u postgres psql
GRANT ALL PRIVILEGES ON DATABASE cryptoease TO cryptoease_user;
```

## 2. Payment Gateway Setup

### Flutterwave Setup
1. Sign up at [flutterwave.com](https://flutterwave.com)
2. Get your API keys from dashboard
3. Set up webhook URL: `https://yourapi.com/api/webhook/payment`
4. Configure virtual account settings

### Paystack Setup
1. Sign up at [paystack.com](https://paystack.com)
2. Get your API keys from dashboard
3. Set up webhook URL: `https://yourapi.com/api/webhook/payment`
4. Enable dedicated accounts feature

## 3. Starknet Setup

### Wallet Setup
1. Create a Starknet wallet (ArgentX or Braavos)
2. Fund it with tokens you want to dispense
3. Export private key securely
4. Never share private keys

### Contract Addresses (Mainnet)
```env
ETH_CONTRACT_ADDRESS=0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7
USDC_CONTRACT_ADDRESS=0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8
STRK_CONTRACT_ADDRESS=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
```

## 4. Frontend Deployment (Vercel)

1. **Connect Repository**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```

2. **Environment Variables**
   Add in Vercel dashboard:
   ```env
   VITE_API_URL=https://your-backend-domain.com
   VITE_TELEGRAM_BOT_USERNAME=your_bot_username
   ```

3. **Build Settings**
   - Build Command: `npm run build:client`
   - Output Directory: `client/dist`
   - Install Command: `npm install`

## 5. Backend Deployment (Railway)

1. **Connect Repository**
   ```bash
   npm install -g @railway/cli
   railway login
   railway link
   ```

2. **Environment Variables**
   Set in Railway dashboard (copy from .env.example):
   ```env
   NODE_ENV=production
   DATABASE_URL=your_database_url
   FLUTTERWAVE_SECRET_KEY=your_secret_key
   # ... all other environment variables
   ```

3. **Deploy**
   ```bash
   railway up
   ```

## 6. Domain and SSL Setup

1. **Custom Domain**
   - Point your domain to Vercel (frontend)
   - Point api.yourdomain.com to Railway (backend)

2. **SSL Certificates**
   - Vercel provides automatic SSL
   - Railway provides automatic SSL
   - Verify HTTPS is working

## 7. Monitoring and Logging

### Add Error Tracking
```bash
npm install @sentry/node @sentry/tracing
```

### Set up Health Checks
```javascript
// Add to your routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
```

### Monitor Database
- Set up connection pool monitoring
- Monitor query performance
- Set up automated backups

## 8. Security Checklist

- [ ] All environment variables are secure
- [ ] HTTPS is enabled everywhere
- [ ] Rate limiting is configured
- [ ] Input validation is implemented
- [ ] Webhook signatures are verified
- [ ] Private keys are encrypted
- [ ] Error messages don't leak sensitive info
- [ ] CORS is properly configured

## 9. Testing in Production

1. **Start Small**
   - Test with small amounts first
   - Use testnet initially
   - Monitor all transactions

2. **Load Testing**
   - Test concurrent users
   - Monitor API performance
   - Check database performance

3. **Security Testing**
   - Test rate limiting
   - Verify input validation
   - Check for SQL injection
   - Test webhook security

## 10. Launch Checklist

- [ ] Database is properly backed up
- [ ] All environment variables are set
- [ ] Payment gateway is configured
- [ ] Starknet integration is working
- [ ] Telegram bot is verified
- [ ] Monitoring is set up
- [ ] Terms of service are published
- [ ] Privacy policy is published
- [ ] Support system is ready
- [ ] Legal compliance is verified

## 11. Post-Launch Monitoring

1. **Daily Checks**
   - Monitor transaction success rates
   - Check error logs
   - Verify payment confirmations
   - Monitor user feedback

2. **Weekly Reviews**
   - Analyze user behavior
   - Review financial reconciliation
   - Update security measures
   - Plan feature improvements

3. **Monthly Audits**
   - Security audit
   - Performance review
   - Legal compliance check
   - Financial audit