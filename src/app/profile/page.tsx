import { redirect } from 'next/navigation';
import { getCurrentUser, getUserProgress } from '../actions/user';
import { MainLayout } from '@/components/layout/main-layout';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Trophy, Zap, BookOpen, Target, Headphones, BookOpen as BookIcon, Award, Star } from 'lucide-react';

export default async function ProfilePage() {
  // Lấy thông tin người dùng và tiến độ học tập
  const [user, userProgress] = await Promise.all([
    getCurrentUser(),
    getUserProgress(),
  ]);

  // Nếu chưa đăng nhập, chuyển hướng đến trang chủ
  if (!user) {
    redirect('/');
  }

  // Tính toán các thống kê học tập
  const completedUnits = userProgress?.unitProgress.filter(p => p.completed).length || 0;
  const completedLessons = userProgress?.lessonProgress.filter(p => p.status === 'completed').length || 0;
  const totalXp = userProgress?.totalXp || 0;
  const streak = user.stats.streak || 0;

  // Tính tiến độ học tập hôm nay
  const dailyGoal = userProgress?.dailyGoal || 100;
  const dailyProgress = userProgress?.dailyProgress || 0;
  const dailyProgressPercent = Math.min(Math.round((dailyProgress / dailyGoal) * 100), 100);

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-3">
            Hồ sơ người dùng
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mb-3"></div>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Theo dõi hành trình học tiếng Nhật và các thành tích của bạn
          </p>
        </div>

        {/* Thông tin cá nhân */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="md:w-1/3">
            <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 floating-card overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
              <CardContent className="p-8 text-center relative">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-500 blur-md opacity-60 pulse-glow"></div>
                  <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.displayName || user.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 text-white text-3xl font-bold">
                        {(user.displayName || user.username).substring(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-1">{user.displayName || user.username}</h2>
                <p className="text-slate-500 mb-4">{user.email}</p>
                
                <div className="flex justify-center items-center gap-2 mb-2">
                  <div className="flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm">
                    <Trophy className="w-4 h-4 mr-1 text-amber-500" />
                    <span>Người học</span>
                  </div>
                </div>
                
                <div className="flex justify-center mt-4">
                  <div className="inline-flex gap-1">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < 3 ? "fill-cyan-400 text-cyan-400 twinkle" : "text-cyan-200"
                          }`}
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-2/3">
            <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-slate-800">
                  Thông tin học tập
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 shimmer">
                        <Zap className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-sm font-medium text-emerald-800">Streak</p>
                    </div>
                    <p className="text-2xl font-bold text-emerald-900">{streak} ngày</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 shimmer">
                        <Trophy className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-sm font-medium text-blue-800">XP</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{totalXp}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500 shimmer">
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-sm font-medium text-purple-800">Đơn vị</p>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">{completedUnits}</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-cyan-50 to-sky-50 p-4 rounded-xl border border-cyan-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 shimmer">
                        <BookIcon className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-sm font-medium text-cyan-800">Bài học</p>
                    </div>
                    <p className="text-2xl font-bold text-cyan-900">{completedLessons}</p>
                  </div>
                </div>
                
                {/* Tiến độ hôm nay */}
                <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 shimmer">
                        <Target className="h-4 w-4 text-white" />
                      </div>
                      <p className="font-medium text-slate-800">Mục tiêu hàng ngày</p>
                    </div>
                    <p className="text-sm font-medium bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                      {dailyProgress}/{dailyGoal} XP
                    </p>
                  </div>
                  <Progress 
                    value={dailyProgressPercent} 
                    max={100} 
                    className="h-3 bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-amber-400 [&>div]:to-orange-400 wave-progress progress-wave relative"
                  />
                  <div className="mt-2 text-xs text-right text-slate-500">
                    {dailyProgressPercent >= 100 ? '🎉 Đã hoàn thành mục tiêu hôm nay!' : `${100 - dailyProgressPercent}% nữa để hoàn thành`}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Thành tích gần đây */}
        <div className="mb-10">
          <div className="flex items-center mb-6">
            <div className="p-2 mr-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 shimmer">
              <Award className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Thành tích gần đây</h2>
          </div>

          {userProgress && userProgress.lessonProgress.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {userProgress.lessonProgress
                .filter(progress => progress.status === 'completed')
                .slice(0, 6)
                .map((progress, index) => (
                  <Card 
                    key={progress.lessonId.toString()} 
                    className="border-0 bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/10 to-orange-200/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700"></div>
                    <CardContent className="p-5 relative">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold shadow-md">
                          {index + 1}
                        </div>
                        <div>
                          <CardTitle className="text-base mb-0.5">Bài học hoàn thành</CardTitle>
                          <div className="text-xs text-slate-500">
                            ID: {progress.lessonId.toString().substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                          Điểm: {progress.score}
                        </div>
                        {progress.completedAt && (
                          <div className="text-xs text-slate-500">
                            {new Date(progress.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 overflow-hidden text-center p-8">
              <div className="p-6 rounded-full bg-slate-50 inline-flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Chưa có thành tích</h3>
              <p className="text-slate-500 max-w-md mx-auto">Hoàn thành các bài học để mở khóa thành tích đầu tiên của bạn.</p>
            </Card>
          )}
        </div>

        {/* Kỹ năng */}
        <div>
          <div className="flex items-center mb-6">
            <div className="p-2 mr-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 shimmer">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Kỹ năng</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Card className="border-0 bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 shimmer">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base">Từ vựng</CardTitle>
                </div>
                <Progress 
                  value={70} 
                  max={100} 
                  className="h-3 bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-teal-400 wave-progress progress-wave relative"
                />
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>Cơ bản</span>
                  <span>Nâng cao</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 shimmer">
                    <BookIcon className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base">Ngữ pháp</CardTitle>
                </div>
                <Progress 
                  value={50} 
                  max={100} 
                  className="h-3 bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-blue-400 [&>div]:to-indigo-400 wave-progress progress-wave relative"
                />
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>Cơ bản</span>
                  <span>Nâng cao</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500 shimmer">
                    <Headphones className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base">Nghe</CardTitle>
                </div>
                <Progress 
                  value={30} 
                  max={100} 
                  className="h-3 bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-purple-400 [&>div]:to-violet-400 wave-progress progress-wave relative"
                />
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>Cơ bản</span>
                  <span>Nâng cao</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-500 shimmer">
                    <BookIcon className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-base">Đọc</CardTitle>
                </div>
                <Progress 
                  value={45} 
                  max={100} 
                  className="h-3 bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-cyan-400 [&>div]:to-sky-400 wave-progress progress-wave relative"
                />
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                  <span>Cơ bản</span>
                  <span>Nâng cao</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 