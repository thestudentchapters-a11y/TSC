import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from './config/env';
import { apiLimiter } from './middleware/rateLimit';
import { errorHandler, notFoundHandler } from './middleware/error';
import { registerRoutes } from './routes';

export function createApp(): Application {
  const app = express();

  app.set('trust proxy', 1);

  /* Security & parsing */
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));
  app.use(cookieParser());
  app.use(mongoSanitize()); // MongoDB query injection protection

  /* Rate limiting */
  app.use('/api', apiLimiter);

  /* Routes */
  registerRoutes(app);

  /* Errors */
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
