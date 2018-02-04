import Koa from 'koa'
import koaBody from 'koa-body'
import router from './router'

const debug = require('debug')('demo')

const app = new Koa()

// 404 / error handling
app.use(async (ctx, next) => {
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

// response time header
app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.set('X-Response-Time', `${ms}ms`)
})

// log incoming request
app.use(async (ctx, next) => {
  debug(`[${ctx.method}] - ${ctx.url}`)
  await next()
})

// body, form / url-encoded parsing
app.use(koaBody())

// router
app.use(router.routes())

// error handler
app.on('error', (err) => {
  debug('Error: %O', err)
})

app.listen(8080)
