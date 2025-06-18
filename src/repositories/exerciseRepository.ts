import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS } from '@/infrastructure/db/collections';
import { Exercise } from '@/models/Exercise';

/**
   * Lấy một bài tập theo ID
   * @param id ID của bài tập
   * @returns Bài tập
   */
export async function getExerciseById(id: ObjectId): Promise<Exercise | null> {
  const collection = await getCollection<Exercise>(COLLECTIONS.EXERCISES);
    return collection.findOne({ _id: id });
}

/**
 * Tìm bài tập theo ID (hỗ trợ cả string và ObjectId)
 * @param id ID của bài tập (string hoặc ObjectId)
 * @returns Bài tập
 */
export async function findExerciseById(id: string | ObjectId): Promise<Exercise | null> {
  const collection = await getCollection<Exercise>(COLLECTIONS.EXERCISES);
  const objectId = typeof id === 'string' ? new ObjectId(id) : id;
  return collection.findOne({ _id: objectId });
}

  /**
   * Lấy danh sách bài tập theo các ID
   * @param ids Danh sách ID các bài tập cần lấy
   * @returns Danh sách bài tập
   */
export async function getExercisesByIds(ids: ObjectId[]): Promise<Exercise[]> {
  const collection = await getCollection<Exercise>(COLLECTIONS.EXERCISES);
    return collection.find({ _id: { $in: ids } }).toArray();
}

  /**
   * Lấy danh sách bài tập theo bài học
   * @param lessonId ID của bài học
   * @returns Danh sách bài tập
   */
export async function findExercisesByLessonId(lessonId: string): Promise<Exercise[]> {
  const collection = await getCollection<Exercise>(COLLECTIONS.EXERCISES);
  return collection.find({ lessonId: new ObjectId(lessonId) }).sort({ order: 1 }).toArray();
}

  /**
   * Lấy danh sách bài tập theo các kỹ năng
   * @param skills Danh sách kỹ năng
   * @param limit Số lượng bài tập tối đa
   * @param excludeIds Danh sách ID bài tập cần loại trừ
   * @returns Danh sách bài tập
   */
export async function getExercisesBySkills(
    skills: string[],
    limit: number = 10,
    excludeIds: ObjectId[] = []
  ): Promise<Exercise[]> {
    const query: Record<string, unknown> = {
      skillType: { $in: skills }
    };

    // Nếu có ID cần loại trừ
    if (excludeIds.length > 0) {
      query._id = { $nin: excludeIds };
    }

  const collection = await getCollection<Exercise>(COLLECTIONS.EXERCISES);
    // Lấy ngẫu nhiên các bài tập
    return collection.aggregate([
      { $match: query },
      { $sample: { size: limit } }
    ]).toArray() as Promise<Exercise[]>;
}

  /**
   * Tạo một bài tập mới
   * @param exercise Dữ liệu cho bài tập mới
   * @returns ID của bài tập đã tạo
   */
export async function createExercise(exercise: Omit<Exercise, '_id'>): Promise<ObjectId> {
  const collection = await getCollection<Exercise>(COLLECTIONS.EXERCISES);
    const result = await collection.insertOne({
      ...exercise,
      _id: new ObjectId()
    });
    return result.insertedId;
}

  /**
   * Cập nhật một bài tập
   * @param id ID của bài tập
   * @param update Dữ liệu cập nhật
   */
export async function updateExercise(id: ObjectId, update: Partial<Exercise>): Promise<void> {
  const collection = await getCollection<Exercise>(COLLECTIONS.EXERCISES);
    await collection.updateOne(
      { _id: id },
      { $set: update }
  );
  }

  /**
   * Xóa một bài tập
   * @param id ID của bài tập
   */
export async function deleteExercise(id: ObjectId): Promise<void> {
  const collection = await getCollection<Exercise>(COLLECTIONS.EXERCISES);
    await collection.deleteOne({ _id: id });
  }

  /**
   * Tạo nhiều bài tập cùng lúc
   * @param exercises Danh sách bài tập
   * @returns Danh sách ID của các bài tập đã tạo
   */
export async function createManyExercises(exercises: Omit<Exercise, '_id'>[]): Promise<ObjectId[]> {
    const exercisesWithIds = exercises.map(exercise => ({
      ...exercise,
      _id: new ObjectId()
    }));

  const collection = await getCollection<Exercise>(COLLECTIONS.EXERCISES);
    await collection.insertMany(exercisesWithIds);
    return exercisesWithIds.map(e => e._id);
} 