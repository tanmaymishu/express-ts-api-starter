import { Request, Response } from 'express'
import { Controller, Get, Req, Res } from 'routing-controllers'
import { Service } from 'typedi'

@Controller()
@Service()
export class PingController {
  @Get('/api/v1/ping')
  pong (@Req() req: Request, @Res() res: Response) {
    return res.json({ message: 'pong' })
  }
}
