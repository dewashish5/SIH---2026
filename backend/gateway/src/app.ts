import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import pinoHttp from 'pino-http';
import dotenv from 'dotenv';
import { healthRouter } from './routes/health';
import { authRouter } from './routes/auth';
import { exportRouter } from './routes/export';
import { overridesRouter } from './routes/overrides';
import { alertsRouter } from './routes/alerts';
import { assistantRouter } from './routes/assistant';
import { createApiProxy } from './routes/proxy';

dotenv.config();

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: { colorize: true }
        }
      : undefined
});

export function createApp(): Express {
  const app = express();
  const apiUrl = process.env.API_URL || 'http://localhost:8000';

  // Security & standard headers
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    })
  );

  // Request logging
  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) => req.url === '/healthz'
      }
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false
  });
  app.use(limiter);

  // Health endpoint
  app.use(healthRouter);

  // Forward /api/* requests to FastAPI backend
  app.use('/api', createApiProxy(apiUrl));

  // JSON Body parsing for gateway-handled routes (below proxy to avoid body-parser proxy issue)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Gateway routes
  app.use(authRouter);
  app.use(exportRouter);
  app.use(overridesRouter);
  app.use(alertsRouter);
  app.use(assistantRouter);

  // Global Error Handler
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error(err);
    res.status(500).json({
      error: {
        code: 'GATEWAY_INTERNAL_ERROR',
        message: err.message || 'An unexpected internal error occurred'
      }
    });
  });

  return app;
}
