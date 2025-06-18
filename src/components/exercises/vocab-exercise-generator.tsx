'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useRouter } from 'next/navigation';
import { BookOpen, Loader2, CheckCircle2, AlertCircle, Sparkles, Target } from 'lucide-react';
import { Badge } from '../ui/badge';

const MAX_QUESTIONS = 30;

// Define proficiency levels
const PROFICIENCY_LEVELS = {
  beginner: 'Tập sự (N5)',
  elementary: 'Sơ cấp (N4)',
  intermediate: 'Trung cấp (N3)',
  advanced: 'Nâng cao (N2)',
  expert: 'Chuyên gia (N1)',
};

// Define proficiency level colors
const PROFICIENCY_COLORS = {
  beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  elementary: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
  advanced: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  expert: 'bg-purple-100 text-purple-700 border-purple-200',
};

type ProficiencyLevel = keyof typeof PROFICIENCY_LEVELS;

export default function VocabExerciseGenerator() {
  const [vocabulary, setVocabulary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [exerciseCount, setExerciseCount] = useState<number>(0);
  const [questionLimit, setQuestionLimit] = useState<number>(10);
  const [proficiencyLevel, setProficiencyLevel] = useState<ProficiencyLevel>('intermediate');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const router = useRouter();

  // Load settings from localStorage on component mount
  React.useEffect(() => {
    const savedQuestionLimit = localStorage.getItem('question_limit');
    if (savedQuestionLimit) {
      setQuestionLimit(parseInt(savedQuestionLimit, 10));
    }
    
    const savedProficiencyLevel = localStorage.getItem('proficiency_level');
    if (savedProficiencyLevel && Object.keys(PROFICIENCY_LEVELS).includes(savedProficiencyLevel)) {
      setProficiencyLevel(savedProficiencyLevel as ProficiencyLevel);
    }
  }, []);
  
  const handleQuestionLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const limitedValue = Math.min(Math.max(1, value), MAX_QUESTIONS);
    setQuestionLimit(limitedValue);
    localStorage.setItem('question_limit', limitedValue.toString());
  };
  
  const handleProficiencyChange = (value: ProficiencyLevel) => {
    setProficiencyLevel(value);
    localStorage.setItem('proficiency_level', value);
  };

  const goToPractice = () => {
    if (sessionId) {
      router.push(`/exercises/sessions/${sessionId}`);
    }
  };

  const generateExercises = async () => {
    if (!vocabulary.trim()) {
      setError('Vui lòng nhập một số từ vựng');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSessionId(null);

    try {
      // Call our server-side API route
      const response = await fetch('/api/generate-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionLimit,
          vocabulary: vocabulary.trim(),
          proficiencyLevel
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Không thể tạo bài tập');
      }

      // Set the session ID for redirecting to practice
      setSessionId(data.sessionId);
      setExerciseCount(data.exerciseCount);
      setSuccess(true);
      
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 floating-card overflow-hidden">
      <CardHeader className="pb-4 relative border-b border-slate-100">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 shimmer">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          Tạo bài tập từ vựng
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6 relative">
        <div className="space-y-3">
          <Label htmlFor="questionLimit" className="text-slate-700 font-medium">Số lượng câu hỏi (Tối đa: {MAX_QUESTIONS})</Label>
          <div className="flex items-center space-x-4">
            <Input 
              id="questionLimit"
              type="number"
              min="1"
              max={MAX_QUESTIONS}
              value={questionLimit}
              onChange={handleQuestionLimitChange}
              className="border-slate-200 focus:border-cyan-300 focus:ring-cyan-200"
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <Label className="text-slate-700 font-medium">Cấp độ thành thạo</Label>
          <RadioGroup 
            value={proficiencyLevel} 
            onValueChange={(value) => handleProficiencyChange(value as ProficiencyLevel)}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {Object.entries(PROFICIENCY_LEVELS).map(([key, label]) => (
              <div 
                key={key} 
                className={`flex items-center space-x-2 p-3 rounded-lg border transition-all ${
                  proficiencyLevel === key 
                    ? 'bg-gradient-to-r from-slate-50 to-blue-50/30 border-cyan-200' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <RadioGroupItem value={key} id={`proficiency-${key}`} />
                <div className="flex items-center justify-between flex-1">
                  <Label htmlFor={`proficiency-${key}`} className="cursor-pointer font-medium">
                    {label}
                  </Label>
                  <Badge className={PROFICIENCY_COLORS[key as ProficiencyLevel]}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="vocabulary" className="text-slate-700 font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-cyan-600" />
            Nhập từ vựng
          </Label>
          <Textarea 
            id="vocabulary"
            placeholder="Nhập các từ vựng, mỗi từ một dòng" 
            value={vocabulary} 
            onChange={(e) => setVocabulary(e.target.value)} 
            rows={10}
            className="border-slate-200 focus:border-cyan-300 focus:ring-cyan-200 resize-none"
          />
          <p className="text-sm text-slate-500">
            Mỗi dòng một từ vựng. Bạn có thể nhập từ vựng bằng tiếng Nhật hoặc tiếng Việt.
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>Đã tạo thành công {exerciseCount} bài tập!</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 px-6">
        <Button 
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/50 shimmer"
          onClick={generateExercises} 
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang tạo...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Tạo bài tập</span>
            </div>
          )}
        </Button>
        
        {sessionId && (
          <Button 
            className="w-full border-cyan-200 text-cyan-700 hover:bg-cyan-50 hover:text-cyan-800 transition-colors"
            variant="outline" 
            onClick={goToPractice}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Luyện tập ngay</span>
            </div>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 