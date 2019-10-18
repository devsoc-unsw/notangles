import { MongoClient, Db } from 'mongodb'
import { config } from './config'

const url = config.database

class Database {
  private client: MongoClient | undefined
  private dbName = 'Notangles'

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
    const db = this.client.db(this.dbName)
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

  dbFetchAll = async (termColName: string) => {
    const col = await this.getCollection(termColName)
    const fields = {
      courseCode: true,
      name: true,
    }
    const hash = await col.find(undefined, {
      projection: fields,
    })
    return hash.toArray()
  }

  setDbname = (name: string) => {
    this.dbName = name
  }
}

const db = new Database()
export default db
