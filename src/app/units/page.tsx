import { getUnits } from '../actions/unit';
import { getUserProgress } from '../actions/user';
import { MainLayout } from '@/components/layout/main-layout';
import { UnitGrid } from '@/components/units/unit-grid';
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Trophy, Target, CheckCircle, LucideBarChart2, Book } from 'lucide-react';

export default async function UnitsPage() {
  // Lấy danh sách units và tiến độ của user
  const [units, userProgress] = await Promise.all([
    getUnits(),
    getUserProgress(),
  ]);

  // Tính toán thống kê
  const completedUnits = userProgress?.unitProgress.filter(p => p.completed).length || 0;
  const inProgressUnits = userProgress?.unitProgress.filter(p => !p.completed).length || 0;
  const totalXp = userProgress?.totalXp || 0;
  const progressPercentage = units.length > 0 ? Math.round((completedUnits / units.length) * 100) : 0;

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4">
        {/* Banner Section */}
        <div className="mb-10 relative overflow-hidden">
          <div className="text-center mb-8 relative">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-3">
              Đơn vị học
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mb-3"></div>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Chọn một đơn vị học để bắt đầu hành trình khám phá tiếng Nhật của bạn
            </p>
          </div>
        </div>
        
        {/* Thống kê tiến độ */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 shimmer">
              <LucideBarChart2 className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Tiến độ học tập</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 floating-card overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 shimmer">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-sm font-medium text-slate-700">Tiến độ tổng thể</div>
                </div>
                <div className="flex items-end justify-between mb-2">
                  <div className="text-3xl font-bold text-slate-800">{progressPercentage}%</div>
                  <div className="text-sm text-slate-500">{completedUnits}/{units.length}</div>
                </div>
                <Progress 
                  value={progressPercentage} 
                  max={100} 
                  className="h-3 bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-cyan-400 [&>div]:to-blue-400 wave-progress progress-wave relative"
                />
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 floating-card overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 shimmer">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-sm font-medium text-slate-700">Đơn vị đã hoàn thành</div>
                </div>
                <div className="text-3xl font-bold text-blue-700">{completedUnits}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {completedUnits > 0 
                    ? `Bạn đã hoàn thành ${Math.round((completedUnits / units.length) * 100)}% đơn vị` 
                    : 'Hãy hoàn thành đơn vị đầu tiên của bạn'}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 floating-card overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-yellow-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 shimmer">
                    <Book className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-sm font-medium text-slate-700">Đơn vị đang học</div>
                </div>
                <div className="text-3xl font-bold text-amber-700">{inProgressUnits}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {inProgressUnits > 0 
                    ? `Bạn đang học ${inProgressUnits} đơn vị` 
                    : 'Bạn chưa bắt đầu đơn vị nào'}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 floating-card overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
              <CardContent className="p-6 relative">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 shimmer">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-sm font-medium text-slate-700">Điểm XP</div>
                </div>
                <div className="text-3xl font-bold text-emerald-700">{totalXp}</div>
                <div className="mt-1 text-sm text-slate-500">
                  {totalXp > 0 
                    ? 'Tiếp tục tích lũy điểm XP!' 
                    : 'Bắt đầu học để tích lũy điểm XP'}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Danh sách đơn vị */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 shimmer">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Danh sách đơn vị</h2>
          </div>
          
          <div className="relative">
            <UnitGrid units={units} userProgress={userProgress || undefined} />
            
            {units.length === 0 && (
              <Card className="border-0 bg-gradient-to-br from-white to-indigo-50/50 shadow-lg shadow-slate-100/50 overflow-hidden text-center p-8">
                <div className="p-6 rounded-full bg-indigo-50 inline-flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-indigo-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Chưa có đơn vị học</h3>
                <p className="text-slate-600 max-w-md mx-auto">Chưa có đơn vị học nào. Vui lòng quay lại sau.</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 