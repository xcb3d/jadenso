import React from 'react';
import Link from 'next/link';
import { Lesson } from '@/models/Lesson';
import { LessonProgress } from '@/models/UserProgress';
import { CheckCircle, Lock, Play, Clock, BookOpen } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface LessonCardProps {
  lesson: Lesson;
  progress?: LessonProgress;
  isLocked?: boolean;
}

export function LessonCard({ lesson, progress, isLocked = false }: LessonCardProps) {
  // Get lesson estimated time
  const getLessonTime = () => {
    switch (lesson.difficulty) {
      case 'beginner':
        return '15-20';
      case 'intermediate':
        return '20-30';
      case 'advanced':
        return '30-45';
      default:
        return '15-20';
    }
  };

  // Get lesson completion status
  const isCompleted = progress?.status === 'completed';
  const isInProgress = progress?.status === 'in_progress';
  
  // Get the current progress count for the lesson
  const getProgressPercent = () => {
    if (!progress) return 0;
    if (isCompleted) return 100;
    return Math.min(Math.ceil((progress.score || 0) / 10) * 10, 90);
  };
  
  // Get badge colors based on difficulty
  const getBadgeColors = () => {
    switch(lesson.difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-blue-50 text-blue-700';
      case 'intermediate':
        return 'bg-indigo-50 text-indigo-700';
      case 'advanced':
        return 'bg-amber-50 text-amber-700';
      default:
        return 'bg-blue-50 text-blue-700';
    }
  };
  
  // Get button gradient based on status
  const getButtonGradient = () => {
    if (isCompleted) return 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600';
    return 'bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600';
  };
  
  // Get primary skill
  const getPrimarySkill = () => {
    return lesson.skills && lesson.skills.length > 0 ? lesson.skills[0] : 'general';
  };
  
  return (
    <div className="relative pl-10 mb-6">
      {/* Dot indicator on timeline */}
      <div className={`absolute left-0 top-8 w-4 h-4 rounded-full z-10 border-2 border-white shadow-md ${
        isCompleted 
          ? 'bg-gradient-to-r from-emerald-400 to-teal-500 pulse-glow' 
          : isInProgress 
            ? 'bg-gradient-to-r from-blue-400 to-indigo-500 pulse-glow' 
            : isLocked 
              ? 'bg-slate-300' 
              : 'bg-gradient-to-r from-blue-400 to-indigo-500'
      }`}>
        {isCompleted && (
          <span className="absolute inset-0 flex items-center justify-center">
            <CheckCircle className="h-2 w-2 text-white" />
          </span>
        )}
      </div>
      
      <Link href={isLocked ? "#" : `/lessons/${lesson._id}`} className={`block ${isLocked ? 'pointer-events-none' : ''}`}>
        <div className={`group relative overflow-hidden rounded-xl border border-slate-100 
          hover:shadow-md shadow-sm transition-all duration-300 ${isLocked ? 'opacity-70' : ''}`}>
          
          <div className="flex items-center gap-4 p-5 bg-white">
            <div className="flex-shrink-0">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg shadow-sm relative overflow-hidden ${
            isCompleted 
                  ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shimmer' 
              : isInProgress 
                    ? 'bg-gradient-to-br from-blue-400 to-indigo-500 shimmer' 
                : isLocked 
                      ? 'bg-gradient-to-br from-slate-300 to-slate-400' 
                      : 'bg-gradient-to-br from-blue-400 to-indigo-500 shimmer'
              }`}>
                <div className="relative z-10">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isLocked ? (
                    <Lock className="w-5 h-5" />
                  ) : (
                    <span>{lesson.order}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-slate-800 text-lg">{lesson.title}</h3>
                <Badge className={`${getBadgeColors()} text-xs font-medium`}>
                    {lesson.difficulty.toUpperCase()}
                  </Badge>
                </div>
                
              <p className="text-slate-600">{lesson.description}</p>
                
                {!isLocked && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1.5 text-slate-400" />
                      {getLessonTime()} phút
                    </span>
                    <span className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1.5 text-slate-400" />
                      {getPrimarySkill()}
                    </span>
                  </div>
                  
                  {(isCompleted || isInProgress) && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-700 font-medium">Tiến độ</span>
                        <span className="text-slate-700 font-medium">{getProgressPercent()}%</span>
                      </div>
                      <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            isCompleted 
                              ? 'bg-gradient-to-r from-emerald-400 to-teal-500 wave-progress'
                              : 'bg-gradient-to-r from-blue-400 to-indigo-500 wave-progress'
                          } rounded-full`}
                          style={{ width: `${getProgressPercent()}%` }}
                        ></div>
                    </div>
                    </div>
                  )}
                </div>
              )}
              </div>
              
            <div className="flex-shrink-0">
              {isCompleted ? (
                <Badge className="bg-emerald-50 text-emerald-700 px-3 py-1.5">
                  <Link href={`/lessons/${lesson._id}`} className="flex items-center">
                    <BookOpen className="w-3 h-3 mr-1.5" />
                    Học lại
                  </Link>
                </Badge>
              ) : isInProgress ? (
                <Button size="sm" className={`${getButtonGradient()} text-white font-medium shadow-sm`}>
                  <Play className="w-3 h-3 mr-1.5" />
                  Tiếp tục
                </Button>
              ) : !isLocked ? (
                <Button size="sm" className={`${getButtonGradient()} text-white font-medium shadow-sm`}>
                  <Play className="w-3 h-3 mr-1.5" />
                  Bắt đầu
                </Button>
              ) : (
                <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center">
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
} 