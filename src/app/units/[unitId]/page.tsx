import { notFound } from 'next/navigation';
import { getUnitWithLessons } from '@/app/actions/unit';
import { getUserProgress } from '@/app/actions/user';
import { MainLayout } from '@/components/layout/main-layout';
import { LessonList } from '@/components/lessons/lesson-list';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, BookOpen, CheckCircle, List, Award } from 'lucide-react';
import { normalizeId, convertToPlainObject } from '@/lib/utils';

interface UnitPageProps {
  params: {
    unitId: string;
  };
}

export default async function UnitPage({ params }: UnitPageProps) {
  const { unitId } = params;
  
  try {
    // Tải đơn vị học tập và các bài học
    const [{ unit, lessons }, userProgress] = await Promise.all([
      getUnitWithLessons(unitId),
      getUserProgress(),
    ]);

    // Chuyển đổi dữ liệu thành plain objects
    const plainUnit = unit ? convertToPlainObject(unit) : null;
    const plainLessons = lessons ? convertToPlainObject(lessons) : [];
    const plainUserProgress = userProgress ? convertToPlainObject(userProgress) : null;
    
    // Nếu không tìm thấy unit, chuyển đến trang 404
    if (!plainUnit) {
      notFound();
    }
  
    // Tìm các bài học đã hoàn thành
    const findCompletedLessons = (lessons: any[], userProgress: any | null) => {
      if (!userProgress) return [];
      
      const completedLessons: string[] = [];
      
      for (const lesson of lessons) {
        const lessonId = normalizeId(lesson._id);
        if (!lessonId) continue;
        
        // Tìm tiến độ của bài học
        for (const progress of userProgress.lessonProgress) {
          const progressLessonId = normalizeId(progress.lessonId);
          
          if (progressLessonId === lessonId && progress.status === 'completed') {
            completedLessons.push(lessonId);
            break;
          }
        }
      }
      
      return completedLessons;
    };
    
    // Tính số bài học đã hoàn thành
    const completedLessons = findCompletedLessons(plainLessons, plainUserProgress).length || 0;
    
    const progressPercentage = plainLessons.length > 0 ? Math.round((completedLessons / plainLessons.length) * 100) : 0;
  
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Back Button */}
          <div className="mb-6">
            <Link 
              href="/units" 
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Quay lại danh sách đơn vị
            </Link>
          </div>
          
          {/* Main Unit Card */}
          <Card className="mb-8 border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full -translate-y-20 translate-x-20 floating-orb"></div>
              
            <CardHeader className="pb-4 relative">
              <div className="flex items-start gap-5">
                <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 shadow-md shimmer flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">
                    {plainUnit.title}
                  </h1>
                  <p className="text-slate-600">
                    {plainUnit.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 shimmer">
                      <CheckCircle className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-base font-medium text-slate-700">Tiến độ học tập</span>
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                    <CheckCircle className="h-4 w-4 text-blue-500 mr-1" />
                    <span>{completedLessons}/{plainLessons.length}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full transition-all duration-500 wave-progress progress-wave"
                      style={{ width: `${progressPercentage}%` }}
                    >
                    </div>
                    {progressPercentage === 100 && (
                      <div className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center shadow-md pulse-notification">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-blue-600">{progressPercentage}% hoàn thành</span>
                    {completedLessons === plainLessons.length && plainLessons.length > 0 ? (
                      <div className="text-sm text-emerald-600 font-medium flex items-center">
                        <Award className="h-4 w-4 mr-1" />
                        Hoàn thành tất cả bài học!
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500">
                        {plainLessons.length - completedLessons} bài học còn lại
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        
          {/* Lessons Section */}
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 overflow-hidden">
            <CardHeader className="pb-4 border-b border-slate-100/50 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 shimmer">
                    <List className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Danh sách bài học</h2>
                </div>
                <span className="text-sm font-medium px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full">{plainLessons.length} bài học</span>
              </div>
            </CardHeader>
          
            <CardContent className="pt-6 relative">
              {plainLessons.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-300 to-purple-300/30 rounded-full"></div>
                  <LessonList lessons={plainLessons} userProgress={plainUserProgress || undefined} />
                </div>
              ) : (
                <div className="text-center py-12 px-4 bg-gradient-to-br from-white to-indigo-50/50 rounded-lg">
                  <div className="p-6 rounded-full bg-indigo-50 inline-flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-indigo-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Chưa có bài học</h3>
                  <p className="text-slate-600 max-w-md mx-auto">Chưa có bài học nào trong đơn vị này. Vui lòng quay lại sau.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  } catch (error) {
    throw error;
  }
} 