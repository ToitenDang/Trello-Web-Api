/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
*/

const MONGODB_URI = 'mongodb+srv://tkdang21:yNKvzshKo8CJTBL8@cluster0-dang.b3xc2q8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0-Dang'
const DATABASE_NAME = 'trello-dang'

import { MongoClient, ServerApiVersion } from 'mongodb'
// Khởi tạo một đối tượng trelloDatabaseInstance là null (vì chưa kết nối)
let trelloDatabaseInstance = null

// Khởi tạo một đối tượng mongoClientInstance để connect tới MongoDB
const mongoClientInstance = new MongoClient(MONGODB_URI, {
  // Lưu ý: ServerApi có từ phiên bản MongoDB 5.0.0 trở lên, có thể không cần dùng nó
  //        còn nếu dùng nó chúng ta cần chỉ định một cái Stable API Version của MongoDB
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

export const CONNECT_DB = async() => {
  // Gọi kết nối đến MongoDB aslas URI đã khai báo trong thân của mongoClientInstance
  await mongoClientInstance.connect()

  // Kết nối thành công thì lấy database theo tên và gán ngược nó lại vào biến trelloDatabaseInstance ở trên
  trelloDatabaseInstance = mongoClientInstance.db(DATABASE_NAME)
}

// Function GET_DB này có nhiệm vụ export ra cái Trello Database Instance sau khi đã connect thành công tới MongoDB để sử dụng ở nhiều nơi trong code
// Phải đảmbaor chỉ luôn gọi cái getDB này sau khi kết nối thành công tới Database
export const GET_DB = () =>{
  if (!trelloDatabaseInstance) throw new Error ('Must connect to Database first!')
  return trelloDatabaseInstance
}