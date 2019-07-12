import { MongoClient, Db } from 'mongodb'
import { config } from './config'

const url = config.database

// DB Name
const dbName = 'Notangles'
const colName = 'Courses'

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

  dbAdd = async doc => {
    const db = await this.getDb()
    const col = db.collection(colName)
    await col.insertOne(doc)
  }

  dbRead = async (id: string) => {
    const db = await this.getDb()
    const col = db.collection(colName)
    const doc = await col.findOne({ id })
    return doc
  }

  dbUpdate = async (id: string, doc) => {
    const db = await this.getDb()
    const col = db.collection(colName)
    try {
      await col.updateOne({ id }, { $set: doc })
    } catch (e) {
      console.log(e)
    }
  }

  dbDel = async (id: string) => {
    const db = await this.getDb()
    const col = db.collection(colName)
    await col.deleteOne({ id })
  }
}

const db = new Database()
export default db
