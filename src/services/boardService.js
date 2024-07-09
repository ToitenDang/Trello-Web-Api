
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'

import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'

const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newBoard = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Gọi tới tầng model để xử lý lưu trữ bản ghi newBoard vào Database
    const createdBoard = await boardModel.createNew(newBoard)
    console.log(createdBoard)

    // Lấy bản ghi board sau khi gọi (tùy mục đích dự án có cần bước này hay không)

    const getNewBoard = await boardModel.findOneById(createdBoard.insertedId)
    console.log(getNewBoard)
    // Làm thêm các xử lý logic khác với các Collection khác tùy đặc thù dự án
    // Bắn email, notification về cho admin khi có một cái board mới được tạo

    // Trả kết quả về, trong Service luôn phải có return
    return getNewBoard
  } catch (error) { throw error }
}

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found')
    }
    // B1 Tạo ra 1 cái mới để xử lý mà không làm ảnh hưởng đến cái cũ, tùy mục đích mà có cần cloneDeep hay không
    const resBoard = cloneDeep(board)

    // B2 Đưa card về đúng column
    resBoard.columns.forEach(column => {
      // Cách dùng .equals() là bởi vì chúng ta hiểu ObjectId trong mongoDB có suport method equals
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))

      // Cách khác đơn giản hơn là convert ObjectId về String = hàm toString của JS
      // column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    })

    // B3 Xóa mảng card khỏi cái board ban đầu
    delete resBoard.cards
    return resBoard
  } catch (error) { throw error }
}

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updateAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)

    return updatedBoard
  } catch (error) { throw error }
}

const moveCardToDifferentColumn = async (reqBody) => {
  try {
    //B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó( Hiểu bản chất là xóa _id của card ban đầu ra khỏi mảng)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updateAt: Date.now()
    })
    //B2: Cập nhật mảng cardOrderIds của Column tiếp theo (Hiểu bản chất là thêm _id của card vào mảng)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updateAt: Date.now()
    })
    //B3: Cập nhật lại trường columnId mới của card đã kéo
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId
    })

    return { updateResult: 'Successfully' }
  } catch (error) { throw error }
}


export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn
}