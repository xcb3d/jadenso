import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getReadingsByUserId } from '@/repositories/japaneseReadingRepository';
import { encrypt } from '@/lib/encryption';

export async function GET() {
  try {
    // Kiểm tra phiên làm việc
    const authSession = await getServerSession(authOptions);
    
    if (!authSession?.user) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập để sử dụng tính năng này' }, { status: 401 });
    }
    
    // Lấy danh sách bài đọc của người dùng
    const readings = await getReadingsByUserId(authSession.user.id);
    
    // Mã hóa dữ liệu trước khi gửi về client
    const { encrypted, key } = encrypt({ readings });
    
    return NextResponse.json({ 
      success: true,
      data: encrypted,
      key
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 