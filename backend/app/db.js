import { promisifyAll } from 'bluebird'
import couchbase from 'couchbase'

const debug = require('debug')('demo:db')

// add promise support to Cluster
const Cluster = promisifyAll(couchbase.Cluster)

// hold references to cluster and bucket
let cluster
let bucket

// lazy load the database connection
export default async function connect () {
  // if the bucket hasn't been loaded already, load it
  if (!bucket) {
    debug('connecting to Couchbase')
    // connect and authenticate to the cluster
    cluster = new Cluster(`couchbase://${process.env.COUCHBASE_URI}`)
    cluster.authenticate(
      process.env.COUCHBASE_USERNAME,
      process.env.COUCHBASE_PASSWORD,
    )
    // connect to the bucket and add promise support
    bucket = await cluster.openBucket(process.env.COUCHBASE_BUCKET)
    bucket = promisifyAll(bucket)
  }
  return bucket
}
