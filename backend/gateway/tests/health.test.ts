import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Gateway Health Endpoint', () => {
  const app = createApp();

  it('GET /healthz returns 200 and ok status', async () => {
    const res = await request(app).get('/healthz');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('skillgap-gateway');
  });
});
