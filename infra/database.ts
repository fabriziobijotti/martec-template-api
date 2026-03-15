import { Client, type ClientConfig, type QueryResult, type QueryResultRow } from 'pg';

// Define SSL strategy.
// Local development does not use SSL. Production enables SSL for managed databases.
function getSSL(): boolean | { rejectUnauthorized: boolean } {
  if (process.env.NODE_ENV === 'production') {
    return { rejectUnauthorized: false };
  }

  return false;
}

// Creates a brand-new PostgreSQL client using environment variables.
// Priority:
// 1) If DATABASE_URL exists, it is used as connection string.
// 2) Otherwise, individual POSTGRES_* vars are used.
export async function getNewClient() {
  const config: ClientConfig = {
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT),
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: getSSL()
  };

  if (process.env.DATABASE_URL) {
    config.connectionString = process.env.DATABASE_URL;
  }

  const client = new Client(config);
  await client.connect();
  return client;
}

// Utility for one-off queries.
// It opens a client, executes the query, and always closes the connection.
// Use this for simple read/write operations without manual connection management.
export async function query<T extends QueryResultRow = QueryResultRow>(
  queryObject: string | { text: string; values?: unknown[] }
): Promise<QueryResult<T>> {
  let client;

  try {
    client = await getNewClient();
    const result = await client.query<T>(queryObject);
    return result;
  } finally {
    if (client) {
      await client.end();
    }
  }
}
