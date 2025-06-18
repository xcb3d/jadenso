import { getUnits } from './actions/unit';
import { getUserProgress } from './actions/user';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Trophy, Target, Users, Play, Star, BarChart3, Zap, Sparkles, ArrowRight, CheckCircle2, Book } from "lucide-react";
import { MainLayout } from '@/components/layout/main-layout';
import { LearningPathSection } from '@/components/learning-path-section';
import { findLessonById } from '@/repositories/lessonRepository';
import { findUnitById } from '@/repositories/unitRepository';
import { Lesson } from '@/models/Lesson';
import { Unit } from '@/models/Unit';
import { ObjectId } from 'mongodb';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Home() {
  // Kiểm tra người dùng đã đăng nhập chưa
  const session = await getServerSession(authOptions);
  const isAuthenticated = !!session?.user;
  
  // Chỉ lấy dữ liệu nếu người dùng đã đăng nhập
  const [units, userProgress] = isAuthenticated ? 
    await Promise.all([getUnits(), getUserProgress()]) : 
    [[], null];
  
  // Find lessons in progress for the current user
  let currentLesson: Lesson | null = null;
  let currentUnit: Unit | null = null;
  let lessonsCompleted = 0;
  let totalLessons = 0;

  if (userProgress) {
    // Find the most recent in-progress lesson
    const inProgressLesson = userProgress.lessonProgress
      .filter(lp => lp.status === 'in_progress')
      .sort((a, b) => {
        const dateA = a.startedAt ? new Date(a.startedAt).getTime() : 0;
        const dateB = b.startedAt ? new Date(b.startedAt).getTime() : 0;
        return dateB - dateA; // Most recent first
      })[0];
    
    // If no in-progress lesson, find the most recently completed lesson
    const mostRecentLesson = inProgressLesson || userProgress.lessonProgress
      .filter(lp => lp.status === 'completed')
      .sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateB - dateA; // Most recent first
      })[0];
    
    if (mostRecentLesson) {
      // Get the actual lesson data
      currentLesson = await findLessonById(mostRecentLesson.lessonId.toString());
      
      if (currentLesson) {
        // Get the unit for this lesson
        currentUnit = await findUnitById(currentLesson.unitId.toString());
        
        // Calculate progress in the unit
        if (currentUnit) {
          const unitLessons = currentUnit.lessons || [];
          lessonsCompleted = userProgress.lessonProgress
            .filter(lp => 
              unitLessons.some((ul: ObjectId) => ul.toString() === lp.lessonId.toString()) && 
              lp.status === 'completed'
            ).length;
          
          totalLessons = unitLessons.length;
        }
      }
    }
  }
  
  const progressPercentage = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

  return (
    <MainLayout>
      {isAuthenticated ? (
        // Giao diện cho người dùng đã đăng nhập
        <section className="px-6 py-16 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Learning Area */}
            <div className="lg:col-span-2 space-y-8">
              <LearningPathSection units={units} userProgress={userProgress || undefined} />
              
              {/* Current Lesson */}
              {currentLesson && currentUnit && (
                <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 floating-card-slow">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full translate-y-12 -translate-x-12 floating-orb-slow"></div>
                  
                  <div className="flex flex-col md:flex-row">
                    <div className="relative h-48 w-full md:h-auto md:w-80 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flowing-bg"></div>
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-cyan-700 border-0 font-semibold floating-badge">
                          {currentUnit.difficulty.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 right-4 text-white/80">
                        <div className="text-6xl font-bold opacity-20 floating-text character-bounce">ひ</div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-4xl font-bold opacity-30 floating-text-reverse">あ</div>
                      </div>
                    </div>
                    <div className="flex-1 p-8 relative">
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="outline" className="text-cyan-600 border-cyan-200 bg-cyan-50 font-medium">
                          {currentUnit.title}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <div className="w-2 h-2 rounded-full bg-cyan-400 pulse-dot"></div>
                          {progressPercentage}% complete
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-cyan-600 transition-colors">
                        {currentLesson.title}
                      </h3>
                      <p className="text-slate-600 mb-6 leading-relaxed">
                        {currentLesson.description}
                      </p>
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">Tiến độ</span>
                          <span className="text-sm text-slate-500">{lessonsCompleted} of {totalLessons} bài học</span>
                        </div>
                        <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-400 to-blue-500 shimmer rounded-full" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6 text-sm text-slate-500">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span>{totalLessons} bài học</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            <span>{currentUnit.difficulty}</span>
                          </div>
                        </div>
                        <Link href={`/lessons/${currentLesson._id}`} passHref>
                          <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/50 shimmer rounded-lg">
                            <div className="flex items-center">
                              <div className="p-1 rounded-full bg-white/20 mr-2">
                                <Play className="h-3 w-3" />
                              </div>
                              <span>Tiếp tục học</span>
                            </div>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 floating-card overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
                
                <CardHeader className="pb-4 relative">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 shimmer">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    Thống kê học tập
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50/30 hover:from-slate-50/80 hover:to-blue-50/50 transition-colors border border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Ngày học liên tiếp</span>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                      5 ngày 🔥
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50/30 hover:from-slate-50/80 hover:to-blue-50/50 transition-colors border border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Từ vựng đã học</span>
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                      127 từ ✨
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50/30 hover:from-slate-50/80 hover:to-blue-50/50 transition-colors border border-slate-100">
                    <span className="text-sm font-medium text-slate-700">Thời gian học hôm nay</span>
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      45 phút ⏰
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Achievement */}
              <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 floating-card overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-yellow-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
                <CardHeader className="pb-4 relative">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 shimmer">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    Thành tích gần đây
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50/50 rounded-xl border border-amber-100">
                    <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-200/50 shimmer">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900">Học viên xuất sắc</p>
                      <p className="text-sm text-amber-700">Hoàn thành 5 bài học liên tiếp</p>
                      <div className="text-xs font-medium mt-2 bg-white/80 rounded-full px-3 py-1 inline-block text-amber-700 shadow-sm">+50 XP thưởng!</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 floating-card overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
                <CardHeader className="pb-4 relative">
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 shimmer">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    Hành động nhanh
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 relative">
                  <Link href="/flashcards">
                    <Button variant="outline" className="w-full justify-start bg-gradient-to-r from-slate-50 to-cyan-50/30 hover:from-slate-50/80 hover:to-cyan-50/50 border-cyan-100 hover:border-cyan-200 text-slate-700 hover:text-cyan-700 transition-all duration-300 group">
                      <Book className="w-4 h-4 mr-3 text-cyan-600 group-hover:scale-110 transition-transform" />
                      Flashcards
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start bg-gradient-to-r from-slate-50 to-blue-50/30 hover:from-slate-50/80 hover:to-blue-50/50 border-blue-100 hover:border-blue-200 text-slate-700 hover:text-blue-700 transition-all duration-300 group">
                    <Target className="w-4 h-4 mr-3 text-blue-600 group-hover:scale-110 transition-transform" />
                    Luyện tập ngữ pháp
                  </Button>
                  <Button variant="outline" className="w-full justify-start bg-gradient-to-r from-slate-50 to-purple-50/30 hover:from-slate-50/80 hover:to-purple-50/50 border-purple-100 hover:border-purple-200 text-slate-700 hover:text-purple-700 transition-all duration-300 group">
                    <Users className="w-4 h-4 mr-3 text-purple-600 group-hover:scale-110 transition-transform" />
                    Tham gia cộng đồng
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      ) : (
        // Giao diện cho người dùng chưa đăng nhập
        <>
          {/* Hero Section */}
          <section className="px-6 py-24 max-w-7xl mx-auto relative">
            <div className="text-center mb-16 relative">
              <div className="inline-block animate-fade-in relative">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100 floating-badge mb-6">
                  <Sparkles className="h-4 w-4 text-cyan-500 sparkle-animation" />
                  <span className="text-sm font-medium text-cyan-700">Chào mừng bạn đến với JadeNSO</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  <span className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                    Học tiếng Nhật
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent flowing-gradient text-glow">
                    cùng JadeNSO
                  </span>
                </h1>
                <div className="w-32 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto mb-6 rounded-full"></div>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-10">
                  Bắt đầu hành trình học tiếng Nhật với các bài học tương tác và cộng đồng học viên nhiệt tình
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/register">
                    <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-blue-200/50 px-8 py-6 text-lg font-medium rounded-xl shimmer">
                      Đăng ký miễn phí
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" size="lg" className="border-2 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-6 text-lg font-medium rounded-xl">
                      Đăng nhập
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-40 left-10 w-20 h-20 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full floating-orb opacity-70"></div>
            <div className="absolute top-60 right-20 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full floating-orb-slow opacity-80"></div>
            <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-br from-teal-200/20 to-emerald-200/20 rounded-full floating-orb-reverse opacity-60"></div>
          </section>

          {/* Features Section */}
          <section className="px-6 py-16 bg-gradient-to-b from-slate-50 to-white">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">Tại sao chọn JadeNSO?</h2>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto">Phương pháp học hiệu quả, công nghệ hiện đại và cộng đồng hỗ trợ</p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Feature 1 */}
                <Card className="border-0 bg-gradient-to-br from-white to-blue-50/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full -translate-y-12 translate-x-12 floating-orb"></div>
                  <CardContent className="p-8">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200/40 group-hover:scale-110 transition-transform duration-300 shimmer">
                      <BookOpen className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900">Học tập cá nhân hóa</h3>
                    <p className="text-slate-600 leading-relaxed">Lộ trình học được thiết kế riêng dựa trên khả năng và mục tiêu của bạn, giúp việc học trở nên hiệu quả hơn.</p>
                  </CardContent>
                </Card>
                
                {/* Feature 2 */}
                <Card className="border-0 bg-gradient-to-br from-white to-purple-50/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-200/20 to-indigo-200/20 rounded-full -translate-y-12 translate-x-12 floating-orb"></div>
                  <CardContent className="p-8">
                    <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200/40 group-hover:scale-110 transition-transform duration-300 shimmer">
                      <Zap className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900">Phương pháp hiệu quả</h3>
                    <p className="text-slate-600 leading-relaxed">Kết hợp các kỹ thuật học tập tiên tiến như lặp lại ngắt quãng và học tập dựa trên trò chơi để tối ưu hóa việc ghi nhớ.</p>
                  </CardContent>
                </Card>
                
                {/* Feature 3 */}
                <Card className="border-0 bg-gradient-to-br from-white to-emerald-50/30 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-emerald-200/20 to-teal-200/20 rounded-full -translate-y-12 translate-x-12 floating-orb"></div>
                  <CardContent className="p-8">
                    <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-200/40 group-hover:scale-110 transition-transform duration-300 shimmer">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900">Cộng đồng hỗ trợ</h3>
                    <p className="text-slate-600 leading-relaxed">Kết nối với cộng đồng người học tiếng Nhật để thực hành, trao đổi và nhận sự hỗ trợ từ giáo viên và bạn học.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="px-6 py-24 bg-gradient-to-r from-blue-50 to-cyan-50 border-t border-blue-100">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-100 floating-badge mb-6">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium text-emerald-700">Miễn phí để bắt đầu</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">Sẵn sàng bắt đầu hành trình học tiếng Nhật?</h2>
              <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto">
                Đăng ký ngay hôm nay để bắt đầu học tiếng Nhật với phương pháp hiệu quả và thú vị. Chỉ mất vài phút để tạo tài khoản.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register">
                  <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-lg shadow-blue-200/50 px-8 py-6 text-lg font-medium rounded-xl shimmer">
                    Bắt đầu ngay hôm nay
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </>
      )}
    </MainLayout>
  );
}
