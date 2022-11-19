import { MikroORM } from '@mikro-orm/core'
import { Request, Response } from 'express'
import { Controller, Get, Req, Res } from 'routing-controllers'
import { User } from '@/database/sql/entities/user.entity'

@Controller('/api/v1')
export class UserController {
  constructor (private readonly orm: MikroORM) {}
  @Get('/users')
  async index (@Req() req: Request, @Res() res: Response) {
    const users = await this.orm.em.find(User, {})
    return res.json(users)
  }
}
