import request from 'supertest'
import app from '../../src/app'
import { refreshDB, closeDB, initUser } from '../bootstrap'

describe('Ping', () => {
  let user: any
  beforeEach(async () => {
    await refreshDB()
    user = await initUser()
  })

  afterAll(async () => {
    await closeDB()
  })

  describe('GET /ping', () => {
    it('returns pong', (done) => {
      void request(app)
        .get('/api/v1/ping')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${user.token}`)
        .expect(
          200,
          {
            message: 'pong'
          },
          done
        )
    })
  })
})
