import Router from 'koa-router'
import { N1qlQuery } from 'couchbase'
import connect from './db'

const debug = require('debug')('demo:router')

const router = new Router()

// default
router.get('/', (ctx) => {
  debug('root')
  ctx.body = 'Demo API'
})

// get all users
// CREATE INDEX idx_demo_username ON `demo` ( username );
router.get('/users', async (ctx) => {
  debug('listUsers')
  const db = await connect()
  const query = N1qlQuery.fromString(`
    SELECT users.*
    FROM demo AS users
    WHERE username IS NOT MISSING
  `)
  ctx.body = await db.query(query)
  ctx.status = 200
})

// add a user
router.post('/users', async (ctx) => {
  debug('createUser')
  debug('%O', ctx.request.body)
  const db = await connect()
  const { username: id } = ctx.request.body
  await db.upsertAsync(id, ctx.request.body)
  ctx.status = 201
})

// retrieve a user
router.get('/users/:user_id', async (ctx) => {
  debug('getUser')
  const db = await connect()
  ctx.body = await db.getAsync(ctx.params.user_id).value
  ctx.status = 200
})

// delete a user
router.delete('/users/:user_id', async (ctx) => {
  debug('deleteUser')
  const db = await connect()
  await db.removeAsync(ctx.params.user_id)
  ctx.status = 204
})

export default router
