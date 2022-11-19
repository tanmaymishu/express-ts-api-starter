import { Options } from '@mikro-orm/postgresql'
import dotenv from 'dotenv'
import path from 'path'

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' })
} else {
  dotenv.config({ path: '.env' })
}

const config: Options = {
  entities: [path.join(__dirname, '/database/sql/entities')], // path to our JS entities (dist), relative to `baseDir`
  entitiesTs: [path.join(__dirname, '/database/sql/entities')], // path to our TS entities (src), relative to `baseDir`
  host: process.env.DB_HOST,
  dbName: process.env.DB_DATABASE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT as string),
  type: 'postgresql', // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`
  migrations: {
    tableName: 'migrations', // name of database table with log of executed transactions
    path: path.join(__dirname, '/database/sql/migrations'), // path to the folder with migrations
    pathTs: path.join(__dirname, '/database/sql/migrations'), // path to the folder with TS migrations (if used, we should put path to compiled files in `path`)
    glob: '!(*.d).{js,ts}', // how to match migration files (all .js and .ts files, but not .d.ts)
    transactional: true, // wrap each migration in a transaction
    disableForeignKeys: true, // wrap statements with `set foreign_key_checks = 0` or equivalent
    allOrNothing: true, // wrap all migrations in master transaction
    dropTables: true, // allow to disable table dropping
    safe: false, // allow to disable table and column dropping
    snapshot: true, // save snapshot when creating new migrations
    emit: 'ts' // migration generation mode
    // generator: TSMigrationGenerator // migration generator, e.g. to allow custom formatting
  }
}

export default config

export function withConfig (options: Partial<Options>): Options {
  return {
    ...config,
    ...options
  }
}
