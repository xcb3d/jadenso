'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setError('Email hoặc mật khẩu không chính xác');
      } else {
        router.push('/');
      }
    } catch (error) {
      setError('Có lỗi xảy ra khi đăng nhập');
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
        {/* Login Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-500 blur-md opacity-60 pulse-glow"></div>
            <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-600 flex items-center justify-center floating shadow-lg shadow-cyan-300/50 mx-auto">
              <span className="text-white font-bold text-2xl">J</span>
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-bold bg-gradient-to-r from-cyan-700 via-blue-700 to-teal-700 bg-clip-text text-transparent">
            Đăng nhập
          </h1>
          <p className="mt-2 text-slate-600">Chào mừng trở lại hành trình học tiếng Nhật của bạn</p>
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
            
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-2.5 rounded-lg shadow-lg shadow-cyan-200/50 transition-all ripple-effect"
            >
              {isLoading ? 'Đang đăng nhập...' : (
                <span className="flex items-center justify-center gap-2">
                  <LogIn className="h-5 w-5" />
                  <span>Đăng nhập</span>
                </span>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Chưa có tài khoản?{' '}
              <Link href="/register" className="text-cyan-600 hover:text-cyan-700 font-semibold inline-flex items-center gap-1 group">
                Đăng ký ngay
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </div>
          
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Hoặc tiếp tục với</span>
              </div>
            </div>
            
            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full border-slate-200 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:border-slate-300 transition-all ripple-effect"
                onClick={() => signIn('google', { callbackUrl: '/' })}
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                    fill="#34A853"
                  />
                </svg>
                Google
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 