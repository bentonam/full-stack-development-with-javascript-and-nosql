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
      first_name,
      last_name,
    } = ctx.request.body
    const person_id = uuid() // generate id
    debug('  person_id: %s', person_id)
    const doc = {
      person_id,
      doc_type: 'person',
      first_name,
      last_name,
      timestamp: new Date()
        .getTime(),
    }
    // write the document to couchbase
    await bucket.insertAsync(person_id, doc)
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
    const address_id = uuid() // generate id for address
    debug('  address_id: %s', address_id)
    const doc = {
      address_id,
      doc_type: 'address',
      city,
      state,
      timestamp: new Date()
        .getTime(),
    }
    // write the document to couchbase
    await bucket.insertAsync(address_id, doc)
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
      SELECT address.*
      FROM demo AS address
      WHERE address.doc_type = 'address'
      ORDER BY address.city ASC, address.state ASC
    `)
    ctx.body = await bucket.queryAsync(statement)
    ctx.status = 200
  },
)

// get all the people and their addresses
router.get(
  '/people',
  async (ctx) => {
    const bucket = await connect()
    const statement = N1qlQuery.fromString(`
      SELECT person.person_id, person.first_name, person.last_name,
        ARRAY {
          "address_id": addr.address_id,
          "city" : addr.city,
          "state": addr.state
        } FOR addr IN addresses END AS addresses
      FROM demo AS person
      LEFT OUTER NEST demo AS addresses ON KEYS person.addresses
      WHERE person.doc_type = 'person'
      ORDER BY person.first_name ASC, person.last_name ASC
    `)
    // these queries achieve the same result
    // const statement = N1qlQuery.fromString(`
    //   SELECT person.person_id, person.first_name, person.last_name,
    //     (
    //       SELECT address.city, address.state
    //       FROM demo AS address
    //       USE KEYS person.addresses
    //     ) AS addresses
    //   FROM demo AS person
    //   WHERE person.doc_type = 'person'
    //   ORDER BY person.first_name ASC, person.last_name ASC
    // `)
    ctx.body = await bucket.queryAsync(statement)
    ctx.status = 200
  },
)

// add an address to a person
router.put(
  '/person/address/:person_id',
  async (ctx) => {
    const bucket = await connect()
    const { person_id } = ctx.params
    debug('  person_id: %s', person_id)
    const { address_id } = ctx.request.body
    debug('  address_id: %s', address_id)
    await new Promise((resolve, reject) => {
      bucket.mutateIn(person_id)
        .arrayAppend('addresses', address_id, true)
        .execute((error, result) => {
          if (error) {
            reject(error)
            return
          }
          resolve(result)
        })
    })
    ctx.body = await bucket.getAsync(person_id)
      .then(({ value }) => value)
    ctx.status = 200
  },
)

// retrieve a person
router.get(
  '/person/:person_id',
  async (ctx) => {
    const bucket = await connect()
    const { person_id } = ctx.params
    debug('  person_id: %s', person_id)
    ctx.body = await bucket.getAsync(person_id)
      .then(({ value }) => value)
    ctx.status = 200
  },
)

// retrieve an address
router.get(
  '/address/:address_id',
  async (ctx) => {
    const bucket = await connect()
    const { address_id } = ctx.params
    debug('  address_id: %s', address_id)
    ctx.body = await bucket.getAsync(address_id)
      .then(({ value }) => value)
    ctx.status = 200
  },
)


export default router
