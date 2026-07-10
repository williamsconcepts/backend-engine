import db from './db.js';
 
async function runMigrations() {
  try {
    const categories = await db.schema.hasTable('categories');
    const posts = await db.schema.hasTable('posts');
    const comments = await db.schema.hasTable('comments');
    const users = await db.schema.hasTable('users');
 
   
    if (!categories) {
      await db.schema.createTable('categories', (table) => {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      console.log('Created table: categories table');
 
    }
 
    if (!posts){
       await db.schema.createTable('posts', (table) => {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.text('postContent').notNullable();
        table.integer('categoryId').notNullable();
         table.integer('likes').notNullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      console.log('Created table: posts table');
    }
 
   if (!comments){
       await db.schema.createTable('comments', (table) => {
        table.increments('id').primary();
        table.string('userName').notNullable();
        table.integer('postId').notNullable();
        table.text('comment').notNullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
      console.log('Created table: comments table');
    }
 
    if (!users){
       await db.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
        table.string('accessToken').notNullable();
        table.string('role').defaultTo('user').notNullable();
        table.timestamp('created_at').defaultTo(db.fn.now());
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      console.log('Created table: users table');
    } else {
      const hasRole = await db.schema.hasColumn('users', "role");
      if (!hasRole) {
        await db.schema.table('users', (table) => {
          table.string('role').defaultTo('user').notNullable();
        });
        console.log('Added column: users.role');
      }
    }
 
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await db.destroy();
    console.log('Database connection closed. Exiting.');
  }
}
 
runMigrations();