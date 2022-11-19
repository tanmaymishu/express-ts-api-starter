import '../src/util/helpers'
import AuthService from '../src/services/auth.service'
import Container from 'typedi'
import orm from '../src/database/sql/data-source'

export async function refreshDB () {
  const mikroOrm = await orm()
  await mikroOrm.getSchemaGenerator().refreshDatabase()
}

export async function closeDB () {
  await (await orm()).close()
}

export async function initUser () {
  return await Container.get(AuthService).createUser({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password'
  })
}

export async function loadProviders (providers: any) {
  for await (const provider of providers) {
    await new provider().register()
  }
}
