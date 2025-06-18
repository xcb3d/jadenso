import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS } from '@/infrastructure/db/collections';
import { UserProgress, CompletedExercise, LessonStatus } from '@/models/UserProgress';
import { convertToPlainObject } from '@/lib/utils';

/**
   * Lấy thông tin tiến độ học tập của người dùng
   * @param userId ID người dùng
   * @returns Tiến độ học tập của người dùng
   */
export async function getUserProgress(userId: ObjectId): Promise<UserProgress | null> {
  try {
  const collection = await getCollection<UserProgress>(COLLECTIONS.USER_PROGRESS);
    
    // Đảm bảo userId là ObjectId
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    const query = { userId: userObjectId };
    
    const progress = await collection.findOne(query);
    
    return progress ? convertToPlainObject(progress) : null;
  } catch (error) {
    console.error(`Error in getUserProgress:`, error);
    return null;
  }
  }

  /**
   * Tạo tiến độ học tập mới cho người dùng
   * @param userId ID người dùng
   * @returns Tiến độ học tập mới tạo
   */
export async function createUserProgress(userId: ObjectId): Promise<UserProgress> {
  try {
    // Đảm bảo userId là ObjectId
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
  // Tìm unit đầu tiên để mở khóa
  const unitCollection = await getCollection(COLLECTIONS.UNITS);
    
  const firstUnit = await unitCollection.findOne({}, { sort: { order: 1 } });
  
    const newProgress: UserProgress = {
      userId: userObjectId,
      totalXp: 0,
      dailyGoal: 50, // Mục tiêu mặc định
      dailyProgress: 0,
      lastActiveDate: new Date(),
      lessonProgress: [],
    unitProgress: firstUnit ? [
      {
        unitId: firstUnit._id,
        completed: false,
        unlockedAt: new Date(),
      }
    ] : [],
      completedExercises: [],
      skills: {}
    };

  const collection = await getCollection<UserProgress>(COLLECTIONS.USER_PROGRESS);
    
    await collection.insertOne(newProgress);
    
    return newProgress;
  } catch (error) {
    console.error(`Error in createUserProgress:`, error);
    throw error;
  }
  }

  /**
   * Thêm XP cho người dùng
   * @param userId ID người dùng
   * @param xp Số XP thêm vào
   */
export async function addXp(userId: ObjectId, xp: number): Promise<void> {
  try {
  const collection = await getCollection<UserProgress>(COLLECTIONS.USER_PROGRESS);
    await collection.updateOne(
      { userId },
      { $inc: { totalXp: xp } }
    );
  } catch (error) {
    console.error(`Error in addXp:`, error);
    throw error;
  }
  }

  /**
 * Cập nhật tiến độ hàng ngày
   * @param userId ID người dùng
 * @param xp Số XP đạt được
   */
export async function updateDailyProgress(userId: ObjectId, xp: number): Promise<void> {
  try {
    const collection = await getCollection<UserProgress>(COLLECTIONS.USER_PROGRESS);

    // Kiểm tra xem ngày hiện tại có phải là ngày mới không
  const userProgress = await getUserProgress(userId);
    if (!userProgress) return;

    const lastActiveDate = userProgress.lastActiveDate ? new Date(userProgress.lastActiveDate) : null;
    const today = new Date();
    
    // Nếu là ngày mới, reset tiến độ hàng ngày
    if (lastActiveDate && lastActiveDate.getDate() !== today.getDate()) {
      await collection.updateOne(
        { userId },
        {
          $set: {
            dailyProgress: xp,
            lastActiveDate: today
          }
        }
      );
    } else {
      // Nếu là cùng ngày, tăng tiến độ
      await collection.updateOne(
        { userId },
        {
          $inc: { dailyProgress: xp },
          $set: { lastActiveDate: today }
        }
      );
    }
    
    // Cập nhật tổng XP
    await addXp(userId, xp);
  } catch (error) {
    console.error(`Error in updateDailyProgress:`, error);
    throw error;
    }
  }

  /**
   * Mở khóa một đơn vị học
   * @param userId ID người dùng
   * @param unitId ID đơn vị học
   */
