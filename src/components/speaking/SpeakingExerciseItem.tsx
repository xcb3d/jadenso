import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mic, Volume2 } from 'lucide-react';
import { SpeakingExercise } from '@/models/SpeakingExercise';

interface SpeakingExerciseItemProps {
  exercise: SpeakingExercise;
}

export function SpeakingExerciseItem({ exercise }: SpeakingExerciseItemProps) {
  const difficultyColors = {
    beginner: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    intermediate: 'bg-amber-100 text-amber-800 border-amber-200',
    advanced: 'bg-red-100 text-red-800 border-red-200',
  };

  const difficultyColor = difficultyColors[exercise.difficulty] || difficultyColors.beginner;
  const isCustom = exercise.isCustom;

  return (
    <Card className={`overflow-hidden bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${isCustom ? 'border-l-4 border-l-blue-500' : ''}`}>
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Badge className={`${difficultyColor} font-medium`}>
                {exercise.difficulty === 'beginner' && 'Sơ cấp'}
                {exercise.difficulty === 'intermediate' && 'Trung cấp'}
                {exercise.difficulty === 'advanced' && 'Nâng cao'}
              </Badge>
              
              {isCustom && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Tự tạo
                </Badge>
              )}
            </div>
            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
              {exercise.category}
            </Badge>
          </div>
          
          <div className="mb-4">
            <p className="text-2xl font-bold text-slate-900 mb-2">{exercise.text}</p>
            <p className="text-slate-600">{exercise.translation}</p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-x-2">
              {exercise.audioUrl && (
                <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                  <Volume2 className="h-4 w-4 mr-1" />
                  Nghe mẫu
                </Button>
              )}
            </div>
            
            <Link href={`/speaking/${exercise._id}`} passHref>
              <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                <Mic className="h-4 w-4 mr-1" />
                Luyện tập
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 