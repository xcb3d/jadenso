import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS, now, toObjectId } from '@/infrastructure/db/collections';
import { GeneratedExercise, ExerciseSession } from '@/models/GeneratedExercise';

/**
 * Tạo một phiên tạo bài tập mới
 * @param session Thông tin phiên
 * @returns Phiên tạo bài tập đã được tạo
 */
export async function createExerciseSession(
  userId: ObjectId | string,
  title: string,
  description: string,
  proficiencyLevel: string,
  vocabulary: string,
): Promise<ExerciseSession> {
  const userIdObj = typeof userId === 'string' ? toObjectId(userId) : userId;
  
  const session: ExerciseSession = {
    userId: userIdObj,
    title,
    description,
    exerciseCount: 0,
    proficiencyLevel,
    createdAt: now(),
    updatedAt: now(),
    vocabulary
  };
  
  const collection = await getCollection<ExerciseSession>(COLLECTIONS.EXERCISE_SESSIONS);
  const result = await collection.insertOne(session);
  
  return {
    ...session,
    _id: result.insertedId
  };
}

/**
 * Thêm các bài tập vào phiên
 * @param sessionId ID của phiên
 * @param exercises Danh sách bài tập
 * @returns Danh sách bài tập đã thêm
 */
export async function addExercisesToSession(
  sessionId: ObjectId | string,
  userId: ObjectId | string,
  exercises: Omit<GeneratedExercise, '_id' | 'sessionId' | 'userId' | 'createdAt' | 'updatedAt'>[]
): Promise<GeneratedExercise[]> {
  const sessionIdObj = typeof sessionId === 'string' ? toObjectId(sessionId) : sessionId;
  const userIdObj = typeof userId === 'string' ? toObjectId(userId) : userId;
  
  const timestamp = now();
  const exercisesToInsert = exercises.map(exercise => ({
    ...exercise,
    sessionId: sessionIdObj,
    userId: userIdObj,
    createdAt: timestamp,
    updatedAt: timestamp
  }));
  
  const collection = await getCollection<GeneratedExercise>(COLLECTIONS.GENERATED_EXERCISES);
  const result = await collection.insertMany(exercisesToInsert);
  
  // Cập nhật số lượng bài tập trong phiên
  const sessionCollection = await getCollection<ExerciseSession>(COLLECTIONS.EXERCISE_SESSIONS);
  await sessionCollection.updateOne(
    { _id: sessionIdObj },
    { 
      $set: { 
        exerciseCount: exercises.length,
        updatedAt: timestamp 
      } 
    }
  );
  
  // Trả về bài tập với ID đã được tạo
  return Object.keys(result.insertedIds).map((key, index) => ({
    ...exercisesToInsert[index],
    _id: result.insertedIds[Number(key)]
  }));
}

/**
 * Lấy danh sách phiên tạo bài tập của người dùng
 * @param userId ID người dùng
 * @returns Danh sách phiên
 */
export async function getExerciseSessionsByUserId(userId: ObjectId | string): Promise<ExerciseSession[]> {
  const userIdObj = typeof userId === 'string' ? toObjectId(userId) : userId;
  
  const collection = await getCollection<ExerciseSession>(COLLECTIONS.EXERCISE_SESSIONS);
  return collection.find({ userId: userIdObj }).sort({ createdAt: -1 }).toArray();
}

/**
 * Lấy thông tin một phiên tạo bài tập
 * @param sessionId ID phiên
 * @returns Thông tin phiên
 */
export async function getExerciseSessionById(sessionId: ObjectId | string): Promise<ExerciseSession | null> {
  const sessionIdObj = typeof sessionId === 'string' ? toObjectId(sessionId) : sessionId;
  
  const collection = await getCollection<ExerciseSession>(COLLECTIONS.EXERCISE_SESSIONS);
  return collection.findOne({ _id: sessionIdObj });
}

/**
 * Lấy bài tập của một phiên
 * @param sessionId ID phiên
 * @returns Danh sách bài tập
 */
export async function getExercisesBySessionId(sessionId: ObjectId | string): Promise<GeneratedExercise[]> {
  const sessionIdObj = typeof sessionId === 'string' ? toObjectId(sessionId) : sessionId;
  
  const collection = await getCollection<GeneratedExercise>(COLLECTIONS.GENERATED_EXERCISES);
  return collection.find({ sessionId: sessionIdObj }).toArray();
}

/**
 * Xóa một phiên tạo bài tập và các bài tập liên quan
 * @param sessionId ID phiên
 * @returns Kết quả xóa
 */
export async function deleteExerciseSession(sessionId: ObjectId | string): Promise<boolean> {
  const sessionIdObj = typeof sessionId === 'string' ? toObjectId(sessionId) : sessionId;
  
  // Xóa các bài tập của phiên
  const exerciseCollection = await getCollection<GeneratedExercise>(COLLECTIONS.GENERATED_EXERCISES);
  await exerciseCollection.deleteMany({ sessionId: sessionIdObj });
  
  // Xóa phiên
  const sessionCollection = await getCollection<ExerciseSession>(COLLECTIONS.EXERCISE_SESSIONS);
  const result = await sessionCollection.deleteOne({ _id: sessionIdObj });
  
  return result.deletedCount > 0;
} 