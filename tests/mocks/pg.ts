import { vi } from 'vitest';
import type { SavedConnection } from '../../src/main/types';

export interface MockQueryResult {
  rows: Record<string, unknown>[];
  fields?: { name: string }[];
  command?: string;
  rowCount?: number;
}

export function createMockClient() {
  const queries: Array<{ sql: string; params?: unknown[] }> = [];
  const queryResponses = new Map<string, MockQueryResult>();

  const client = {
    connect: vi.fn().mockResolvedValue(undefined),
    end: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockImplementation((sql: string, params?: unknown[]) => {
      queries.push({ sql, params });
      // Check for exact match first
      for (const [pattern, result] of queryResponses) {
        if (sql.includes(pattern)) {
          return Promise.resolve(result);
        }
      }
      // Default empty result
      return Promise.resolve({ rows: [], fields: [], command: '', rowCount: 0 });
    }),
    _queries: queries,
  };

  return {
    client,
    queryResponses,
    queries,
    mockPg: {
      Client: vi.fn().mockImplementation(() => client),
    },
  };
}

export function testConnection(): SavedConnection {
  return {
    id: 'test-uuid-123',
    name: 'Test DB',
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'secret',
    database: 'testdb',
  };
}
