import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export const authRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-skillgap-jwt-key-sih-2026-min-32-chars';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-sih-2026-min-32-chars';

// Hardcoded seeded users matching database seed
const SEEDED_USERS = [
  {
    id: 'usr_national_01',
    email: 'national@skillgap.gov.in',
    passwordHash: bcrypt.hashSync('Admin@12345', 8),
    role: 'national',
    stateScope: null,
    districtScope: null
  },
  {
    id: 'usr_state_rj',
    email: 'rajasthan@skillgap.gov.in',
    passwordHash: bcrypt.hashSync('Admin@12345', 8),
    role: 'state',
    stateScope: '08',
    districtScope: null
  },
  {
    id: 'usr_dist_jaipur',
    email: 'jaipur@skillgap.gov.in',
    passwordHash: bcrypt.hashSync('Admin@12345', 8),
    role: 'district',
    stateScope: '08',
    districtScope: '091'
  },
  {
    id: 'usr_viewer_01',
    email: 'viewer@skillgap.gov.in',
    passwordHash: bcrypt.hashSync('Admin@12345', 8),
    role: 'viewer',
    stateScope: null,
    districtScope: null
  }
];

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

authRouter.post('/auth/login', (req: Request, res: Response) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid email or password payload',
        details: parseResult.error.errors
      }
    });
  }

  const { email, password } = parseResult.data;
  const user = SEEDED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      }
    });
  }

  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    state_scope: user.stateScope,
    district_scope: user.districtScope
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  const refreshToken = jwt.sign({ sub: user.id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

  return res.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      stateScope: user.stateScope,
      districtScope: user.districtScope
    }
  });
});

authRouter.get('/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing token' } });
  }

  try {
    const token = authHeader.replace('Bearer ', '').trim();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return res.json({
      user: {
        id: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        stateScope: decoded.state_scope,
        districtScope: decoded.district_scope
      }
    });
  } catch (_err) {
    return res.status(401).json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } });
  }
});
