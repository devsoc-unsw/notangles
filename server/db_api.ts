import { MongoClient, Db } from 'mongodb'
import { config, Env } from './config'

// URL for database
const env: Env = Env[process.env.NODE_ENV] || Env.development
const url = config[env].url

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

  db_create = async doc => {
    const db = await this.getDb()
    const col = db.collection(colName)
    console.log('inserting')
    await col.insertOne(doc)
    console.log(`${doc.id} inserted!`)
  }

  // db_read: function(id) {
  //   client.connect(function(err) {
  //     const db = client.db(dbName)
  //     const col = db.collection(colName)
  //     var doc = col.findOne({ id: id })
  //     client.close()
  //     return doc
  //   })
  // },

  // db_update: function(id, doc) {
  //   client.connect(function(err) {
  //     const db = client.db(dbName)
  //     const col = db.collection(colName)
  //     client.close()
  //   })
  // },

  // db_del = async (id: string) => {
  //   const result = await this.client.connect()
  //   await this.client.connect(function(err, result) {
  //     const db = this.client.db(dbName)
  //     const col = db.collection(colName)
  //     col.deleteOne({ id: id })
  //     console.log('Succesfully deleted')
  //     this.client.close()
  //   })
  // }
}

const db = new Database()
export default db
