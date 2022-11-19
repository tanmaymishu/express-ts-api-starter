import DatabaseServiceProvider from '../../src/providers/database-service.provider'
import { User } from '../../src/database/sql/entities/user.entity'
import Container from 'typedi'
import AuthService from '../../src/services/auth.service'
import { loadProviders, closeDB } from '../bootstrap'

beforeEach(async () => {
  await loadProviders([DatabaseServiceProvider])
})

afterEach(async () => {
  await closeDB()
})

describe('auth', () => {
  describe('auth service', () => {
    it('can generate JWT for a user', async () => {
      const user = new User()
      user.firstName = 'John'
      user.lastName = 'Doe'
      user.email = 'john@example.com'
      user.password = 'password'
      user.id = 1
      const jwt = Container.get(AuthService).generateJwt(user)
      expect(jwt).toBeDefined()
    })
  })
})
