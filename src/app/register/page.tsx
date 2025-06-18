'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, User, Lock, ArrowLeft, UserPlus, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi đăng ký');
      }

      // Đăng nhập sau khi đăng ký thành công
      await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      // Chuyển hướng người dùng đến trang chủ
      router.push('/');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi đăng ký');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 relative overflow-hidden">
      {/* Animated Water Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="water-wave absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-100/20 via-blue-100/20 to-teal-100/20"></div>
          <div className="water-wave-2 absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-100/15 via-cyan-100/15 to-sky-100/15"></div>
        </div>
        {/* Enhanced Floating Particles */}
        <div className="particle-system">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          <div className="particle particle-5"></div>
        </div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Register Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-500 blur-md opacity-60 pulse-glow"></div>
            <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-600 flex items-center justify-center floating shadow-lg shadow-cyan-300/50 mx-auto">
              <span className="text-white font-bold text-2xl">J</span>
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold bg-gradient-to-r from-cyan-700 via-blue-700 to-teal-700 bg-clip-text text-transparent">
            Đăng ký tài khoản
          </h1>
          <p className="mt-2 text-slate-600">Bắt đầu hành trình học tiếng Nhật của bạn ngay hôm nay</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8 border border-cyan-100/50 relative overflow-hidden floating-card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
          
          {error && (
            <div className="bg-red-50/90 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2 slide-in-left">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5 relative">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/50 outline-none transition-all bg-white/80"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="username" className="block text-sm font-medium text-slate-700">
                Tên người dùng
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <User className="h-5 w-5" />
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/50 outline-none transition-all bg-white/80"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/50 outline-none transition-all bg-white/80"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-300/50 outline-none transition-all bg-white/80"
                  required
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-2.5 rounded-lg shadow-lg shadow-cyan-200/50 transition-all ripple-effect"
            >
              {isLoading ? 'Đang đăng ký...' : (
                <span className="flex items-center justify-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  <span>Đăng ký</span>
                </span>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-cyan-600 hover:text-cyan-700 font-semibold inline-flex items-center gap-1 group">
                <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" />
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 