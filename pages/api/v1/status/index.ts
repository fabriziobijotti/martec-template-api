import type { NextApiRequest, NextApiResponse } from 'next';
import { query } from '@/infra/database';

// Response contract returned by GET /api/v1/status.
type ResponseData = {
  update_at: string;
  dependencies: {
    database: {
      version: string;
      max_connections: number;
      opened_connections: number;
    };
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData | { error: string }>
) {
  // This endpoint is read-only.
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // API generation timestamp.
  const updatedAt = new Date().toISOString();

  // PostgreSQL version (example: 17.1).
  const versionRes = await query<{ server_version: string }>('SHOW server_version;');
  const version = versionRes.rows[0].server_version;

  // DB configured max connections.
  const maxConnRes = await query<{ max_connections: string }>('SHOW max_connections;');
  const maxConnections = parseInt(maxConnRes.rows[0].max_connections, 10);

  // Active connections for current database.
  const dbName = process.env.POSTGRES_DB || 'martec_dev';
  const openedRes = await query<{ count: number }>({
    text: 'SELECT count(*)::int AS count FROM pg_stat_activity WHERE datname = $1;',
    values: [dbName]
  });
  const openedConnections = openedRes.rows[0].count;

  // Returns a compact health/status payload.
  return res.status(200).json({
    update_at: updatedAt,
    dependencies: {
      database: {
        version,
        max_connections: maxConnections,
        opened_connections: openedConnections
      }
    }
  });
}
