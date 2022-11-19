import orm from '@/database/sql/data-source'
import dotenv from 'dotenv'
import 'reflect-metadata'
import { useContainer, useExpressServer } from 'routing-controllers'
import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import '@/util/helpers'
import multer from 'multer'
import morganLogger from '@/middleware/morgan.middleware'

import path from 'path'

import { createClient } from 'redis'
import connectRedis from 'connect-redis'
import session from 'express-session'
import passport from 'passport'
import Container from 'typedi'
import AppServiceProvider from '@/providers/app-service.provider'
import AuthServiceProvider from '@/providers/auth-service.provider'
import DatabaseServiceProvider from '@/providers/database-service.provider'
import { ExpressAdapter } from '@bull-board/express'
import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { mailQueue } from '@/queues/mail'
import { RequestContext } from '@mikro-orm/core'

if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' })
} else {
  dotenv.config()
}

// Create an express app.
const app = express()

const providers = [AppServiceProvider, DatabaseServiceProvider, AuthServiceProvider]
providers.forEach((Provider) => new Provider().register())
const redisClient = createClient({
  legacyMode: true,
  socket: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT ?? '6379')
  }
})

redisClient.on('error', function (err) {
  console.log('Could not establish a connection with redis.', err)
})

redisClient.on('connect', function (err) {
  if (err !== undefined) {
    console.log('Connected to redis successfully')
  }
})

redisClient.connect().then().catch(console.error)

const RedisStore = connectRedis(session)

// Make req.cookies accessible
app.use(cookieParser())

app.use((req, res, next) => {
  orm()
    .then((orm) => {
      RequestContext.create(orm.em, next)
    })
    .catch((error) => {
      console.error(error)
    })
})

// Configure session middleware
app.use(
  session({
    store: new RedisStore({ client: redisClient } as any),
    secret: process.env.JWT_SECRET as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // if true prevent client side JS from reading the cookie
      secure: process.env.NODE_ENV === 'production', // if true only transmit cookie over https
      maxAge: 1000 * 60 * 60 * 24 // session max age in miliseconds
    }
  })
)

app.use(passport.initialize())
app.use(passport.session())

// Parse the application/json request body.
app.use(express.json())
// Parse the x-www-form-urlencoded request body.
app.use(express.urlencoded({ extended: true }))
// Parse the form-data request body.
app.use(multer().any())
// Enable CORS
app.use(cors())
// Log the incoming requests to console.
app.use(morganLogger)

// Example route.
app.get('/', (req, res, next) => {
  return res.json({ message: 'Home, Sweet Home.' })
})

// Set up queue monitoring route.
const serverAdapter = new ExpressAdapter()

createBullBoard({
  queues: [new BullMQAdapter(mailQueue)],
  serverAdapter
})

serverAdapter.setBasePath('/admin/queues')
app.use('/admin/queues', serverAdapter.getRouter())

// Serve static files
app.use(express.static(path.join(__dirname, '../public')))

useContainer(Container)

useExpressServer(app, {
  controllers: [path.join(__dirname, '/controllers/**/*.controller.*')],
  defaultErrorHandler: false,
  middlewares: [path.join(__dirname, '/middleware/global/*.middleware.*')]
})

// Catch any error and send it as a json.
app.use(function (error: Error, req: Request, res: Response, next: NextFunction) {
  if (error !== undefined) {
    console.log(error)
    return res.status(500).json({ error: error.message })
  }
  return next()
})

// Catch 404.
app.use(function (req: Request, res: Response) {
  if (!res.headersSent) {
    return res.status(404).json({ message: 'Page Not Found!' })
  }
})

export default app
