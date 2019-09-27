import { MongoClient, Db } from 'mongodb'
import { config } from './config'

const url = config.database

// DB Name
const dbName = 'Notangles'

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

  getCollection = async (termColName: string) => {
    const db = await this.getDb()
    return db.collection(termColName)
  }

  dbAdd = async (termColName: string, doc) => {
    const col = await this.getCollection(termColName)
    await col.insertOne(doc)
  }

  dbRead = async (termColName: string, courseCode: string) => {
    const col = await this.getCollection(termColName)
    const doc = await col.findOne({ courseCode })
    return doc
  }

  dbUpdate = async (termColName: string, courseCode: string, doc) => {
    const col = await this.getCollection(termColName)
    try {
      await col.updateOne({ courseCode }, { $set: doc })
    } catch (e) {}
  }

  dbDel = async (termColName: string, courseCode: string) => {
    const col = await this.getCollection(termColName)
    await col.deleteOne({ courseCode })
  }
}

const db = new Database()
export default db
