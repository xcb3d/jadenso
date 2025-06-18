'use client';

import { GenerateReading } from "@/components/GenerateReading";
import { MainLayout } from "@/components/layout/main-layout";
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function GenerateReadingPage() {
  return (
    <MainLayout>
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/reading" className="flex items-center text-sm text-cyan-600 hover:text-cyan-700 transition-colors mb-4 group">
            <ArrowLeft className="h-4 w-4 mr-1 group-hover:translate-x-[-2px] transition-transform" />
            <span>Quay lại danh sách bài đọc</span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Tạo bài đọc tiếng Nhật</h1>
          <p className="text-slate-600">Nhập danh sách từ vựng và tạo bài đọc tiếng Nhật dùng AI</p>
        </div>
        
        <div className="relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full -translate-y-16 translate-x-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-200/20 to-indigo-200/20 rounded-full translate-y-16 -translate-x-16 blur-2xl"></div>
          <div className="relative">
            <GenerateReading />
          </div>
        </div>
      </section>
    </MainLayout>
  );
} 