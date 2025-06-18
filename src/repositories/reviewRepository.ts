import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS } from '@/infrastructure/db/collections';
import { Review, ReviewStatus, ExerciseAttempt } from '@/models/Review';

/**
   * Tạo một phiên ôn tập mới
   * @param review Dữ liệu cho phiên ôn tập mới
   * @returns Phiên ôn tập đã được tạo
   */
export async function createReviewSession(review: Omit<Review, '_id'>): Promise<Review> {
  const collection = await getCollection<Review>(COLLECTIONS.REVIEWS);
    const result = await collection.insertOne({
      ...review,
      _id: new ObjectId(),
    });

    const createdReview: Review = {
      _id: result.insertedId,
      ...review
    };

    return createdReview;
  }

  /**
   * Thêm một lượt thực hiện bài tập vào phiên ôn tập
   * @param reviewId ID của phiên ôn tập
   * @param attempt Thông tin về lượt thực hiện
   */
export async function addAttemptToReview(reviewId: ObjectId, attempt: ExerciseAttempt): Promise<void> {
  const collection = await getCollection<Review>(COLLECTIONS.REVIEWS);
    await collection.updateOne(
      { _id: reviewId },
      { $push: { attempts: attempt } }
    );
  }

  /**
   * Hoàn thành một phiên ôn tập
   * @param reviewId ID của phiên ôn tập
   * @param score Điểm số đạt được
   * @returns Phiên ôn tập đã hoàn thành
   */
export async function completeReviewSession(reviewId: ObjectId, score: number): Promise<Review | null> {
  const collection = await getCollection<Review>(COLLECTIONS.REVIEWS);
    const result = await collection.findOneAndUpdate(
      { _id: reviewId },
      {
        $set: {
          status: 'completed' as ReviewStatus,
          score,
          completedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  /**
   * Lấy tất cả các phiên ôn tập của một người dùng
   * @param userId ID người dùng
   * @returns Danh sách phiên ôn tập
   */
export async function getReviewsByUserId(userId: ObjectId): Promise<Review[]> {
  const collection = await getCollection<Review>(COLLECTIONS.REVIEWS);
    return collection.find({ userId }).toArray();
  }

  /**
   * Lấy một phiên ôn tập theo ID
   * @param reviewId ID của phiên ôn tập
   * @returns Phiên ôn tập
   */
export async function getReviewById(reviewId: ObjectId): Promise<Review | null> {
  const collection = await getCollection<Review>(COLLECTIONS.REVIEWS);
    return collection.findOne({ _id: reviewId });
  }

  /**
   * Lấy các phiên ôn tập đã hoàn thành trong khoảng thời gian
   * @param userId ID người dùng
   * @param startDate Ngày bắt đầu
   * @param endDate Ngày kết thúc
   * @returns Danh sách phiên ôn tập
   */
export async function getCompletedReviewsInDateRange(
    userId: ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<Review[]> {
  const collection = await getCollection<Review>(COLLECTIONS.REVIEWS);
    return collection.find({
      userId,
      status: 'completed',
      completedAt: {
        $gte: startDate,
        $lte: endDate
      }
    }).toArray();
} 