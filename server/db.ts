import { Env, config } from './config'
const settings = config[process.env.NODE_ENV || Env.DEV]
import Database from './db_api'

const test = async () => {
  console.log('hai')
  await Database.dbCreate({ id: 'COMP1521', vac: '0', gh: 8 })
  var doc = await Database.dbRead('COMP1521')
  console.log(doc)
  await Database.dbUpdate('COMP1521', { vac: '5' })
  doc = await Database.dbRead('COMP1521')
  console.log(doc)
  await Database.dbDel(`COMP1521`)
}

test().then(() => {
  Database.disconnect()
  process.exit()
})
