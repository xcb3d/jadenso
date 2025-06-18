import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { findUserById } from '@/repositories/userRepository';
import { createUserProgress } from '@/repositories/userProgressRepository';
import { getCollection, COLLECTIONS } from '@/infrastructure/db/collections';
import { ObjectId } from 'mongodb';

export async function POST() {
  try {
    // Chỉ cho phép gọi API này trong môi trường phát triển
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ message: 'API không khả dụng trong môi trường production' }, { status: 403 });
    }

    // Lấy thông tin người dùng từ session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: 'Bạn cần đăng nhập để thực hiện' }, { status: 401 });
    }

    // Lấy thông tin user từ database
    const user = await findUserById(session.user.id);
    if (!user || !user._id) {
      return NextResponse.json({ message: 'Không tìm thấy thông tin người dùng' }, { status: 404 });
    }

    // Xóa tiến độ hiện tại
    const userProgressCollection = await getCollection(COLLECTIONS.USER_PROGRESS);
    await userProgressCollection.deleteOne({ userId: user._id });

    // Tạo tiến độ mới
    await createUserProgress(user._id);

    return NextResponse.json({ 
      success: true, 
      message: 'Đã reset tiến độ người dùng thành công' 
    });
  } catch (error) {
    console.error('Error resetting user progress:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Có lỗi xảy ra khi reset tiến độ người dùng', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 