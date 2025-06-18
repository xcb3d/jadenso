import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getLessonWithExercises } from '@/app/actions/lesson';
import { getUserProgress } from '@/app/actions/user';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { LessonClient } from './client';
import { ArrowLeft, BookOpen, Star, Award, BarChart } from 'lucide-react';

interface LessonPageProps {
  params: {
    lessonId: string;
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = params;
  
  // Lấy thông tin lesson và danh sách exercises
  const { lesson, exercises } = await getLessonWithExercises(lessonId);
  
  // Nếu không tìm thấy lesson, chuyển đến trang 404
  if (!lesson) {
    notFound();
  }
  
  // Lấy thông tin tiến độ người dùng
  const userProgress = await getUserProgress();
  
  // Kiểm tra xem bài học đã hoàn thành chưa
  const isLessonCompleted = userProgress?.lessonProgress.some(
    p => p.lessonId.toString() === lessonId && p.status === 'completed'
  ) || false;
  
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4">
        {/* Banner Top */}
        <div className="mb-10 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 p-1">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-cyan-500/30 water-wave-2"></div>
          <div className="absolute inset-0 bg-[url('/assets/patterns/dot-pattern.svg')] opacity-10"></div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full -translate-y-20 translate-x-20 floating-orb"></div>
            
            {/* Navigation */}
            <div className="mb-6">
              <Link 
                href={`/units/${lesson.unitId}`} 
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Quay lại đơn vị học
              </Link>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-200/50 shimmer">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 via-blue-700 to-cyan-700 bg-clip-text text-transparent">
                    {lesson.title}
                  </h1>
                </div>
                
                <div className="mt-4 sm:mt-0 flex items-center gap-2">
                  <div className="flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm">
                    <Star className="h-4 w-4 mr-1 text-amber-500" />
                    <span className="font-medium">{lesson.xpReward} XP</span>
                  </div>
                </div>
              </div>
              
              <p className="text-lg text-slate-600 mt-3 max-w-3xl">{lesson.description}</p>
              
              <div className="flex gap-2 flex-wrap mt-4">
                {lesson.skills.map((skill, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 px-3 py-1 text-sm font-medium text-blue-700 transition-transform hover:scale-105"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Lesson Content */}
        <div className="mb-10">
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 overflow-hidden floating-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 shimmer">
                  <Award className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-xl text-slate-800">Nội dung bài học</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <p className="text-slate-700">
                  Hãy hoàn thành các bài tập dưới đây để tiếp thu nội dung bài học.
                  Sau khi hoàn thành tất cả các bài tập, bạn sẽ nhận được <span className="font-semibold text-blue-600">{lesson.xpReward} điểm XP</span>.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Exercises */}
        <div className="space-y-6 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 shimmer">
              <BarChart className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Bài tập</h2>
          </div>
          
          {exercises.length > 0 ? (
            <div className="relative">
              <div className="absolute left-0 top-10 bottom-10 w-1 bg-gradient-to-b from-blue-300 to-cyan-300 rounded-full"></div>
              <LessonClient
                lessonId={lessonId}
                exercises={exercises}
                xpReward={lesson.xpReward}
                isLessonCompleted={isLessonCompleted}
              />
            </div>
          ) : (
            <Card className="border-0 bg-gradient-to-br from-white to-yellow-50/50 shadow-lg shadow-slate-100/50 overflow-hidden text-center p-8">
              <div className="p-6 rounded-full bg-yellow-50 inline-flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-yellow-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Chưa có bài tập</h3>
              <p className="text-slate-600 max-w-md mx-auto">Chưa có bài tập nào trong bài học này. Vui lòng quay lại sau.</p>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
} 