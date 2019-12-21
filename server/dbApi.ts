import { MongoClient, Db } from 'mongodb'
import { config } from './config'

const url = config.database

class Database {
  private client: MongoClient | undefined

  /**
   * Connect to the notangles database
   * This should only be called by other functions in this file
   */
  connect = async () => {
    const client = new MongoClient(url, { useNewUrlParser: true })
    this.client = await client.connect()
  }

  /**
   * Disconnect from the notangles database
   */
  disconnect = () => {
    if (this.client) {
      this.client.close()
    }
  }

  /**
   * Select a database to get more information for
   * This should only be called by other functions in this file
   *
   * @param {string} dbName The desired year to search for courses in
   * @returns {Promise<Db>} a mongodb database
   */
  getDb = async (dbName: string): Promise<Db> => {
    if (!this.client) await this.connect()
    const db = this.client.db(dbName)
    return db
  }

  /**
   * Select the collection
   * This should only be called by other functions in this file
   *
   * @param {string} dbName The desired year to search for courses in
   * @param {string} termColName The desired term to search for couses in
   * @returns a mongodb collection
   */
  getCollection = async (dbName: string, termColName: string) => {
    const db = await this.getDb(dbName)
    return db.collection(termColName)
  }

  /**
   * Add courses to a collection
   *
   * @param {string} dbName The desired year to search for courses in
   * @param {string} termColName The desired term to search for couses in
   * @param doc A javascript object that contains course data
   */
  dbAdd = async (dbName: string, termColName: string, doc) => {
    const col = await this.getCollection(dbName, termColName)
    await col.insertOne(doc)
  }

  /**
   * Get information about a course running in a specific year and term
   *
   * @param {string} dbName The desired year to search for courses in
   * @param {string} termColName The desired term to search for couses in
   * @param {string} courseCode The code of the desired course
   * @returns A javascript object containing information about the course. The object will be empty if the course cannot be found
   */
  dbRead = async (dbName: string, termColName: string, courseCode: string) => {
    const col = await this.getCollection(dbName, termColName)
    const doc = await col.findOne({ courseCode })
    return doc
  }

  /**
   * Change the information in a specific course
   *
   * @param {string} dbName The desired year to search for courses in
   * @param {string} termColName The desired term to search for couses in
   * @param {string} courseCode The code of the desired course
   * @param doc A javascript object containing the updates to the desired course
   */
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

  /**
   * Remove a course from the database
   *
   * @param {string} dbName The desired year to search for courses in
   * @param {string} termColName The desired term to search for couses in
   * @param {string} courseCode The code of the desired course
   */
  dbDel = async (dbName: string, termColName: string, courseCode: string) => {
    const col = await this.getCollection(dbName, termColName)
    await col.deleteOne({ courseCode })
  }

  /**
   * Fetch all the courses in a given term
   *
   * @param {string} dbName The desired year to search for courses in
   * @param {string} termColName The desired term to search for couses in
   * @returns an array containing all the courses in a specific term
   */
  dbFetchAll = async (dbName: string, termColName: string) => {
    const col = await this.getCollection(dbName, termColName)
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
