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

describe('POST /api/v1/migrations', () => {
  it('applies pending migrations', async () => {
    // Fake dbClient with just the method used by handler.finally.
    (getNewClient as jest.Mock).mockResolvedValue({ end: jest.fn() });
    // POST should apply migrations and return applied items.
    (runMigrations as jest.Mock).mockResolvedValue(['0001_create_users_table']);
    const { req, res } = createMocks({ method: 'POST' });

    await handler(req, res);

    // 201 when at least one migration ran; 200 when nothing to run.
    expect([200, 201]).toContain(res._getStatusCode());
    expect(Array.isArray(res._getJSONData())).toBe(true);
    // Ensures endpoint is calling migration runner with expected semantics.
    expect(runMigrations).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: 'up',
        dryRun: false,
        migrationsTable: 'pgmigrations'
      })
    );
  });
});
