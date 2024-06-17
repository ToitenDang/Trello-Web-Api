/* eslint-disable no-console */

import express from 'express'
import { CONNECT_DB, GET_DB } from '~/config/mongodb'
const app = express()

const START_SERVER = () => {
  const hostname = 'localhost'
  const port = 8017

  app.get('/', async(req, res) => {
    console.log(await GET_DB().listCollections().toArray())
    res.end('<h1>Hello World!</h1><hr>')
  })

  app.listen(port, hostname, () => {
    console.log (`Hello, I am running at http://${ hostname }:${ port }/`)
  })
}

(async () => {
  try {
    console.log('1. Connecting to MongoDB Cloud Atlast!')
    await CONNECT_DB()
    console.log('2. Connected to MongoDB Cloud Atlast!')

    // Khởi động Server sau khi kết nối Database thành công
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()

//Chỉ khi kết nối tới Database thành công thì mới Start Server Back-end lên.
// CONNECT_DB()
//   .then(() => console.log('Connected to MongoDB Cloud Atlast!'))
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.error(error)
//     process.exit(0)
//   })

