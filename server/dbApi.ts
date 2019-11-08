import { MongoClient, Db } from 'mongodb'
import { config } from './config'

const url = config.database

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

  getDb = async (dbName: string): Promise<Db> => {
    if (!this.client) await this.connect()
    const db = this.client.db(dbName)
    return db
  }

  getCollection = async (dbName: string, termColName: string) => {
    const db = await this.getDb(dbName)
    return db.collection(termColName)
  }

  dbAdd = async (dbName: string, termColName: string, doc) => {
    const col = await this.getCollection(dbName, termColName)
    await col.insertOne(doc)
  }

  dbRead = async (dbName: string, termColName: string, courseCode: string) => {
    const col = await this.getCollection(dbName, termColName)
    const doc = await col.findOne({ courseCode })
    return doc
  }

  dbUpdate = async (
    dbName: string,
    termColName: string,
    courseCode: string,
    doc
  ) => {
    const col = await this.getCollection(dbName, termColName)
    try {
      await col.updateOne({ courseCode }, { $set: doc })
    } catch (e) {}
  }

  dbDel = async (dbName: string, termColName: string, courseCode: string) => {
    const col = await this.getCollection(dbName, termColName)
    await col.deleteOne({ courseCode })
  }
}

const db = new Database()
export default db
