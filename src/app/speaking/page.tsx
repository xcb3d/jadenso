import { MainLayout } from '@/components/layout/main-layout';
import { getAllSpeakingExercises } from '@/repositories/speakingRepository';
import { SpeakingExerciseItem } from '@/components/speaking/SpeakingExerciseItem';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { SpeakingExercise } from '@/models/SpeakingExercise';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, Mic, Sparkles, BookOpen, Headphones, Volume } from 'lucide-react';
import { SpeakingPageHeader } from '@/components/speaking/SpeakingPageHeader';

// Helper function to convert MongoDB document to plain object
function convertToPlainObject<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}

export default async function SpeakingPage() {
  // Check if user is logged in
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return redirect('/login');
  }

  // Get all speaking exercises
  const exercisesFromDb = await getAllSpeakingExercises();
  
  // Convert MongoDB documents to plain JavaScript objects
  const speakingExercises = convertToPlainObject(exercisesFromDb);

  // Group exercises by difficulty
  const exercisesByDifficulty: Record<string, SpeakingExercise[]> = {
    beginner: [],
    intermediate: [],
    advanced: []
  };

  // Separate built-in and custom exercises
  const builtInExercises = speakingExercises.filter(ex => !ex.isCustom);
  const customExercises = speakingExercises.filter(ex => ex.isCustom);
  
  // Group built-in exercises by difficulty
  builtInExercises.forEach(exercise => {
    if (exercisesByDifficulty[exercise.difficulty]) {
      exercisesByDifficulty[exercise.difficulty].push(exercise);
    }
  });

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {/* Header Section with Create button */}
        <SpeakingPageHeader />
        
        {/* Feature explanation */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 shimmer">
              <Volume className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Tính năng phát âm</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Card className="border-0 bg-gradient-to-br from-white to-indigo-50/50 shadow-lg shadow-slate-100/50 floating-card overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/30 to-blue-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 shimmer">
                    <Mic className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-sm font-medium text-slate-700">Đánh giá thông minh</div>
                </div>
                <p className="text-slate-600">
                  AI sẽ phân tích phát âm của bạn và đánh giá theo nhiều tiêu chí khác nhau.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-white to-indigo-50/50 shadow-lg shadow-slate-100/50 floating-card overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 shimmer">
                    <Headphones className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-sm font-medium text-slate-700">Phản hồi chi tiết</div>
                </div>
                <p className="text-slate-600">
                  Nhận điểm mạnh, điểm yếu và gợi ý cải thiện dành riêng cho bạn.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-white to-indigo-50/50 shadow-lg shadow-slate-100/50 floating-card overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-200/30 to-teal-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 shimmer">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-sm font-medium text-slate-700">Tạo bài tập với AI</div>
                </div>
                <p className="text-slate-600">
                  Tự tạo bài tập phát âm mới với sự trợ giúp của trí tuệ nhân tạo.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs for built-in vs custom exercises */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 shimmer">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Danh sách bài tập</h2>
          </div>
          
          <Tabs defaultValue="built-in" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="built-in" className="data-[state=active]:bg-white">
                  Bài tập có sẵn
                </TabsTrigger>
                <TabsTrigger value="custom" className="data-[state=active]:bg-white">
                  Bài tập tự tạo ({customExercises.length})
                </TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Filter className="h-4 w-4" />
                <span>Lọc bài tập</span>
              </div>
            </div>
            
            {/* Built-in exercises */}
            <TabsContent value="built-in" className="space-y-8">
              {/* Beginner exercises */}
              {exercisesByDifficulty.beginner.length > 0 && (
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-emerald-500"></span>
                    Dành cho người mới bắt đầu
                  </h3>
                  <p className="text-slate-600">Tập trung vào âm tiết cơ bản và phát âm chính xác từng chữ cái.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exercisesByDifficulty.beginner.map((exercise) => (
                      <SpeakingExerciseItem key={exercise._id?.toString() || ''} exercise={exercise} />
                    ))}
                  </div>
                </section>
              )}

              {/* Intermediate exercises */}
              {exercisesByDifficulty.intermediate.length > 0 && (
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-amber-500"></span>
                    Trung cấp
                  </h3>
                  <p className="text-slate-600">Luyện tập với các từ và cụm từ ngắn, tập trung vào ngữ điệu.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exercisesByDifficulty.intermediate.map((exercise) => (
                      <SpeakingExerciseItem key={exercise._id?.toString() || ''} exercise={exercise} />
                    ))}
                  </div>
                </section>
              )}

              {/* Advanced exercises */}
              {exercisesByDifficulty.advanced.length > 0 && (
                <section className="space-y-4">
                  <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                    Nâng cao
                  </h3>
                  <p className="text-slate-600">Thực hành với câu dài và đoạn văn, tập trung vào sự trôi chảy và tự nhiên.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exercisesByDifficulty.advanced.map((exercise) => (
                      <SpeakingExerciseItem key={exercise._id?.toString() || ''} exercise={exercise} />
                    ))}
                  </div>
                </section>
              )}

              {/* Empty state for built-in exercises */}
              {builtInExercises.length === 0 && (
                <Card className="border-0 bg-gradient-to-br from-white to-indigo-50/50 shadow-lg shadow-slate-100/50 overflow-hidden text-center p-8">
                  <div className="p-6 rounded-full bg-indigo-50 inline-flex items-center justify-center mx-auto mb-4">
                    <Mic className="h-8 w-8 text-indigo-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">Chưa có bài tập phát âm</h3>
                  <p className="text-slate-600 max-w-md mx-auto">Chưa có bài tập phát âm nào. Vui lòng quay lại sau.</p>
                </Card>
              )}
            </TabsContent>
            
            {/* Custom exercises */}
            <TabsContent value="custom" className="space-y-6">
              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                  Bài tập của tôi
                </h3>
                <p className="text-slate-600">Những bài tập phát âm bạn đã tự tạo và lưu trữ.</p>
                
                {customExercises.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customExercises.map((exercise) => (
                      <SpeakingExerciseItem key={exercise._id?.toString() || ''} exercise={exercise} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 bg-gradient-to-br from-white to-indigo-50/50 shadow-lg shadow-slate-100/50 overflow-hidden text-center p-8">
                    <div className="p-6 rounded-full bg-indigo-50 inline-flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-8 w-8 text-indigo-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Chưa có bài tập tự tạo</h3>
                    <p className="text-slate-600 max-w-md mx-auto">Bạn chưa tạo bài tập phát âm nào. Hãy nhấn vào nút "Tạo bài tập mới" để bắt đầu.</p>
                  </Card>
                )}
              </section>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
} 