import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/v1/status';

// Integration test:
// this test calls real handler code and expects a real DB response shape.
describe('GET /api/v1/status', () => {
  it('returns database health metadata', async () => {
    // Create fake HTTP req/res objects compatible with Next.js handler.
    const { req, res } = createMocks({ method: 'GET' });

    await handler(req, res);

    // Basic API success check.
    expect(res._getStatusCode()).toBe(200);

    // Contract check: validates response format without hard-coding exact values.
    const body = res._getJSONData();
    expect(body).toEqual(
      expect.objectContaining({
        update_at: expect.any(String),
        dependencies: {
          database: {
            version: expect.any(String),
            max_connections: expect.any(Number),
            opened_connections: expect.any(Number)
          }
        }
      })
    );
  });
});
