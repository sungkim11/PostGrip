import { describe, it, expect } from 'vitest';
import {
  toSavedConnection,
  toSafe,
  toSummary,
  buildConnectionString,
  type ConnectionInput,
  type SavedConnection,
} from '../../src/main/types';

describe('types', () => {
  const input: ConnectionInput = {
    name: 'My DB',
    host: '127.0.0.1',
    port: 5432,
    user: 'admin',
    password: 'pass123',
    database: 'mydb',
  };

  const saved: SavedConnection = {
    id: 'uuid-1',
    name: 'My DB',
    host: '127.0.0.1',
    port: 5432,
    user: 'admin',
    password: 'pass123',
    database: 'mydb',
  };

  describe('toSavedConnection', () => {
    it('generates an id when none provided', () => {
      const result = toSavedConnection(input);
      expect(result.id).toBeDefined();
      expect(result.id.length).toBeGreaterThan(0);
      expect(result.name).toBe('My DB');
      expect(result.host).toBe('127.0.0.1');
      expect(result.port).toBe(5432);
      expect(result.user).toBe('admin');
      expect(result.password).toBe('pass123');
      expect(result.database).toBe('mydb');
    });

    it('preserves provided id', () => {
      const result = toSavedConnection({ ...input, id: 'existing-id' });
      expect(result.id).toBe('existing-id');
    });

    it('generates unique ids for each call', () => {
      const a = toSavedConnection(input);
      const b = toSavedConnection(input);
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('toSafe', () => {
    it('strips password from connection', () => {
      const result = toSafe(saved);
      expect(result).toEqual({
        id: 'uuid-1',
        name: 'My DB',
        host: '127.0.0.1',
        port: 5432,
        user: 'admin',
        database: 'mydb',
      });
      expect('password' in result).toBe(false);
    });
  });

  describe('toSummary', () => {
    it('uses name as label when provided', () => {
      const result = toSummary(saved);
      expect(result.label).toBe('My DB');
      expect(result.id).toBe('uuid-1');
      expect(result.host).toBe('127.0.0.1');
      expect(result.port).toBe(5432);
      expect(result.database).toBe('mydb');
      expect(result.user).toBe('admin');
    });

    it('falls back to user@host when name is empty', () => {
      const result = toSummary({ ...saved, name: '' });
      expect(result.label).toBe('admin@127.0.0.1');
    });

    it('falls back to user@host when name is whitespace', () => {
      const result = toSummary({ ...saved, name: '   ' });
      expect(result.label).toBe('admin@127.0.0.1');
    });
  });

  describe('buildConnectionString', () => {
    it('builds a valid libpq connection string', () => {
      const result = buildConnectionString(saved);
      expect(result).toContain('host=127.0.0.1');
      expect(result).toContain('port=5432');
      expect(result).toContain('user=admin');
      expect(result).toContain('password=pass123');
      expect(result).toContain('dbname=mydb');
      expect(result).toContain('connect_timeout=5');
    });

    it('escapes special characters in values', () => {
      const conn: SavedConnection = {
        ...saved,
        password: "p'ass\\word",
        host: 'host with spaces',
      };
      const result = buildConnectionString(conn);
      expect(result).toContain("password='p\\'ass\\\\word'");
      expect(result).toContain("host='host with spaces'");
    });

    it('wraps empty values in quotes', () => {
      const conn: SavedConnection = { ...saved, password: '' };
      const result = buildConnectionString(conn);
      expect(result).toContain("password=''");
    });
  });
});