export async function unlockUnit(userId: ObjectId, unitId: ObjectId): Promise<void> {
  try {
  const userProgress = await getUserProgress(userId);
    
    // Kiểm tra xem đơn vị đã được mở khóa chưa
    if (userProgress && userProgress.unitProgress.some(p => p.unitId.equals(unitId))) {
      return; // Đơn vị đã được mở khóa
    }

    // Thêm đơn vị mới vào danh sách đã mở khóa
  const collection = await getCollection<UserProgress>(COLLECTIONS.USER_PROGRESS);
    await collection.updateOne(
      { userId },
      { 
        $push: { 
          unitProgress: {
            unitId,
            completed: false,
            unlockedAt: new Date()
          }
        } 
      }
    );
  } catch (error) {
    console.error(`Error in unlockUnit:`, error);
    throw error;
  }
  }

  /**
   * Hoàn thành một đơn vị học
   * @param userId ID người dùng
   * @param unitId ID đơn vị học
   */
export async function completeUnit(userId: ObjectId, unitId: ObjectId): Promise<void> {
  try {
  const collection = await getCollection<UserProgress>(COLLECTIONS.USER_PROGRESS);
    await collection.updateOne(
      { userId, 'unitProgress.unitId': unitId },
      { $set: { 'unitProgress.$.completed': true } }
    );
  } catch (error) {
    console.error(`Error in completeUnit:`, error);
    throw error;
  }
  }

  /**
   * Cập nhật tiến độ bài học
   * @param userId ID người dùng
   * @param lessonId ID bài học
 * @param update Thông tin cập nhật
   * @param score Điểm số (nếu có)
   */
export async function updateLessonProgress(
    userId: ObjectId,
    lessonId: ObjectId,
  update: {
    status: LessonStatus;
    completedAt?: Date;
    startedAt?: Date;
  },
    score?: number
  ): Promise<void> {
  try {
    // Đảm bảo userId và lessonId là ObjectId
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const lessonObjectId = typeof lessonId === 'string' ? new ObjectId(lessonId) : lessonId;
    
    // Kiểm tra xem bài học đã tồn tại trong tiến độ chưa
    const userProgress = await getUserProgress(userObjectId);
    
    if (!userProgress) {
      throw new Error('User progress not found');
    }
    
    const existingProgress = userProgress.lessonProgress.find(p => 
      p.lessonId.toString() === lessonObjectId.toString()
    );

  const collection = await getCollection<UserProgress>(COLLECTIONS.USER_PROGRESS);
    
    if (existingProgress) {
      // Cập nhật tiến độ bài học hiện có
    const updateObj: Record<string, unknown> = { 'lessonProgress.$.status': update.status };
      
      if (score !== undefined) {
      updateObj['lessonProgress.$.score'] = score;
      }
      
    if (update.completedAt) {
      updateObj['lessonProgress.$.completedAt'] = update.completedAt;
    } else if (update.status === 'completed' && existingProgress.status !== 'completed') {
      updateObj['lessonProgress.$.completedAt'] = new Date();
    }
    
    if (update.startedAt) {
      updateObj['lessonProgress.$.startedAt'] = update.startedAt;
    } else if (update.status === 'in_progress' && !existingProgress.startedAt) {
      updateObj['lessonProgress.$.startedAt'] = new Date();
      }
      
      await collection.updateOne(
        { userId: userObjectId, 'lessonProgress.lessonId': lessonObjectId },
      { $set: updateObj }
      );
    } else {
      // Thêm tiến độ bài học mới
      const newProgress: Record<string, unknown> = {
        lessonId,
        status: update.status,
        score: score,
        startedAt: update.startedAt || (update.status === 'in_progress' ? new Date() : undefined),
        completedAt: update.completedAt || (update.status === 'completed' ? new Date() : undefined)
      };
      
      await collection.updateOne(
        { userId: userObjectId },
        { $push: { lessonProgress: newProgress } }
      );
      }
    } catch (error) {
    console.error(`Database error in updateLessonProgress:`, error);
      throw error;
    }
  }

  /**
   * Thêm bài tập đã hoàn thành
   * @param userId ID người dùng
   * @param exercise Thông tin bài tập đã hoàn thành
   */
