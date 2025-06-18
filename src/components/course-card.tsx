import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, Star, BookOpen } from "lucide-react";

interface CourseCardProps {
  title: string;
  description: string;
  progress: number;
  level: string;
  duration: string;
  rating: number;
  isActive?: boolean;
}

export const CourseCard = ({ 
  title, 
  description, 
  progress, 
  level, 
  duration, 
  rating,
  isActive = false 
}: CourseCardProps) => {
  const getLevelColor = (level: string) => {
    switch(level) {
      case 'BEGINNER': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'INTERMEDIATE': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'ADVANCED': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getLevelGradient = (level: string) => {
    switch(level) {
      case 'BEGINNER': return 'from-cyan-400 to-blue-500';
      case 'INTERMEDIATE': return 'from-blue-500 to-indigo-500';
      case 'ADVANCED': return 'from-indigo-500 to-purple-500';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  const getProgressGradient = (level: string) => {
    switch(level) {
      case 'BEGINNER': return 'from-cyan-400 to-blue-500';
      case 'INTERMEDIATE': return 'from-blue-400 to-indigo-500';
      case 'ADVANCED': return 'from-indigo-400 to-purple-500';
      default: return 'from-slate-400 to-slate-500';
    }
  };

  return (
    <Card className={`group border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 transform hover:-translate-y-1 ${
      isActive ? 'ring-2 ring-blue-400 ring-offset-2' : ''
    } cursor-pointer overflow-hidden relative`}>
      {isActive && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-500 shimmer"></div>
      )}
      
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/10 to-blue-200/10 rounded-full translate-y-12 -translate-x-12 floating-orb-slow"></div>
      
      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2 text-slate-800 group-hover:text-blue-600 transition-colors duration-300">
              {title}
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed text-slate-600">
              {description}
            </CardDescription>
          </div>
          <Badge className={`ml-2 ${getLevelColor(level)} font-medium`}>
            {level}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 relative">
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <Clock className="w-4 h-4" />
            {duration}
          </div>
          <div className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <Star className="w-4 h-4 fill-current" />
            {rating}
          </div>
          <div className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <BookOpen className="w-4 h-4" />
            Tương tác
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Tiến độ</span>
            <span className="font-medium text-slate-700">{progress}% hoàn thành</span>
          </div>
          <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`absolute top-0 left-0 h-full bg-gradient-to-r ${getProgressGradient(level)} shimmer rounded-full`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <Button
          className={`w-full rounded-lg transition-all duration-300 shadow-sm ${
          isActive 
              ? `bg-gradient-to-r ${getLevelGradient(level)} text-white hover:shadow shimmer` 
              : `bg-white hover:bg-gradient-to-r hover:${getLevelGradient(level)} hover:text-white border border-slate-200 text-slate-700`
          }`}
        >
          <div className={`flex items-center justify-center ${isActive ? 'text-white' : ''}`}>
            <div className={`p-1 rounded-full ${isActive ? 'bg-white/20' : 'bg-blue-100'} mr-2`}>
              <Play className={`w-3 h-3 ${isActive ? 'text-white' : 'text-blue-600'}`} />
            </div>
            <span>{progress > 0 ? 'Tiếp tục học' : 'Bắt đầu ngay'}</span>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
}; 