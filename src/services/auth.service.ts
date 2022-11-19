import { MikroORM, UseRequestContext } from '@mikro-orm/core'
import { User } from '../database/sql/entities/user.entity'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Request } from 'express'
import { Service } from 'typedi'
@Service()
export default class AuthService {
  constructor (private readonly orm: MikroORM) {}

  @UseRequestContext()
  async findBy (criteria: Record<string, string>) {}

  @UseRequestContext()
  async createUser (body: any) {
    const em = this.orm.em
    const user = new User()
    user.firstName = body.firstName
    user.lastName = body.lastName
    user.email = body.email
    user.password = bcrypt.hashSync(body.password, 10)
    await em.persistAndFlush(user)
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: this.generateJwt(user)
    }
  }

  async register (req: Request) {
    const user = await this.createUser(req.body)

    // mailQueue.add(SendWelcomeEmail.jobName, user);

    return user
  }

  @UseRequestContext()
  async login (req: Request) {
    const em = this.orm.em
    const user = await em.findOne(User, { email: req.body.email })

    if (user == null || !bcrypt.compareSync(req.body.password, user.password)) {
      throw new Error('User not found')
    }

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token: this.generateJwt(user)
    }
  }

  generateJwt (user: User) {
    if (process.env.JWT_SECRET === undefined) {
      throw new Error('JWT secret not set')
    }
    return jwt.sign(
      {
        sub: user.id,
        iat: Math.floor(Date.now() / 1000),
        iss: 'api.example.com',
        aud: 'app.example.com'
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    )
  }
}
