import { ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function SpeakingPageHeader() {
  return (
    <div className="mb-10 relative overflow-hidden">
      <div className="flex items-center text-sm text-slate-600 mb-4">
        <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span>Luyện phát âm</span>
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl -z-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl -z-10"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-3">
              Luyện phát âm tiếng Nhật
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full mb-3"></div>
            <p className="text-lg text-slate-600 max-w-2xl">
              Thực hành phát âm với trí tuệ nhân tạo và nhận phản hồi chi tiết
            </p>
          </div>

          <Link href="/speaking/create" passHref className="shrink-0">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-white px-4 py-2 rounded-md">
              <Plus className="h-4 w-4 mr-2" />
              Tạo bài tập mới
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 