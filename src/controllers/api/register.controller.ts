import { MikroORM } from '@mikro-orm/core'
import { Request, Response } from 'express'
import { body } from 'express-validator'
import { Controller, Post, Req, Res, UseBefore } from 'routing-controllers'
import { User } from '@/database/sql/entities/user.entity'
import { Service, Container } from 'typedi'
import validate from '@/middleware/validation.middleware'
import AuthService from '@/services/auth.service'

@Controller('/api/v1')
@Service()
export class RegisterController {
  constructor (public authService: AuthService) {}

  static rules = [
    body('firstName', 'First name is missing').exists(),
    body('lastName', 'Last name is missing').exists(),
    body('password', 'Password is missing').exists(),
    body('email')
      .exists()
      .bail()
      .isEmail()
      .bail()
      .custom(async (value) => {
        const orm = Container.get(MikroORM)
        const user = await orm.em.findOne(User, { email: value })
        if (user != null) {
          return await Promise.reject(new Error('Email has already been taken.'))
        }
      })
  ]

  @Post('/register')
  @UseBefore(validate(RegisterController.rules))
  async store (@Req() req: Request, @Res() res: Response) {
    const user = await this.authService.register(req)

    return res.status(201).json({ user })
  }
}
