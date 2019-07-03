import { MongoClient, Db } from 'mongodb'
import { Env, config } from './config'

const debug = true

// URL for database
//const env: Env = Env[process.env.NODE_ENV] || Env.development
const url = config[process.env.NODE_ENV || Env.DEV].database

// DB Name
const dbName = 'Notangles'
const colName = 'Courses'

// Create a the MongoClient
class Database {
  private client: MongoClient | undefined

  connect = async () => {
    const client = new MongoClient(url, { useNewUrlParser: true })
    this.client = await client.connect()
  }

  disconnect = () => {
    if (this.client) {
      this.client.close()
    }
  }

  getDb = async (): Promise<Db> => {
    if (!this.client) await this.connect()
    const db = this.client.db(dbName)
    return db
  }

  dbCreate = async doc => {
    const db = await this.getDb()
    const col = db.collection(colName)
    await col.insertOne(doc)
    if (debug) console.log('Created doc: ' + doc)
  }

  dbRead = async id => {
    const db = await this.getDb()
    const col = db.collection(colName)
    var doc = await col.findOne({ id: id })
    if (debug) console.log('Reading doc: ' + doc)
    return doc
  }

  dbUpdate = async (id, doc) => {
    const db = await this.getDb()
    const col = db.collection(colName)
    try {
      await col.updateOne({ id: id }, { $set: doc })
      if (debug) console.log('Updated id: ' + id)
    } catch (e) {
      console.log(e)
    }
  }

  dbDel = async id => {
    const db = await this.getDb()
    const col = db.collection(colName)
    await col.deleteOne({ id: id })
    if (debug) console.log('Deleted doc id: ' + id)
  }
}

const db = new Database()
export default db
