import { createMocks } from 'node-mocks-http';
import { getNewClient } from '@/infra/database';
import { runMigrations } from '@/infra/migration-runner';
import handler from '@/pages/api/v1/migrations';

// Mock DB connection factory to avoid hitting real database in this unit-level test.
jest.mock('@/infra/database', () => ({
  getNewClient: jest.fn()
}));

// Mock migration runner to avoid loading ESM dependency in Jest runtime.
jest.mock('@/infra/migration-runner', () => ({
  runMigrations: jest.fn()
}));

describe('GET /api/v1/migrations', () => {
  it('returns pending migrations list', async () => {
    // Fake dbClient with just the method used by handler.finally.
    (getNewClient as jest.Mock).mockResolvedValue({ end: jest.fn() });
    // GET should execute dryRun and return pending list.
    (runMigrations as jest.Mock).mockResolvedValue([]);
    const { req, res } = createMocks({ method: 'GET' });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(Array.isArray(res._getJSONData())).toBe(true);
    // Ensures endpoint is calling migration runner with expected semantics.
    expect(runMigrations).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: 'up',
        dryRun: true,
        migrationsTable: 'pgmigrations'
      })
    );
  });
});
