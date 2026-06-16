import knex from 'knex';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: path.join( path.dirname(fileURLToPath(import.meta.url)), 'database.sqlite3'),
  },
  useNullAsDefault: true,
  pool: {
    afterCreate: (conn, done) => {
      conn.run('PRAGMA journal_mode=WAL;', done);
    },
  },
});

export default db;