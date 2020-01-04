import { MongoClient, Db } from 'mongodb'
import { config } from './config'
import { dbAddParams, dbDelParams, dbReadParams, dbUpdateParams, dbFetchAllParams, getCollectionParams } from './interfaces/params'

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

  getCollection = async ({dbName, termColName} : getCollectionParams) => {
    const db = await this.getDb(dbName)
    return db.collection(termColName)
  }

  dbAdd = async ({dbName, termColName, doc} : dbAddParams) => {
    const col = await this.getCollection({dbName, termColName})
    await col.insertOne(doc)
  }

  dbRead = async ({dbName, termColName, courseCode} : dbReadParams) => {
    const col = await this.getCollection({dbName, termColName})
    const doc = await col.findOne({ courseCode })
    return doc
  }

  dbUpdate = async (
    { dbName,
    termColName,
    courseCode,
    doc } : dbUpdateParams
  ) => {
    const col = await this.getCollection({dbName, termColName})
    try {
      await col.updateOne({ courseCode }, { $set: doc })
    } catch (e) {}
  }

  dbDel = async ({dbName, termColName, courseCode} : dbDelParams) => {
    const col = await this.getCollection({dbName, termColName})
    await col.deleteOne({ courseCode })
  }

  dbFetchAll = async ({dbName, termColName} : dbFetchAllParams) => {
    const col = await this.getCollection({dbName, termColName})
    const fields = {
      courseCode: true,
      name: true,
    }
    const hash = await col.find(undefined, {
      projection: fields,
    })
    return hash.toArray()
  }
}

const db = new Database()
export default db
