//Command to run datase: mongod --dbpath=./data

//const MongoClient = require('mongodb').MongoClient
//const assert = require('assert')
//const config = require('./config.ts').config

// URL for database
//const env = process.env.NODE_ENV || 'test'
//const url = config[env].url

// DB Name
//const dbName = 'Notangles'

// Create a the MongoClient
//const client = new MongoClient(url, { useNewUrlParser: true })

import Database from './db_api'

// const add = () => {

// }

const main = async () => {
  console.log('hai')
  await Database.db_create({ id: 'COMP1591' })
  console.log('bai')
}

main().then(() => {
  Database.disconnect()
  process.exit()
})

//dbm.db_del('1')
// var doc = dbm.db_read({ id: 'COMP1511' })
// console.log(doc)

//Connecting to server
/*client.connect(function(err) {
  assert.equal(null, err)
  console.log('Connected successfully to server')
  //const db = client.db(dbName)
  //const col = db.collection('Courses')
  //col.insertOne({ id: 'COMP1511' })
  //col.deleteOne({ id: 'COMP1511' })
  client.close()
})*/
