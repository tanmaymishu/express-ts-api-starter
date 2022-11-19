import { PostgreSqlDriver } from '@mikro-orm/postgresql'
import { MikroORM } from '@mikro-orm/core'
import config from '@/mikro-orm.config'
import Container from 'typedi'

export default async function orm (): Promise<MikroORM> {
  if (Container.has(MikroORM)) {
    return Container.get(MikroORM)
  }
  const ormInstance = await MikroORM.init<PostgreSqlDriver>(config)
  Container.set(MikroORM, ormInstance)
  return ormInstance
}
