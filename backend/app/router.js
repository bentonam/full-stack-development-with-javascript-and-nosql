import Router from 'koa-router'
import { N1qlQuery } from 'couchbase'
import uuid from 'uuid/v4'
import connect from './db'

const debug = require('debug')('demo:router')

const router = new Router({
  prefix: '/api',
})

// create a person
router.post(
  '/person',
  async (ctx) => {
    debug('  payload: %O', ctx.request.body)
    const bucket = await connect()
    // get the values from request to save
    const {
      firstname,
      lastname,
    } = ctx.request.body
    const id = uuid() // generate id for person
    const doc = {
      id,
      type: 'person',
      firstname,
      lastname,
      timestsamp: new Date()
        .getTime(),
    }
    // write the document to couchbase
    await bucket.insertAsync(id, doc)
    ctx.body = doc
    ctx.status = 201
  },
)

// create an address
router.post(
  '/address',
  async (ctx) => {
    debug('  payload: %O', ctx.request.body)
    const bucket = await connect()
    // get the values from request to save
    const {
      city,
      state,
    } = ctx.request.body
    const id = uuid() // generate id for person
    const doc = {
      id,
      type: 'address',
      city,
      state,
      timestsamp: new Date()
        .getTime(),
    }
    // write the document to couchbase
    await bucket.insertAsync(id, doc)
    ctx.body = doc
    ctx.status = 201
  },
)

// get all the addresses
router.get(
  '/addresses',
  async (ctx) => {
    const bucket = await connect()
    const statement = N1qlQuery.fromString(`
      SELECT META(address).id, address.*
      FROM demo AS address
      WHERE address.type = 'address'
    `)
    ctx.body = await bucket.queryAsync(statement)
    ctx.status = 200
  },
)

// get all the people
router.get(
  '/people',
  async (ctx) => {
    const bucket = await connect()
    const statement = N1qlQuery.fromString(`
      SELECT META(person).id, person.firstname, person.lastname,
        (
          SELECT address.city, address.state
          FROM demo AS address
          USE KEYS person.addresses
        ) AS addresses
      FROM demo AS person
      WHERE person.type = 'person'
    `)
    ctx.body = await bucket.queryAsync(statement)
    ctx.status = 200
  },
)

// add an address to a person
router.put(
  '/person/address/:personid',
  async (ctx) => {
    debug('  payload: %O', ctx.request.body)
    const bucket = await connect()
    const { personid } = ctx.params
    const { addressid } = ctx.request.body
    await new Promise((resolve, reject) => {
      bucket.mutateIn(personid)
        .arrayAppend('addresses', addressid, true)
        .execute((error, result) => {
          if (error) {
            reject(error)
            return
          }
          resolve(result)
        })
    })
    ctx.body = await bucket.getAsync(personid)
      .then(({ value }) => value)
    ctx.status = 200
  },
)

// retrieve a person
router.get(
  '/person/:id',
  async (ctx) => {
    const bucket = await connect()
    const { id } = ctx.params
    debug('  id: %s', id)
    ctx.body = await bucket.getAsync(id)
      .then(({ value }) => value)
    ctx.status = 200
  },
)

// retrieve an address
router.get(
  '/address/:id',
  async (ctx) => {
    const bucket = await connect()
    const { id } = ctx.params
    debug('  id: %s', id)
    ctx.body = await bucket.getAsync(id)
      .then(({ value }) => value)
    ctx.status = 200
  },
)

// delete a user
router.delete(
  '/person/:id',
  async (ctx) => {
    const bucket = await connect()
    const doc_id = `person::${ctx.params.id}`
    debug('  doc_id: %s', doc_id)
    await bucket.removeAsync(doc_id)
    ctx.status = 204
  },
)

// get all the people
router.get(
  '/people',
  async (ctx) => {
    const bucket = await connect()
    const statement = N1qlQuery.fromString(`
      SELECT id, first_name, last_name, email
      FROM demo
      WHERE type = 'person'
      ORDER BY first_name, last_name
    `)
    ctx.body = await bucket.queryAsync(statement)
    ctx.status = 200
  },
)

export default router
