import { getSpeakingExerciseById } from '@/repositories/speakingRepository';
import { MainLayout } from '@/components/layout/main-layout';
import { SpeakingExercisePractice } from '@/components/speaking/SpeakingExercisePractice';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Mic } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

interface SpeakingExercisePageProps {
  params: {
    exerciseId: string;
  }
}

// Helper function to convert MongoDB document to plain object
function convertToPlainObject<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

export default async function SpeakingExercisePage({ params }: SpeakingExercisePageProps) {
  // Check if user is logged in
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return redirect('/login');
  }

  const { exerciseId } = params;

  // Get speaking exercise
  const exerciseDoc = await getSpeakingExerciseById(exerciseId);
  
  if (!exerciseDoc) {
    return notFound();
  }

  // Convert MongoDB document to plain JavaScript object
  const exercise = convertToPlainObject(exerciseDoc);

  // Function to get difficulty text
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Sơ cấp';
      case 'intermediate': return 'Trung cấp';
      case 'advanced': return 'Nâng cao';
      default: return 'Không xác định';
    }
  };

  // Function to get difficulty style
  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'intermediate': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center text-sm text-slate-600 mb-4">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <ChevronLeft className="h-4 w-4 mx-1 rotate-180" />
          <Link href="/speaking" className="hover:text-blue-600">Luyện phát âm</Link>
          <ChevronLeft className="h-4 w-4 mx-1 rotate-180" />
          <span>Chi tiết bài tập</span>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl -z-10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/20 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl -z-10"></div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 shimmer">
                    <Mic className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                    Luyện phát âm
                  </h1>
                </div>
                <div className="w-20 h-1 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full mb-3"></div>
              </div>

              <Badge className={`${getDifficultyStyle(exercise.difficulty)} font-medium px-3 py-1.5 text-sm`}>
                {getDifficultyText(exercise.difficulty)}
              </Badge>
            </div>
          </div>
        </div>

        <SpeakingExercisePractice exercise={exercise} />
        
        <div className="mt-6">
          <Link href="/speaking" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Quay lại tất cả bài tập
          </Link>
        </div>
      </div>
    </MainLayout>
  );
} 