
import Joi from 'joi'
import { ObjectId, ReturnDocument } from 'mongodb'
import { GET_DB } from '~/config/mongodb'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { BOARD_TYPES } from '~/utils/constants'
import { columnModel } from './columnModel'
import { cardModel } from './cardModel'
// Define Collection ( name & schema)

const BOARD_COLLECTION_NAME = 'boards'
const BOARD_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  slug: Joi.string().required().min(3).trim().strict(),
  description: Joi.string().required().min(3).max(256).trim().strict(),
  type: Joi.string().valid(BOARD_TYPES.PUBLIC, BOARD_TYPES.PRIVATE).required(),

  columnOrderIds: Joi.array().items(
    Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)
  ).default([]),

  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)// Khi người dùng xóa board ta chỉ gán cho nó là true và ẩn ở giao diện người dùng chứ không xóa hoàn toàn
})

// Chỉ định ra những Fields mà chúng ta không muốn cho phép cập nhật
const INVALID_UPDATE_FIELDS = ['_id', 'createAt']

const validateBeforeCreate = async (data) => {
  return await BOARD_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const createNew = async (data) => {
  try {
    const validData = await validateBeforeCreate(data)
    const createdBoard = await GET_DB().collection(BOARD_COLLECTION_NAME).insertOne(validData)
    return createdBoard
  } catch (error) {throw new Error(error)}
}

const findOneById = async (id) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    return result
  } catch (error) {throw new Error(error)}
}
// Query tổng hợp (aggregate) để lấy toàn bộ Columns và Cards thuộc về board
const getDetails = async (id) => {
  try {
    // Hôm nay tạm thời giống hệt hàm findOneById - và sẽ update phần aggregate tiếp ở những video tới
    // const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).aggregate([
      { $match: {
        _id: new ObjectId(id),
        _destroy: false
      } },
      { $lookup: {
        from: columnModel.COLUMN_COLLECTION_NAME,
        localField: '_id', // collection hiện tại là board, _id là boardId
        foreignField: 'boardId', // cũng là id của board như Khóa ngoại ứng với key bên columnModel
        as: 'columns'// Đứng từ board qua bên collection column tìm tất cả những column có boardId của board đang đứng để lấy tất cả hiển thị ra board
      } },
      { $lookup: {
        from: cardModel.CARD_COLLECTION_NAME,
        localField: '_id', // collection hiện tại là board, _id là boardId
        foreignField: 'boardId', // cũng là id của board như Khóa ngoại ứng với key bên cardModel
        as: 'cards'// Đứng từ board qua bên collection card tìm tất cả những card có boardId của board đang đứng để lấy tất cả hiển thị ra board
      } }
    ]).toArray()
    return result[0] || null
  } catch (error) {throw new Error(error)}
}
// Nhiệm vụ của functin này là push 1 giá trị columnId vào cuối mảng columnOrderIds
const pushColumnOrderIds = async (column) => {
  try {
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(column.boardId) },
      { $push: { columnOrderIds: new ObjectId(column._id) } },
      { ReturnDocument: 'after' }// Trả về bản ghi đã cập nhật nếu không có sẽ lấy bản ghi chưa được cập nhật
    )
    return result
  } catch (error) {throw new Error(error)}
}

const update = async (boardId, updateData) => {
  try {
    // Lọc những dữ liệu không cho cho phép cập nhật
    Object.keys(updateData).forEach(fieldName => {
      if (INVALID_UPDATE_FIELDS.includes(fieldName)) {
        delete updateData[fieldName]
      }
    })
    const result = await GET_DB().collection(BOARD_COLLECTION_NAME).findOneAndUpdate(
      { _id: new ObjectId(boardId) },
      { $set: updateData },
      { ReturnDocument: 'after' }// Trả về bản ghi đã cập nhật nếu không có sẽ lấy bản ghi chưa được cập nhật
    )
    return result
  } catch (error) {throw new Error(error)}
}

export const boardModel = {
  BOARD_COLLECTION_NAME,
  BOARD_COLLECTION_SCHEMA,
  createNew,
  findOneById,
  getDetails,
  pushColumnOrderIds,
  update
}