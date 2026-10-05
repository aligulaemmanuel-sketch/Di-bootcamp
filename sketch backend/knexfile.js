require('dotenv').config();

const connection = process.env.DATABASE_URL || {
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'postgres',
};

module.exports = {
  development: {
    client: 'pg',
    connection,
    searchPath: ['public'],
    migrations: { directory: './migrations' },
  },
  production: {
    client: 'pg',
    connection,
    searchPath: ['public'],
    migrations: { directory: './migrations' },
  },
};