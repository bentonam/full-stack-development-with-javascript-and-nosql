import Router from 'koa-router'
import connect from './db'

const debug = require('debug')('demo:router')

const router = new Router({
  prefix: '/api',
})

router.get('/', async (ctx) => { // default
  debug('root')
  // get a handle to the bucket
  const bucket = await connect()
  // retrieve the demo document
  ctx.body = await bucket.getAsync('demo')
  ctx.status = 200
})

// create a user
router.post(
  '/users',
  async (ctx) => {
    debug('createUser')
    debug('%O', ctx.request.body)
    const bucket = await connect()
    // get the values from request to save
    const {
      username,
      first_name,
      last_name,
      email,
    } = ctx.request.body
    const _id = `user::${username}`
    // write the document to couchbase
    await bucket.insertAsync(_id, {
      _id,
      _type: 'user',
      username,
      first_name,
      last_name,
      email,
    })
    ctx.status = 201
  },
)

// update a user
router.post(
  '/users/:username',
  async (ctx) => {
    debug('updateUser')
    debug('%O', ctx.request.body)
    const bucket = await connect()
    // get the values from request to save
    const {
      first_name,
      last_name,
      email,
    } = ctx.request.body
    const { username } = ctx.params
    const _id = `user::${username}`
    // write the document to couchbase
    await bucket.upsertAsync(_id, {
      _id,
      _type: 'user',
      username,
      first_name,
      last_name,
      email,
    })
    ctx.status = 200
  },
)

// retrieve a user
router.get(
  '/users/:username',
  async (ctx) => {
    debug('getUser')
    const bucket = await connect()
    const { username } = ctx.params
    const doc = bucket.getAsync(username)
    ctx.body = await doc.value
    ctx.status = 200
  },
)

// delete a user
router.delete(
  '/users/:username',
  async (ctx) => {
    debug('deleteUser')
    const bucket = await connect()
    const { username } = ctx.params
    await bucket.removeAsync(username)
    ctx.status = 204
  },
)

export default router
