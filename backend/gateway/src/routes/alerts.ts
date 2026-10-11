import { Router, Request, Response } from 'express';
import { z } from 'zod';

export const alertsRouter = Router();

export interface Notifier {
  send(recipient: string, subject: string, message: string): Promise<boolean>;
}

export class EmailNotifier implements Notifier {
  async send(recipient: string, subject: string, message: string): Promise<boolean> {
    console.log(`[EmailNotifier] Sending Email to ${recipient} | Subject: "${subject}"\nBody: ${message}`);
    return true;
  }
}

export class WhatsAppNotifier implements Notifier {
  async send(recipient: string, subject: string, message: string): Promise<boolean> {
    console.log(`[WhatsAppNotifier Stub] Dispatching WhatsApp message to ${recipient} [${subject}]: ${message}`);
    return true;
  }
}

const emailNotifier = new EmailNotifier();
const whatsAppNotifier = new WhatsAppNotifier();

interface Subscription {
  id: number;
  userId: string;
  emailOrPhone: string;
  channel: 'email' | 'whatsapp' | 'in_app';
  stateScope?: string;
  districtScope?: string;
  severityFilter: string;
  createdAt: string;
}

const inMemorySubscriptions: Subscription[] = [
  {
    id: 1,
    userId: 'usr_dist_jaipur',
    emailOrPhone: 'jaipur@skillgap.gov.in',
    channel: 'email',
    stateScope: '08',
    districtScope: '091',
    severityFilter: 'critical_shortage',
    createdAt: new Date().toISOString()
  }
];

const subscribeSchema = z.object({
  emailOrPhone: z.string().min(5),
  channel: z.enum(['email', 'whatsapp', 'in_app']),
  stateScope: z.string().optional(),
  districtScope: z.string().optional(),
  severityFilter: z.string().default('all')
});

alertsRouter.get('/alerts/subscriptions', (_req: Request, res: Response) => {
  res.json(inMemorySubscriptions);
});

alertsRouter.post('/alerts/subscribe', (req: Request, res: Response) => {
  const result = subscribeSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid subscription payload', details: result.error.errors }
    });
  }

  const newSub: Subscription = {
    id: inMemorySubscriptions.length + 1,
    userId: 'usr_active',
    ...result.data,
    createdAt: new Date().toISOString()
  };
  inMemorySubscriptions.push(newSub);
  return res.status(201).json(newSub);
});

alertsRouter.post('/alerts/dispatch', async (req: Request, res: Response) => {
  const { alertTitle, alertMessage, severity } = req.body;
  const dispatched = [];

  for (const sub of inMemorySubscriptions) {
    if (sub.severityFilter !== 'all' && sub.severityFilter !== severity) {
      continue;
    }

    if (sub.channel === 'whatsapp') {
      await whatsAppNotifier.send(sub.emailOrPhone, alertTitle || 'Early Warning Alert', alertMessage || 'Critical Shortage Flagged');
    } else {
      await emailNotifier.send(sub.emailOrPhone, alertTitle || 'Early Warning Alert', alertMessage || 'Critical Shortage Flagged');
    }
    dispatched.push(sub.emailOrPhone);
  }

  return res.json({
    status: 'dispatched',
    count: dispatched.length,
    recipients: dispatched
  });
});
