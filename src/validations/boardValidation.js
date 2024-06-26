/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const createNew = async(req, res, next) => {
  const correctCondition = Joi.object({

    // Ghi chú
    // Mặc định chúng ta không cần custom message ở phía BE lmj vì để FE tự custom và validation phía FE cho đẹp
    // BE validation đảm bảo cho dữ liệu chuẩn xác và trả về message mặc định của thư viện là được
    // Quan trọng: Việc validation bắt buộc phải có ở phía BE vì đây là điểm cuối để lưu trữ dữ liệu và Database
    // Trong thực tế điều tốt nhất cho hệ thống là validation cho cả BE và FE


    // title có kiểu chuỗi, bắt buộc có ít nhất 3 và nhiều nhất 50 ký tự, xóa khoảng trống hai đầu
    title: Joi.string().required().min(3).max(50).trim().strict().message({
      'any.required': 'Title is required (Dang)',
      'string.empty': 'Title is not allowed to be empty (Dang)',
      'string.min': 'Title length must be at least 3 characters long (Dang)',
      'string.max': 'Title length must be less than or equal to 5 character long (Dang)',
      'string.trim': 'Title must not have leading or trailing whitespace (Dang)'
    }),
    description: Joi.string().required().min(3).max(256).trim().strict()
  })

  try {
    // Chỉ định abortEarly trả về nhiều lỗi với trường hợp có nhiều lỗi
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    // Validation dữ liệu hợp lệ thì cho request sang controller
    next()
  } catch (error) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }

}

export const boardValidation = {
  createNew
}