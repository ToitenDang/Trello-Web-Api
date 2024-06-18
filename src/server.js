/* eslint-disable no-console */

import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'

const app = express()

const START_SERVER = () => {
  app.get('/', async(req, res) => {
    res.end('<h1>Hello World!</h1><hr>')
  })

  app.listen(env.APP_PORT, env.APP_HOST, () => {
    console.log (`Hello ${env.APP_AUTHOR}, Back-end server is running at http://${ env.APP_HOST }:${ env.APP_PORT }/`)
  })
  // Thực hiện các tác vụ cleanup trước khi dừng server
  exitHook(() => {
    CLOSE_DB()
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

