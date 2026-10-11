import { Router, Request, Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/healthz', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'skillgap-gateway',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});
