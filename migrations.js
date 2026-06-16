import db from './db.js';

async function runMigrations() {
  try {
    const hasTodos = await db.schema.hasTable('todos');
    
    if (!hasTodos) {
      await db.schema.createTable('todos', (table) => {
        table.increments('id').primary();
        table.string('task').notNullable();
        table.string('list').notNullable(); 
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      console.log('Created table: todos table');
    } else {
      console.log('Table "todos" already exists.');
    }
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await db.destroy();
    console.log('Database connection closed. Exiting.');
  }
}

runMigrations();