import { MikroORM } from '@mikro-orm/postgresql'
import { Container, Service } from 'typedi'
import ServiceProvider from './service-provider'
import PassportJWT from 'passport-jwt'
import PassportLocal from 'passport-local'
import passport from 'passport'
import bcrypt from 'bcrypt'
import { Request } from 'express'
import { User } from '../database/sql/entities/user.entity'

@Service()
export default class AuthServiceProvider implements ServiceProvider {
  async register () {
    const JwtStrategy = PassportJWT.Strategy
    // ExtractJwt = PassportJWT.ExtractJwt;

    const customFields = {
      usernameField: 'email',
      passwordField: 'password'
    }
    const LocalStrategy = PassportLocal.Strategy
    const localStrategy = new LocalStrategy(customFields, (username, password, done) => {
      const orm = Container.get(MikroORM)
      orm.em
        .findOne(User, { email: username })
        .then((user) => {
          if (user != null && bcrypt.compareSync(password, user.password)) {
            done(null, user)
          }
          done(null, false)
        })
        .catch((err) => console.log(err))
    })

    passport.use(localStrategy)

    const opts = {
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: function (req: Request) {
        let token = null
        if (req?.cookies !== undefined) token = req.cookies.jwt
        return token
      },
      secretOrKey: process.env.JWT_SECRET,
      issuer: 'api.example.com',
      audience: 'app.example.com'
    }
    const jwtStrategy = new JwtStrategy(opts, (payload, done) => {
      if (Date.now() > payload.exp) {
        done(null, false)
      }
      const orm = Container.get(MikroORM)
      orm.em
        .findOne(User, { id: payload.sub })
        .then((user) => {
          if (user !== undefined) {
            done(null, user)
          }
          done(null, false)
        })
        .catch((err) => console.log(err))
    })

    passport.use(jwtStrategy)

    passport.serializeUser(function (user: any, done) {
      done(null, user.id)
    })

    passport.deserializeUser((id: any, done) => {
      const orm = Container.get(MikroORM)
      orm.em
        .findOne(User, { id })
        .then((user) => {
          if (user != null) {
            done(null, user)
          } else {
            done(new Error('User not found'))
          }
        })
        .catch((err) => console.log(err))
    })
  }

  async boot () {
    // TODO: Implement Method
  }
}
