'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MainLayout } from '@/components/layout/main-layout';
import { AIExerciseGenerator } from '@/components/speaking/AIExerciseGenerator';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { SpeakingExercise } from '@/models/SpeakingExercise';

export default function CreateSpeakingExercisePage() {
  const router = useRouter();
  const { status } = useSession();
  const [generatedExercises, setGeneratedExercises] = useState<Partial<SpeakingExercise>[]>([]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);

  // Show loading or redirect to login if not authenticated
  if (status === "loading") {
    return (
      <MainLayout>
        <div className="container mx-auto py-10">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-blue-600">Đang tải...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (status === "unauthenticated") {
    return null; // useEffect will handle redirect
  }
  
  // Handle when AI generates exercises
  const handleExercisesGenerated = (exercises: Partial<SpeakingExercise>[]) => {
    setGeneratedExercises(exercises);
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-10 space-y-6">
        <Link href="/speaking" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Quay lại bài tập phát âm
        </Link>
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl -z-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl -z-10"></div>
          
          <div className="p-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-3">
              Tạo bài tập phát âm với AI
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full mb-3"></div>
            <p className="text-lg text-slate-600 max-w-2xl mb-6">
              Sử dụng trí tuệ nhân tạo để tạo các bài tập phát âm tiếng Nhật phù hợp với trình độ của bạn.
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
          <AIExerciseGenerator onExercisesGenerated={handleExercisesGenerated} />
          
          {generatedExercises.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">Bài tập được tạo bởi AI</h2>
              <p className="text-slate-600">Đã tạo {generatedExercises.length} bài tập. Hãy chỉnh sửa nếu cần và lưu lại.</p>
              
              <div className="grid gap-6">
                {generatedExercises.map((exercise, index) => (
                  <GeneratedExerciseCard key={index} exercise={exercise} index={index} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

// Card hiển thị bài tập được AI tạo
function GeneratedExerciseCard({ exercise, index }: { exercise: Partial<SpeakingExercise>; index: number }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Lưu bài tập vào cơ sở dữ liệu
  const saveExercise = async () => {
    setSaving(true);
    
    try {
      const response = await fetch('/api/speaking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...exercise,
          isCustom: true
        }),
      });
      
      if (!response.ok) {
        throw new Error('Lỗi khi lưu bài tập');
      }
      
      setSaved(true);
    } catch (error) {
      console.error('Error saving exercise:', error);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <div className={`p-6 bg-white border rounded-lg shadow-sm ${saved ? 'border-emerald-200' : 'border-slate-200'}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded text-sm font-medium">
            #{index + 1}
          </span>
          <span className={`
            ${exercise.difficulty === 'beginner' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''}
            ${exercise.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-800 border-amber-200' : ''}
            ${exercise.difficulty === 'advanced' ? 'bg-red-100 text-red-800 border-red-200' : ''}
            px-2 py-1 rounded text-sm font-medium`}>
            {exercise.difficulty === 'beginner' && 'Sơ cấp'}
            {exercise.difficulty === 'intermediate' && 'Trung cấp'}
            {exercise.difficulty === 'advanced' && 'Nâng cao'}
          </span>
          <span className="px-2 py-1 bg-slate-100 text-slate-800 rounded text-sm">
            {exercise.category}
          </span>
        </div>
        <button
          onClick={saveExercise}
          disabled={saving || saved}
          className={`px-4 py-1.5 rounded text-sm font-medium flex items-center gap-1
            ${saved 
              ? 'bg-emerald-100 text-emerald-800 cursor-default'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
        >
          {saved ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Đã lưu
            </>
          ) : saving ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin mr-1">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Đang lưu
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Lưu bài tập
            </>
          )}
        </button>
      </div>
      
      <div className="mb-4 p-4 bg-slate-50 rounded-md border border-slate-100">
        <div className="mb-2 font-medium text-slate-700">Văn bản tiếng Nhật:</div>
        <p className="text-xl text-slate-900 mb-4">{exercise.text}</p>
        <div className="mb-2 font-medium text-slate-700">Bản dịch tiếng Việt:</div>
        <p className="text-slate-800">{exercise.translation}</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {exercise.tags?.map((tag, i) => (
          <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
} 