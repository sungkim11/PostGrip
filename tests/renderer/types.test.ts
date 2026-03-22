import { describe, it, expect } from 'vitest';
import type {
  AppSnapshot,
  ConnectionInput,
  ColumnNode,
  KeyNode,
  IndexNode,
  TableNode,
  SchemaNode,
  QueryResult,
  DdlResult,
  ModifyTableInfo,
  ModifyTableColumn,
  AlterTableAction,
  EditableTableData,
  DmlOperation,
  SafeSavedConnection,
  ActiveConnectionSummary,
  HostStats,
  ActiveQuery,
} from '../../src/renderer/lib/types';

describe('renderer types', () => {
  it('ConnectionInput shape is valid', () => {
    const input: ConnectionInput = {
      name: 'test',
      host: 'localhost',
      port: 5432,
      user: 'admin',
      password: 'pass',
      database: 'mydb',
    };
    expect(input.host).toBe('localhost');
    expect(input.id).toBeUndefined();
  });

  it('AppSnapshot shape is valid', () => {
    const snap: AppSnapshot = {
      savedConnections: [],
      activeConnection: null,
      databaseTree: [],
    };
    expect(snap.savedConnections).toEqual([]);
    expect(snap.activeConnection).toBeNull();
  });

  it('SchemaNode with nested tables', () => {
    const col: ColumnNode = { name: 'id', dataType: 'integer', nullable: false, defaultValue: null };
    const key: KeyNode = { name: 'pk', type: 'PRIMARY KEY', columns: ['id'], referencedTable: null };
    const idx: IndexNode = { name: 'idx_name', isUnique: true, columns: ['name'] };
    const table: TableNode = { name: 'users', tableType: 'BASE TABLE', columns: [col], keys: [key], indexes: [idx] };
    const schema: SchemaNode = { name: 'public', tables: [table] };

    expect(schema.tables[0].columns[0].name).toBe('id');
    expect(schema.tables[0].keys[0].type).toBe('PRIMARY KEY');
    expect(schema.tables[0].indexes[0].isUnique).toBe(true);
  });

  it('QueryResult shape is valid', () => {
    const result: QueryResult = {
      columns: ['id', 'name'],
      rows: [['1', 'Alice']],
      rowCount: 1,
      truncated: false,
      executionTimeMs: 42,
      notice: null,
    };
    expect(result.columns).toHaveLength(2);
    expect(result.rows[0]).toEqual(['1', 'Alice']);
  });

  it('DdlResult shape is valid', () => {
    const ddl: DdlResult = { ddl: 'CREATE TABLE test (id int);' };
    expect(ddl.ddl).toContain('CREATE TABLE');
  });

  it('ModifyTableInfo shape is valid', () => {
    const col: ModifyTableColumn = { name: 'id', dataType: 'integer', nullable: false, defaultValue: null };
    const info: ModifyTableInfo = { schema: 'public', table: 'users', columns: [col] };
    expect(info.columns).toHaveLength(1);
  });

  it('AlterTableAction covers all action types', () => {
    const actions: AlterTableAction[] = [
      { type: 'add_column', columnName: 'email', dataType: 'text', nullable: true },
      { type: 'drop_column', columnName: 'old_col' },
      { type: 'rename_column', columnName: 'name', newColumnName: 'full_name' },
      { type: 'alter_type', columnName: 'age', dataType: 'bigint' },
      { type: 'set_not_null', columnName: 'email' },
      { type: 'drop_not_null', columnName: 'name' },
      { type: 'set_default', columnName: 'status', defaultValue: "'active'" },
      { type: 'drop_default', columnName: 'role' },
      { type: 'rename_table', newTableName: 'accounts' },
    ];
    expect(actions).toHaveLength(9);
    expect(actions.map((a) => a.type)).toEqual([
      'add_column', 'drop_column', 'rename_column', 'alter_type',
      'set_not_null', 'drop_not_null', 'set_default', 'drop_default', 'rename_table',
    ]);
  });

  it('EditableTableData shape is valid', () => {
    const data: EditableTableData = {
      columns: ['id', 'name'],
      columnTypes: ['integer', 'text'],
      rows: [['1', 'Alice'], ['2', null]],
      primaryKeyColumns: ['id'],
      totalCount: 2,
    };
    expect(data.primaryKeyColumns).toEqual(['id']);
    expect(data.rows[1][1]).toBeNull();
  });

  it('DmlOperation covers all operation types', () => {
    const ops: DmlOperation[] = [
      { type: 'insert', values: { name: 'Alice' } },
      { type: 'update', pkValues: { id: '1' }, changes: { name: 'Bob' } },
      { type: 'delete', pkValues: { id: '2' } },
    ];
    expect(ops).toHaveLength(3);
  });

  it('SafeSavedConnection excludes password', () => {
    const safe: SafeSavedConnection = {
      id: '1',
      name: 'test',
      host: 'localhost',
      port: 5432,
      user: 'admin',
      database: 'mydb',
    };
    expect('password' in safe).toBe(false);
  });

  it('ActiveConnectionSummary has label', () => {
    const summary: ActiveConnectionSummary = {
      id: '1',
      label: 'admin@localhost',
      host: 'localhost',
      port: 5432,
      database: 'mydb',
      user: 'admin',
    };
    expect(summary.label).toBe('admin@localhost');
  });

  it('HostStats can have all null fields', () => {
    const stats: HostStats = {
      cpuUsagePercent: null,
      memTotalMb: null,
      memUsedMb: null,
      memUsagePercent: null,
      dbSizeMb: null,
      activeConnections: null,
      maxConnections: null,
      connectionSaturationPercent: null,
      tps: null,
      uptime: null,
      cacheHitRatio: null,
    };
    expect(Object.values(stats).every((v) => v === null)).toBe(true);
  });

  it('ActiveQuery shape is valid', () => {
    const query: ActiveQuery = {
      pid: 123,
      usename: 'admin',
      state: 'active',
      query: 'SELECT 1',
      durationMs: 100,
    };
    expect(query.pid).toBe(123);
  });
});
