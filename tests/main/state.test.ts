import { describe, it, expect } from 'vitest';
import { appState } from '../../src/main/state';

describe('appState', () => {
  it('has activeConnection initialized to null', () => {
    expect(appState).toHaveProperty('activeConnection');
  });

  it('can set and read activeConnection', () => {
    const conn = {
      id: '1',
      name: 'test',
      host: 'localhost',
      port: 5432,
      user: 'pg',
      password: 'pw',
      database: 'db',
    };
    appState.activeConnection = conn;
    expect(appState.activeConnection).toEqual(conn);
    appState.activeConnection = null;
    expect(appState.activeConnection).toBeNull();
  });
});
