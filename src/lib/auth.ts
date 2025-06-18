import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { findUserByEmail, createUser } from "@/repositories/userRepository";
import { createUserProgress } from "@/repositories/userProgressRepository";
import { type DefaultSession } from "next-auth";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        
        try {
          // Tìm user theo email
          const user = await findUserByEmail(credentials.email);
          
          // Nếu không tìm thấy user hoặc user không có mật khẩu
          if (!user || !user.password) return null;
          
          // So sánh mật khẩu
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) return null;
          
          // Trả về user nếu mật khẩu hợp lệ
          return {
            id: user._id?.toString() || "",
            email: user.email,
            name: user.displayName || user.username,
          };
        } catch (error) {
          console.error("Error during authentication:", error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // If user just signed in, add their data to token
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user id to session
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async signIn({ user }) {
      if (!user.email) return false;
      
      // Check if user exists in our MongoDB
      const dbUser = await findUserByEmail(user.email);
      
      // If not, create new user
      if (!dbUser) {
        const newUser = await createUser({
          email: user.email,
          username: user.name || user.email.split("@")[0],
          displayName: user.name || "",
          xp: 0,
          streak: 0,
          lastActivity: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        // Create user progress for new user
        if (newUser._id) {
          await createUserProgress(newUser._id);
        }
      }
      
      return true;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Extend next-auth types
declare module "next-auth" {
  interface User {
    id: string;
  }
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
} 