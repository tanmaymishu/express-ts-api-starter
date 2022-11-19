import { Container, Service } from 'typedi'
import config from '@/mikro-orm.config'
import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { MikroORM } from '@mikro-orm/core'
import { connect } from 'mongoose'
import ServiceProvider from './service-provider'
import logger from '@/util/logger'
@Service()
export default class DatabaseServiceProvider implements ServiceProvider {
  async register () {
    if (!Container.has(MikroORM)) {
      try {
        const orm = await MikroORM.init<PostgreSqlDriver>(config)
        Container.set(MikroORM, orm)
        // Uncomment the following line to enable query log:
        // orm.config.getLogger().setDebugMode(true);
        console.log('DB connection established')
      } catch (e) {
        logger.info((e as Error).message)
      }
    }

    // Connect to MongoDB. Example DSN: mongodb://username:password@localhost:27017/my_collection
    process.env.MONGO_DSN !== undefined && process.env.MONGO_DSN !== '' && (await connect(process.env.MONGO_DSN))
  }

  async boot () {
    // TODO: Implement method
  }
}
