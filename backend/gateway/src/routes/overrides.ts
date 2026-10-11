import { Router, Request, Response } from 'express';
import { z } from 'zod';

export const overridesRouter = Router();

interface OverrideRecord {
  id: number;
  userId: string;
  districtCode: string;
  tradeId: string;
  month: string;
  originalVal: number;
  overrideVal: number;
  reason: string;
  createdAt: string;
}

interface AuditRecord {
  id: number;
  userId: string;
  action: string;
  targetType: string;
  targetId: string;
  oldVal: string;
  newVal: string;
  reason: string;
  createdAt: string;
}

const inMemoryOverrides: OverrideRecord[] = [
  {
    id: 1,
    userId: 'usr_dist_jaipur',
    districtCode: '091',
    tradeId: 'trade_solar_pv',
    month: '2026-10',
    originalVal: 2900,
    overrideVal: 3800,
    reason: 'Sanctioned new PM-Surya Ghar solar rooftop training batch at Jaipur Govt ITI',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const inMemoryAudit: AuditRecord[] = [
  {
    id: 1,
    userId: 'usr_dist_jaipur',
    action: 'CREATE_OVERRIDE',
    targetType: 'PLANNER_OVERRIDE',
    targetId: '091/trade_solar_pv/2026-10',
    oldVal: '2900',
    newVal: '3800',
    reason: 'Sanctioned new PM-Surya Ghar solar rooftop training batch at Jaipur Govt ITI',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const overrideSchema = z.object({
  districtCode: z.string(),
  tradeId: z.string(),
  month: z.string(),
  originalVal: z.number(),
  overrideVal: z.number(),
  reason: z.string().min(10, 'A detailed policy reason (min 10 chars) is mandatory for planner overrides')
});

overridesRouter.get('/overrides', (_req: Request, res: Response) => {
  res.json(inMemoryOverrides);
});

overridesRouter.post('/overrides', (req: Request, res: Response) => {
  const result = overrideSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid override data or missing mandatory justification reason',
        details: result.error.errors
      }
    });
  }

  const { districtCode, tradeId, month, originalVal, overrideVal, reason } = result.data;
  const newRecord: OverrideRecord = {
    id: inMemoryOverrides.length + 1,
    userId: 'usr_planner_active',
    districtCode,
    tradeId,
    month,
    originalVal,
    overrideVal,
    reason,
    createdAt: new Date().toISOString()
  };
  inMemoryOverrides.push(newRecord);

  // Write audit trail
  inMemoryAudit.push({
    id: inMemoryAudit.length + 1,
    userId: 'usr_planner_active',
    action: 'CREATE_OVERRIDE',
    targetType: 'PLANNER_OVERRIDE',
    targetId: `${districtCode}/${tradeId}/${month}`,
    oldVal: String(originalVal),
    newVal: String(overrideVal),
    reason,
    createdAt: new Date().toISOString()
  });

  return res.status(201).json(newRecord);
});

overridesRouter.get('/audit', (_req: Request, res: Response) => {
  res.json(inMemoryAudit);
});
