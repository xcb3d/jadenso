import { MongoClient } from 'mongodb';

// Khai báo kiểu cho global
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Biến lưu trữ kết nối MongoDB
let client: MongoClient | undefined;
const clientPromise: Promise<MongoClient> = setupConnection();

// Thiết lập kết nối
async function setupConnection(): Promise<MongoClient> {
const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('Không tìm thấy MONGODB_URI trong biến môi trường');
  }

if (process.env.NODE_ENV === 'development') {
    // Trong môi trường development, sử dụng biến global để lưu trữ kết nối
    // giúp tránh tạo nhiều kết nối khi hot-reload
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
  }
    return global._mongoClientPromise;
} else {
    // Trong môi trường production, tạo kết nối mới
    client = new MongoClient(uri);
    return client.connect();
  }
}

// Export promise để sử dụng trong NextAuth
export default clientPromise; 