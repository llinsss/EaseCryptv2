import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import validator from 'validator';
import { Request, Response, NextFunction } from 'express';

// Rate limiting configuration
export const createRateLimiters = () => ({
  // General API rate limiting
  general: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Strict rate limiting for quote requests
  quotes: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // limit each IP to 10 quote requests per minute
    message: {
      error: 'Too many quote requests, please wait before requesting another quote.',
    },
  }),

  // Very strict rate limiting for transaction creation
  transactions: rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // limit each IP to 3 transactions per 5 minutes
    message: {
      error: 'Transaction limit reached. Please wait 5 minutes before creating another transaction.',
    },
  }),

  // Rate limiting for webhook endpoints
  webhooks: rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 50, // allow more for webhook callbacks
    message: {
      error: 'Webhook rate limit exceeded.',
    },
  }),
});

// Security headers middleware
export const securityMiddleware = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'", "https://telegram.org"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.coingecko.com", "wss:"],
      },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding in Telegram
  });
};

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize string inputs
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return validator.escape(obj.trim());
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// Enhanced validation middleware
export const validateTransactionInput = (req: Request, res: Response, next: NextFunction) => {
  const { tokenSymbol, amountNgn, walletAddress, email } = req.body;

  const errors: string[] = [];

  // Validate token symbol
  if (!tokenSymbol || !['BTC', 'ETH', 'USDC'].includes(tokenSymbol)) {
    errors.push('Invalid token symbol');
  }

  // Validate amount
  if (!amountNgn || typeof amountNgn !== 'number' || amountNgn < 100000 || amountNgn > 50000000) {
    errors.push('Amount must be between ₦1,000 and ₦500,000');
  }

  // Validate wallet address
  if (!walletAddress || typeof walletAddress !== 'string' || walletAddress.length < 10) {
    errors.push('Invalid wallet address');
  }

  // Validate email if provided
  if (email && !validator.isEmail(email)) {
    errors.push('Invalid email address');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors,
    });
  }

  next();
};

// Telegram WebApp data validation
export const validateTelegramWebApp = (req: Request, res: Response, next: NextFunction) => {
  const initData = req.headers['x-telegram-init-data'];
  
  if (!initData && process.env.NODE_ENV === 'production') {
    return res.status(401).json({
      error: 'Unauthorized: Invalid Telegram WebApp data',
    });
  }

  // In development, skip validation
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // TODO: Implement proper Telegram WebApp data validation
  // This involves validating the HMAC signature using bot token
  
  next();
};

// Error handling middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  // Don't leak sensitive information in production
  const isDevelopment = process.env.NODE_ENV === 'development';

  res.status(500).json({
    error: 'Internal server error',
    message: isDevelopment ? err.message : 'Something went wrong',
    ...(isDevelopment && { stack: err.stack }),
  });
};

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url, ip } = req;
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    console.log(`${method} ${url} ${statusCode} ${duration}ms - ${ip}`);
    
    // Log suspicious activity
    if (statusCode >= 400) {
      console.warn(`Suspicious request: ${method} ${url} - ${statusCode} from ${ip}`);
    }
  });

  next();
};