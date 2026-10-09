exports.up = async function (knex) {
  await knex.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('category').notNullable();
    table.string('tag');
    table.decimal('rating', 2, 1);
    table.decimal('price', 10, 2).notNullable();
    table.text('image');
    table.text('description');
    table.timestamps(true, true);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('products');
};
