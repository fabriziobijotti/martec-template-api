import type { NextApiRequest, NextApiResponse } from 'next';
import { join } from 'node:path';
import { getNewClient } from '@/infra/database';
import { runMigrations } from '@/infra/migration-runner';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Use a dedicated client because migration runner expects dbClient.
  const dbClient = await getNewClient();

  // Shared options for both "preview pending" (GET) and "apply" (POST).
  const defaultOptions = {
    dbClient,
    dir: join('infra', 'migrations'),
    direction: 'up' as const,
    migrationsTable: 'pgmigrations',
    verbose: true
  };

  try {
    // GET: dry-run only, no schema changes. Returns pending migration list.
    if (req.method === 'GET') {
      const pendingMigrations = await runMigrations({
        ...defaultOptions,
        dryRun: true
      });
      return res.status(200).json(pendingMigrations);
    }

    // POST: apply pending migrations.
    if (req.method === 'POST') {
      const migrated = await runMigrations({
        ...defaultOptions,
        dryRun: false
      });
      const status = migrated.length > 0 ? 201 : 200;
      return res.status(status).json(migrated);
    }

    // Any other HTTP method is not allowed.
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    // Keep response generic for safety, detailed error stays in server log.
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    // Always close DB client to avoid connection leaks.
    await dbClient.end();
  }
}
