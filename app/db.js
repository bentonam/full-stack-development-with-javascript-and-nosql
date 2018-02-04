import { promisifyAll } from 'bluebird'
import couchbase from 'couchbase'

const debug = require('debug')('demo:db')

const Cluster = promisifyAll(couchbase.Cluster)

// hold references to cluster and bucket
let cluster
let bucket

export default async function connect () {
  if (!bucket) {
    debug('connecting to Couchbase')
    cluster = new Cluster('couchbase://localhost')
    cluster.authenticate('Administrator', 'password')
    bucket = await cluster.openBucket('demo')
    bucket = promisifyAll(bucket)
  }
  return bucket
}
