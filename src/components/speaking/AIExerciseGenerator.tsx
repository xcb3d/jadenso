'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bot, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { SpeakingExercise } from '@/models/SpeakingExercise';
import { Slider } from '@/components/ui/slider';

interface AIExerciseGeneratorProps {
  onExercisesGenerated: (exercises: Partial<SpeakingExercise>[]) => void;
}

export function AIExerciseGenerator({ onExercisesGenerated }: AIExerciseGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    prompt: '',
    difficulty: 'beginner',
    quantity: 1
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle radio button changes for difficulty
  const handleDifficultyChange = (value: string) => {
    setFormData(prev => ({ ...prev, difficulty: value }));
  };

  // Handle quantity slider change
  const handleQuantityChange = (value: number[]) => {
    setFormData(prev => ({ ...prev, quantity: value[0] }));
  };

  // Generate exercises with AI
  const generateExercises = async () => {
    if (!formData.prompt.trim()) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng nhập yêu cầu để AI tạo bài tập',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/speaking/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo bài tập');
      }

      toast({
        title: 'Thành công',
        description: `Đã tạo ${data.exercises.length} bài tập phát âm`,
      });

      // Call parent component callback with generated exercises
      onExercisesGenerated(data.exercises);
    } catch (error) {
      console.error('Error generating exercises:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể tạo bài tập phát âm',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
      <CardHeader className="border-b border-indigo-100/50 bg-white/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-700">
            <Bot size={18} />
          </div>
          <CardTitle className="text-xl text-indigo-900">
            Tạo bài tập phát âm bằng AI
          </CardTitle>
        </div>
        <CardDescription className="text-indigo-700/70">
          Mô tả điều bạn muốn luyện tập và AI sẽ tạo bài tập phát âm phù hợp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Prompt input */}
        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-indigo-900">
            Yêu cầu của bạn <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="prompt"
              name="prompt"
              placeholder="Ví dụ: Tạo bài tập về chào hỏi hàng ngày, câu hỏi khi đi du lịch..."
              value={formData.prompt}
              onChange={handleChange}
              className="pr-9 border-indigo-200 focus-visible:ring-indigo-500"
            />
            <Sparkles
              className="absolute right-2.5 top-2.5 h-4 w-4 text-indigo-400"
              aria-hidden="true"
            />
          </div>
          <p className="text-xs text-indigo-600/70">
            Mô tả càng chi tiết, bài tập càng phù hợp với nhu cầu của bạn
          </p>
        </div>

        {/* Difficulty level */}
        <div className="space-y-2">
          <Label className="text-indigo-900">Độ khó <span className="text-red-500">*</span></Label>
          <RadioGroup 
            value={formData.difficulty} 
            onValueChange={handleDifficultyChange}
            className="flex flex-wrap gap-4 pt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="beginner" id="ai-beginner" className="text-emerald-600" />
              <Label htmlFor="ai-beginner" className="font-normal cursor-pointer flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-medium">
                  Sơ cấp
                </Badge>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="intermediate" id="ai-intermediate" className="text-amber-600" />
              <Label htmlFor="ai-intermediate" className="font-normal cursor-pointer flex items-center gap-2">
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-medium">
                  Trung cấp
                </Badge>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="advanced" id="ai-advanced" className="text-red-600" />
              <Label htmlFor="ai-advanced" className="font-normal cursor-pointer flex items-center gap-2">
                <Badge className="bg-red-100 text-red-800 border-red-200 font-medium">
                  Nâng cao
                </Badge>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Quantity slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-indigo-900">Số lượng bài tập</Label>
            <Badge className="bg-indigo-100 text-indigo-800 border-0">
              {formData.quantity}
            </Badge>
          </div>
          <Slider
            defaultValue={[1]} 
            max={5}
            min={1}
            step={1}
            value={[formData.quantity]}
            onValueChange={handleQuantityChange}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-indigo-600/70">
            <span>Ít</span>
            <span>Nhiều</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-indigo-100/50 bg-white/50 flex justify-end">
        <Button
          onClick={generateExercises}
          disabled={loading || !formData.prompt.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Tạo với AI
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 