import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, createUser } from "@/repositories/userRepository";
import { createUserProgress } from "@/repositories/userProgressRepository";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json();

    // Kiểm tra dữ liệu đầu vào
    if (!email || !password || !username) {
      return NextResponse.json(
        { message: "Vui lòng điền đầy đủ thông tin" },
        { status: 400 }
      );
    }

    // Kiểm tra nếu email đã tồn tại
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { message: "Email này đã được sử dụng" },
        { status: 409 }
      );
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo người dùng mới
    const user = await createUser({
      email,
      username,
      displayName: username,
      password: hashedPassword,
      xp: 0,
      streak: 0,
      lastActivity: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Khởi tạo UserProgress cho người dùng mới
    if (user._id) {
      await createUserProgress(user._id);
    }

    // Trả về thông tin người dùng đã đăng ký (không bao gồm mật khẩu)
    return NextResponse.json({
      message: "Đăng ký thành công",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return NextResponse.json(
      { message: "Đã xảy ra lỗi khi đăng ký" },
      { status: 500 }
    );
  }
} 