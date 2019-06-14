//Command to run datase: mongod --dbpath=./data

const MongoClient = require('mongodb').MongoClient
const assert = require('assert')

// URL for database
const url = "mongodb+srv://user:user@testdb-zaztm.mongodb.net/test?retryWrites=true&w=majority"

// DB Name
const dbName = "Notangles"

// Create a the MongoClient
const client = new MongoClient(url, { useNewUrlParser: true })

//Connecting to server
client.connect(function(err) {
  assert.equal(null, err)
  console.log("Connected successfully to server")
  const db = client.db(dbName)
  const col = db.collection("Courses")
  //col.insertOne({id:"COMP1511"})
  col.deleteOne({id:"COMP1511"}, function(err,document) {
  	if (err) throw err
  	console.log(document.id)
  })
  client.close();
})

