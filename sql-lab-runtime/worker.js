/* global initSqlJs */
self.importScripts('sql-wasm.js');

const engine = initSqlJs({ locateFile: (file) => new URL(file, self.location.href).href });
const rowLimit = 100;

function runQuery(db, query) {
  let table;
  for (const statement of db.iterateStatements(query)) {
    if (table) throw new Error('Выполни один запрос за раз.');
    const columns = statement.getColumnNames();
    if (!columns.length) throw new Error('Запрос должен возвращать таблицу.');
    const rows = [];
    let truncated = false;
    while (statement.step()) {
      if (rows.length >= rowLimit) {
        truncated = true;
        break;
      }
      rows.push(statement.get().map((cell) => cell instanceof Uint8Array ? `BLOB (${cell.length} байт)` : cell));
    }
    table = { columns, rows, truncated };
  }
  if (!table) throw new Error('Введи запрос SQL.');
  return table;
}

function comparable(table) {
  return JSON.stringify([
    table.columns,
    table.rows.map((row) => JSON.stringify(row)).sort(),
  ]);
}

self.onmessage = async ({ data }) => {
  try {
    const { query, schema, fixtures, expected } = data;
    if (!/^(?:\s|--[^\r\n]*|\/\*[\s\S]*?\*\/)*(?:SELECT|WITH)\b/i.test(query)) {
      throw new Error('Используй один запрос SELECT или WITH.');
    }
    const SQL = await engine;
    const results = fixtures.map((fixture) => {
      const db = new SQL.Database();
      try {
        db.run(schema + fixture);
        db.run('PRAGMA query_only = ON;');
        const table = runQuery(db, query);
        const passed = expected && !table.truncated && comparable(table) === comparable(runQuery(db, expected));
        return { table, passed };
      } finally {
        db.close();
      }
    });
    self.postMessage({
      table: results[0].table,
      checks: expected ? results.map(({ passed }, index) => ({
        label: index === 0 ? 'Учебные данные' : `Дополнительный набор ${index}`,
        passed: Boolean(passed),
      })) : undefined,
    });
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : 'Запрос не выполнен.' });
  }
};
