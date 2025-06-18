import React from 'react';
import Link from 'next/link';
import { Card, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Unit } from '@/models/Unit';
import { UnitProgress, LessonProgress } from '@/models/UserProgress';
import { BookOpen, CheckCircle, Clock, Play, Star } from 'lucide-react';
import { Button } from '../ui/button';

interface UnitCardProps {
  unit: Unit;
  progress?: UnitProgress;
  isLocked?: boolean;
  lessonProgress?: LessonProgress[];
}

export function UnitCard({ 
  unit, 
  progress, 
  isLocked = false, 
  lessonProgress = [] 
}: UnitCardProps) {
  // Tính toán tiến độ dựa trên số bài học đã hoàn thành
  const calculateProgressPercent = (): number => {
    if (!unit.lessons || unit.lessons.length === 0) return 0;
    if (progress?.completed) return 100;
    
    // Đếm số bài học đã hoàn thành
    const completedLessons = lessonProgress?.filter(
      lp => unit.lessons.some(id => id.toString() === lp.lessonId.toString()) && 
           lp.status === 'completed'
    ).length || 0;
    
    return Math.round((completedLessons / unit.lessons.length) * 100);
  };

  const progressValue = calculateProgressPercent();
  
  // Xác định màu gradient dựa trên difficulty
  const getGradientColors = () => {
    switch(unit.difficulty.toLowerCase()) {
      case 'beginner':
        return 'from-cyan-400 via-blue-500 to-indigo-600';
      case 'intermediate':
        return 'from-indigo-400 via-purple-500 to-violet-600';
      case 'advanced':
        return 'from-amber-400 via-orange-500 to-red-600';
      default:
        return 'from-blue-400 via-cyan-500 to-teal-600';
    }
  };

  // Xác định màu badge dựa trên difficulty
  const getBadgeColors = () => {
    switch(unit.difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-white/90 text-cyan-700';
      case 'intermediate':
        return 'bg-white/90 text-indigo-700';
      case 'advanced':
        return 'bg-white/90 text-amber-700';
      default:
        return 'bg-white/90 text-blue-700';
    }
  };

  // Xác định màu progress bar dựa trên difficulty
  const getProgressColors = () => {
    switch(unit.difficulty.toLowerCase()) {
      case 'beginner':
        return 'from-cyan-400 to-blue-500';
      case 'intermediate':
        return 'from-indigo-400 to-purple-500';
      case 'advanced':
        return 'from-amber-400 to-orange-500';
      default:
        return 'from-blue-400 to-teal-500';
    }
  };

  // Xác định màu button dựa trên difficulty và trạng thái
  const getButtonColors = () => {
    if (isLocked) return 'bg-slate-300 text-slate-600 cursor-not-allowed';
    
    switch(unit.difficulty.toLowerCase()) {
      case 'beginner':
        return progressValue > 0 
          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-blue-200/50 shimmer' 
          : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-md shadow-indigo-200/50 shimmer';
      case 'intermediate':
        return progressValue > 0 
          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md shadow-purple-200/50 shimmer' 
          : 'bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white shadow-md shadow-violet-200/50 shimmer';
      case 'advanced':
        return progressValue > 0 
          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-orange-200/50 shimmer' 
          : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md shadow-red-200/50 shimmer';
      default:
        return progressValue > 0 
          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-blue-200/50 shimmer' 
          : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md shadow-teal-200/50 shimmer';
    }
  };
  
  return (
    <Link href={isLocked ? "#" : `/units/${unit._id}`} className={`block ${isLocked ? 'pointer-events-none' : ''}`}>
      <Card className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 floating-card-slow h-full relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/10 to-blue-200/10 rounded-full translate-y-12 -translate-x-12 floating-orb-slow"></div>
        
        <div className="flex flex-col h-full">
          {/* Unit Image with Gradient Background */}
          <div className="relative h-48 w-full overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${getGradientColors()} flowing-bg`}></div>
            <div className="absolute inset-0 bg-black/10"></div>
            
            {/* Badge */}
            <div className="absolute top-4 left-4">
              <Badge className={`${getBadgeColors()} border-0 font-semibold floating-badge`}>
                {unit.difficulty.toUpperCase()}
              </Badge>
            </div>
            
            {/* Character */}
            <div className="absolute bottom-4 right-4 text-white/80">
              <div className="text-6xl font-bold opacity-20 floating-text character-bounce">
                {unit.difficulty.toLowerCase() === 'beginner' ? 'あ' : 
                 unit.difficulty.toLowerCase() === 'intermediate' ? 'ひ' : '漢'}
              </div>
            </div>
            
            {/* Additional floating character */}
            <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2 -translate-x-1/2">
              <div className="text-4xl font-bold text-white/30 floating-text-reverse">
                {unit.difficulty.toLowerCase() === 'beginner' ? 'ひ' : 
                 unit.difficulty.toLowerCase() === 'intermediate' ? '漢' : 'あ'}
              </div>
            </div>
            
            {/* Locked Overlay */}
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-white/20 p-3 rounded-full">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col flex-grow p-5 relative">
            <div className="flex-grow">
              {/* Title and Description */}
              <div className="mb-4">
                <CardTitle className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
                  {unit.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-slate-600">
                  {unit.description}
                </CardDescription>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-slate-700">Tiến độ</div>
                  <div className="text-sm font-medium text-slate-700">{progressValue}%</div>
                </div>
                <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getProgressColors()} shimmer rounded-full`}
                    style={{ width: `${progressValue}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Footer with Stats and Button */}
            <div className="mt-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <BookOpen className="h-4 w-4" />
                  <span>{unit.lessons.length} bài học</span>
                </div>
                {progress?.completed ? (
                  <div className="flex items-center gap-1 text-sm text-emerald-600">
                    <div className="p-1 rounded-full bg-emerald-100">
                      <CheckCircle className="h-3 w-3" />
                    </div>
                    <span>Hoàn thành</span>
                  </div>
                ) : progressValue > 0 ? (
                  <div className="flex items-center gap-1 text-sm text-amber-600">
                    <div className="p-1 rounded-full bg-amber-100">
                      <Clock className="h-3 w-3" />
                    </div>
                    <span>Đang học</span>
                  </div>
                ) : null}
              </div>
              
              <Button 
                className={`w-full rounded-lg transition-all ${getButtonColors()}`}
                disabled={isLocked}
              >
                {isLocked ? (
                  <span>Khóa</span>
                ) : progressValue > 0 ? (
                  <div className="flex items-center justify-center">
                    <div className="p-1 rounded-full bg-white/20 mr-2">
                      <Play className="h-3 w-3" />
                    </div>
                    <span>Tiếp tục học</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <div className="p-1 rounded-full bg-white/20 mr-2">
                      <Star className="h-3 w-3" />
                    </div>
                    <span>Bắt đầu học</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
} 