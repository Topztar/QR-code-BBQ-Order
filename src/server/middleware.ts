import express from 'express';
import compression from 'compression';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}
const rateLimitStore = new Map<string, RateLimitBucket>();

export function createRateLimiter(maxRequests: number, windowMs: number = 60 * 1000, actionName: string = '操作') {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || '127.0.0.1';
    const key = `${actionName}:${ip}`;
    const now = Date.now();

    let bucket = rateLimitStore.get(key);
    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 1, resetAt: now + windowMs };
      rateLimitStore.set(key, bucket);
      return next();
    }

    if (bucket.count >= maxRequests) {
      const waitSec = Math.ceil((bucket.resetAt - now) / 1000);
      return res.status(429).json({
        error: `請求頻率過高：${actionName} 頻率已達上限，請於 ${waitSec} 秒後再試 (Too Many Requests)`
      });
    }

    bucket.count++;
    return next();
  };
}

export function setupMiddleware(app: express.Express) {
  app.use(compression());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.firebaseapp.com https://*.googleapis.com https://apis.google.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://firestore.googleapis.com https://*.cloudfunctions.net https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.google.com/recaptcha/ http://127.0.0.1:8060 http://localhost:8060; frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://www.google.com/recaptcha/; object-src 'none'; base-uri 'self';"
    );
    // Enable CORS for cross-origin local PC bridge requests from Firebase Hosting
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
}