export async function addCompletedExercise(userId: ObjectId, exercise: CompletedExercise): Promise<void> {
  try {
    // Đảm bảo userId là ObjectId
    const userObjectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    const userProgress = await getUserProgress(userObjectId);
    if (!userProgress) {
      throw new Error('User progress not found');
    }
    
    // Kiểm tra xem bài tập đã được hoàn thành chưa
    const existingExercise = userProgress.completedExercises.find(e => 
      e.exerciseId.toString() === exercise.exerciseId.toString()
    );
    
    if (existingExercise) {
      // Cập nhật thông tin bài tập đã hoàn thành
      const collection = await getCollection<UserProgress>(COLLECTIONS.USER_PROGRESS);
      await collection.updateOne(
        { 
          userId: userObjectId, 
          'completedExercises.exerciseId': exercise.exerciseId 
        },
        {
          $set: {
            'completedExercises.$.lastReviewedAt': exercise.completedAt,
            'completedExercises.$.reviewCount': (existingExercise.reviewCount || 0) + 1,
            'completedExercises.$.strength': exercise.strength
          }
        }
      );
    } else {
      // Thêm bài tập mới vào danh sách đã hoàn thành
      const collection = await getCollection<UserProgress>(COLLECTIONS.USER_PROGRESS);
      await collection.updateOne(
        { userId: userObjectId },
        { $push: { completedExercises: exercise } }
      );
    }
  } catch (error) {
    console.error(`Error in addCompletedExercise:`, error);
    throw error;
    }
  }

  /**
   * Cập nhật thông tin ôn tập cho bài tập
   * @param userId ID người dùng
   * @param exerciseId ID bài tập
   * @param lastReviewedAt Thời gian ôn tập gần nhất
   */
export async function updateExerciseReviewStats(
    userId: ObjectId,
    exerciseId: ObjectId,
    lastReviewedAt: Date
  ): Promise<void> {
    // Tăng số lần ôn tập và cập nhật thời gian ôn tập
  const collection = await getCollection<UserProgress>(COLLECTIONS.USER_PROGRESS);
    await collection.updateOne(
      { userId, 'completedExercises.exerciseId': exerciseId },
      {
        $set: { 'completedExercises.$.lastReviewedAt': lastReviewedAt },
        $inc: { 'completedExercises.$.reviewCount': 1 }
      }
    );
  }

  /**
 * Cập nhật tiến độ bài tập dựa trên điều kiện
   * @param userId ID người dùng
 * @param condition Hàm điều kiện để kiểm tra bài tập nào cần cập nhật
 * @param update Dữ liệu cập nhật
 */
export async function updateExerciseProgress(
  userId: ObjectId,
  condition: (exerciseId: ObjectId) => boolean,
  update: Partial<CompletedExercise>
): Promise<void> {
  const userProgress = await getUserProgress(userId);
  if (!userProgress || !userProgress.completedExercises || userProgress.completedExercises.length === 0) {
    return;
  }

  const collection = await getCollection<UserProgress>(COLLECTIONS.USER_PROGRESS);
  
  // Tìm ID của các bài tập cần cập nhật
  const exercisesToUpdate = userProgress.completedExercises
    .filter(ex => condition(ex.exerciseId))
    .map(ex => ex.exerciseId);
    
  // Cập nhật từng bài tập
  for (const exId of exercisesToUpdate) {
    await collection.updateOne(
      { userId, 'completedExercises.exerciseId': exId },
      { 
        $set: Object.fromEntries(
          Object.entries(update).map(([key, value]) => [`completedExercises.$.${key}`, value])
        )
      }
    );
  }
}

/**
 * Cập nhật sức mạnh của kỹ năng
 * @param userId ID người dùng
 * @param skill Tên kỹ năng
 * @param strength Mức sức mạnh thêm vào
 */
export async function updateSkillStrength(userId: ObjectId, skill: string, strength: number): Promise<void> {
  try {
  const collection = await getCollection<UserProgress>(COLLECTIONS.USER_PROGRESS);
  await collection.updateOne(
    { userId },
      { $set: { [`skills.${skill}`]: strength } }
  );
  } catch (error) {
    console.error(`Error in updateSkillStrength:`, error);
    throw error;
  }
} 