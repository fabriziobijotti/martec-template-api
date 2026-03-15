import { runner, type RunnerOption } from 'node-pg-migrate';

// Wrapper around node-pg-migrate runner.
// Why this file exists:
// - Keeps external migration dependency isolated in one place.
// - Makes endpoint tests simpler by mocking this function.
// - Avoids repeating direct runner imports across the codebase.
export function runMigrations(options: RunnerOption) {
  return runner(options);
}
