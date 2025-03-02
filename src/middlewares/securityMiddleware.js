const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const hpp = require('hpp');

// Rate limiting konfiguratsiyasi
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW * 60 * 1000, // minutlarni millisekundlarga o'tkazish
  max: process.env.RATE_LIMIT_MAX, // Har bir IP uchun so'rovlar soni
  message: 'Too many requests from this IP, please try again later'
});

// PDF yuklab olish uchun alohida rate limiting
const downloadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 soat
  max: 10, // Har bir IP uchun soatiga 10 ta yuklash
  message: 'Download limit exceeded, please try again later'
});

// Security middleware'larni export qilish
const securityMiddleware = (app) => {
  // Basic security headers
  app.use(helmet());

  // XSS himoyasi
  app.use(xss());

  // Parameter pollution himoyasi
  app.use(hpp({
    whitelist: [
      'price',
      'rating',
      'publishedYear',
      'categories',
      'language',
      'sort'
    ]
  }));

  // Rate limiting
  app.use('/api', limiter);
  app.use('/api/books/download', downloadLimiter);

  // Content Security Policy
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  }));

  // No Sniff
  app.use(helmet.noSniff());

  // XSS Protection Header
  app.use(helmet.xssFilter());

  // Hide X-Powered-By
  app.use(helmet.hidePoweredBy());

  // Prevent Clickjacking
  app.use(helmet.frameguard({ action: 'deny' }));

  return app;
};

module.exports = securityMiddleware; 