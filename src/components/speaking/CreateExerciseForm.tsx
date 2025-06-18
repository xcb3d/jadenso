'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Plus, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

export function CreateExerciseForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    text: '',
    translation: '',
    difficulty: 'beginner',
    category: 'Custom',
    tags: ''
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle radio button changes for difficulty
  const handleDifficultyChange = (value: string) => {
    setFormData(prev => ({ ...prev, difficulty: value }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Convert tags string to array
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      // Send data to API
      const response = await fetch('/api/speaking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo bài tập');
      }

      // Show success message
      toast({
        title: 'Thành công',
        description: 'Bài tập phát âm đã được tạo thành công',
      });

      // Redirect to the speaking exercises page or the new exercise
      router.push('/speaking');
      router.refresh();
    } catch (error) {
      console.error('Error creating speaking exercise:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể tạo bài tập phát âm',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-blue-100 bg-white shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-900">Tạo bài tập phát âm mới</CardTitle>
        <CardDescription className="text-slate-600">
          Tạo bài tập phát âm riêng để thực hành những câu bạn muốn học
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Japanese text */}
          <div className="space-y-2">
            <Label htmlFor="text" className="text-slate-700">Văn bản tiếng Nhật <span className="text-red-500">*</span></Label>
            <Textarea 
              id="text"
              name="text"
              placeholder="Nhập văn bản tiếng Nhật cần luyện phát âm" 
              value={formData.text}
              onChange={handleChange}
              required
              className="resize-none h-24 border-slate-200 focus:border-blue-300"
            />
          </div>
          
          {/* Vietnamese translation */}
          <div className="space-y-2">
            <Label htmlFor="translation" className="text-slate-700">Bản dịch tiếng Việt <span className="text-red-500">*</span></Label>
            <Textarea 
              id="translation"
              name="translation"
              placeholder="Nhập bản dịch tiếng Việt" 
              value={formData.translation}
              onChange={handleChange}
              required
              className="resize-none h-24 border-slate-200 focus:border-blue-300"
            />
          </div>

          {/* Difficulty level */}
          <div className="space-y-2">
            <Label className="text-slate-700">Độ khó <span className="text-red-500">*</span></Label>
            <RadioGroup 
              value={formData.difficulty} 
              onValueChange={handleDifficultyChange}
              className="flex flex-wrap gap-4 pt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id="beginner" />
                <Label htmlFor="beginner" className="font-normal cursor-pointer flex items-center gap-2">
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-medium">
                    Sơ cấp
                  </Badge>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id="intermediate" />
                <Label htmlFor="intermediate" className="font-normal cursor-pointer flex items-center gap-2">
                  <Badge className="bg-amber-100 text-amber-800 border-amber-200 font-medium">
                    Trung cấp
                  </Badge>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id="advanced" />
                <Label htmlFor="advanced" className="font-normal cursor-pointer flex items-center gap-2">
                  <Badge className="bg-red-100 text-red-800 border-red-200 font-medium">
                    Nâng cao
                  </Badge>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-slate-700">Danh mục</Label>
            <Input 
              id="category"
              name="category"
              placeholder="Ví dụ: Giao tiếp, Học thuật, v.v." 
              value={formData.category}
              onChange={handleChange}
              className="border-slate-200 focus:border-blue-300"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-slate-700">Từ khóa (phân tách bằng dấu phẩy)</Label>
            <Input 
              id="tags"
              name="tags"
              placeholder="Ví dụ: giao tiếp, mua sắm, du lịch" 
              value={formData.tags}
              onChange={handleChange}
              className="border-slate-200 focus:border-blue-300"
            />
          </div>
        </CardContent>
        <CardFooter className="border-t border-slate-100 bg-slate-50 flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            className="border-slate-300 text-slate-600"
          >
            Hủy
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu bài tập
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 