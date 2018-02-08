import dotenv from 'dotenv'
import Koa from 'koa'
import koaBody from 'koa-body'
import router from './router'

const debug = require('debug')('demo')

dotenv.config() // load env variables

const app = new Koa()

app.use(async (ctx, next) => { // 404 / error handling
  try {
    await next()
  } catch ({ code, message }) {
    ctx.body = { code, message }
    ctx.status = 500
  } finally {
    if (ctx.status === 404) {
      ctx.type = 'text/html'
      ctx.body = '<!doctype html><body><marquee><h1>404 Not Found</h1></marquee></html>'
      ctx.status = 404
    }
  }
})

app.use(async (ctx, next) => { // response time header
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
})

app.use(async (ctx, next) => { // log incoming request
  debug(`[${ctx.method}] - ${ctx.url}`)
  await next()
})

app.use(koaBody()) // body, form / url-encoded parsing

app.use(router.routes()) // router

app.listen(process.env.PORT)
