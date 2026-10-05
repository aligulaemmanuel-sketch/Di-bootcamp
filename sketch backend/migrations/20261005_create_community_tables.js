exports.up = async function (knex) {
  await knex.schema.createTable('community_users', (table) => {
    table.bigIncrements('id').primary();
    table.string('name', 80).notNullable();
    table.string('email', 255).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.text('photo');
    table.timestamps(true, true);
  });

  await knex.schema.createTable('community_posts', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('user_id').notNullable().references('id').inTable('community_users').onDelete('CASCADE');
    table.string('category', 20).notNullable();
    table.string('body', 1200).notNullable();
    table.timestamps(true, true);
    table.index('created_at');
  });

  await knex.schema.createTable('community_comments', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('post_id').notNullable().references('id').inTable('community_posts').onDelete('CASCADE');
    table.bigInteger('user_id').notNullable().references('id').inTable('community_users').onDelete('CASCADE');
    table.string('body', 500).notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('community_likes', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('post_id').notNullable().references('id').inTable('community_posts').onDelete('CASCADE');
    table.bigInteger('user_id').notNullable().references('id').inTable('community_users').onDelete('CASCADE');
    table.timestamps(true, true);
    table.unique(['post_id', 'user_id']);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('community_likes');
  await knex.schema.dropTableIfExists('community_comments');
  await knex.schema.dropTableIfExists('community_posts');
  await knex.schema.dropTableIfExists('community_users');
};