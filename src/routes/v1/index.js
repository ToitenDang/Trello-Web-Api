/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { boardRoute } from './boardRoute'

const Router = express.Router()

// Check APIs v1 status
Router.get('/status', (req, res) => {
  // Ở đây status là một method trong respon để trả về một mã code
  res.status(StatusCodes.OK).json({ message: 'APIs V1 are ready to use.' })
})

// Board APIs
Router.use('/boards', boardRoute)
export const APIs_V1 = Router