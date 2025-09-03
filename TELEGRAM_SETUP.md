# Telegram Bot Setup Guide

## Step 1: Create Your Telegram Bot

1. **Contact BotFather**
   - Open Telegram and search for `@BotFather`
   - Start a conversation and type `/newbot`
   - Choose a name for your bot (e.g., "CryptoEase Bot")
   - Choose a username (must end in 'bot', e.g., "cryptoease_bot")
   - Save the bot token provided

2. **Configure Bot Settings**
   ```
   /setcommands
   start - Start using CryptoEase
   buy - Buy cryptocurrency
   history - View transaction history
   support - Contact support
   help - Get help
   ```

3. **Set Bot Description**
   ```
   /setdescription
   Buy cryptocurrency easily with Nigerian Naira. Secure, fast, and anonymous crypto purchases on Starknet blockchain.
   ```

4. **Configure Web App**
   ```
   /setmenubutton
   [Your Bot Name]
   https://your-domain.com
   ```

## Step 2: Environment Variables

Add these to your production environment:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_BOT_USERNAME=your_bot_username
TELEGRAM_WEBHOOK_URL=https://your-api-domain.com/api/telegram/webhook
TELEGRAM_WEBHOOK_SECRET=your_secure_random_string
```

## Step 3: Webhook Configuration

Set up webhook for production:

```bash
curl -X POST "https://api.telegram.org/bot<YourBotToken>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-api-domain.com/api/telegram/webhook",
    "secret_token": "your_webhook_secret"
  }'
```

## Step 4: Test Your Bot

1. Search for your bot in Telegram
2. Start a conversation with `/start`
3. Use the menu button to launch the Web App
4. Test the full crypto purchase flow

## Step 5: Submit for Review

1. Test thoroughly on testnet first
2. Ensure all features work properly
3. Submit to Telegram for review if needed
4. Monitor for any issues after going live