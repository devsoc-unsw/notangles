import Database from './dbApi'

const test = async () => {
  console.log('hai')
  await Database.dbAdd({ id: 'COMP1521', vac: '0', gh: 8 })
  let doc = await Database.dbRead('COMP1521')
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
