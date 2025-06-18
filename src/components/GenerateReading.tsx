'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { JapaneseWord } from '@/data/reading-data';
import { Loader2, Sparkles, BookOpen, Target, AlertCircle, CheckCircle2, Lightbulb, Wand2 } from 'lucide-react';
import JapaneseReader from '@/components/JapaneseReader';
import { sampleVocabularyN5, sampleVocabularyN4, sampleVocabularyN3, samplePrompts } from '@/data/sample-reading-vocab';
import { decrypt } from '@/lib/encryption';
import { Badge } from '@/components/ui/badge';

interface GenerateReadingProps {
  onReadingGenerated?: (readingId: string) => void;
}

// Define proficiency level colors
const PROFICIENCY_COLORS = {
  beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  elementary: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  intermediate: 'bg-blue-100 text-blue-700 border-blue-200',
  advanced: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  expert: 'bg-purple-100 text-purple-700 border-purple-200',
};

export function GenerateReading({ onReadingGenerated }: GenerateReadingProps) {
  const [vocabulary, setVocabulary] = useState<string>('');
  const [proficiencyLevel, setProficiencyLevel] = useState<string>('intermediate');
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [readingContent, setReadingContent] = useState<JapaneseWord[] | null>(null);
  const [readingTitle, setReadingTitle] = useState<string>('');
  
  const handleUseSampleVocabulary = () => {
    switch (proficiencyLevel) {
      case 'beginner':
        setVocabulary(sampleVocabularyN5);
        break;
      case 'elementary':
        setVocabulary(sampleVocabularyN4);
        break;
      default:
        setVocabulary(sampleVocabularyN3);
        break;
    }
  };
  
  const handleUseSamplePrompt = () => {
    const randomIndex = Math.floor(Math.random() * samplePrompts.length);
    setPrompt(samplePrompts[randomIndex]);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!vocabulary.trim()) {
      setError('Vui lòng nhập từ vựng');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setReadingContent(null);
      
      const response = await fetch('/api/readings/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vocabulary,
          proficiencyLevel,
          prompt,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo bài đọc');
      }
      
      if (data.success && data.data && data.key) {
        // Giải mã dữ liệu
        const decryptedData = decrypt(data.data, data.key) as {
          readingId: string;
          title: string;
          content: JapaneseWord[];
          grammarPoints: string[];
        };
        
        setReadingTitle(decryptedData.title || 'Bài đọc tiếng Nhật');
        setReadingContent(decryptedData.content);
        
        if (onReadingGenerated && decryptedData.readingId) {
          onReadingGenerated(decryptedData.readingId);
        }
      } else {
        throw new Error('Phản hồi từ máy chủ không hợp lệ');
      }
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tạo bài đọc';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getProficiencyLabel = (level: string): string => {
    const levels: Record<string, string> = {
      'beginner': 'Beginner (N5)',
      'elementary': 'Elementary (N4)',
      'intermediate': 'Intermediate (N3)',
      'advanced': 'Advanced (N2)',
      'expert': 'Expert (N1)',
    };
    return levels[level] || level;
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 floating-card overflow-hidden mb-8">
        <CardHeader className="pb-4 relative border-b border-slate-100">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 shimmer">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            Tạo bài đọc tiếng Nhật với AI
          </CardTitle>
          <CardDescription className="text-slate-600">
            Nhập từ vựng bạn muốn luyện tập và AI sẽ tạo bài đọc phù hợp
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 pt-6 relative">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label htmlFor="vocabulary" className="text-slate-700 font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-indigo-600" />
                  Từ vựng (mỗi từ một dòng)
                </label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={handleUseSampleVocabulary}
                  className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-colors"
                >
                  <Lightbulb className="mr-1 h-3 w-3" />
                  Dùng từ vựng mẫu
                </Button>
              </div>
              <Textarea
                id="vocabulary"
                value={vocabulary}
                onChange={(e) => setVocabulary(e.target.value)}
                placeholder="Nhập danh sách từ vựng, mỗi từ một dòng"
                className="min-h-32 border-slate-200 focus:border-indigo-300 focus:ring-indigo-200 resize-none"
              />
              <p className="text-sm text-slate-500">
                Mỗi dòng một từ vựng. Bạn có thể nhập từ vựng bằng tiếng Nhật hoặc tiếng Việt.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label htmlFor="proficiency" className="text-slate-700 font-medium">
                  Cấp độ
                </label>
                <Select 
                  value={proficiencyLevel} 
                  onValueChange={(val) => {
                    setProficiencyLevel(val);
                    if (vocabulary === sampleVocabularyN5 || 
                        vocabulary === sampleVocabularyN4 || 
                        vocabulary === sampleVocabularyN3) {
                      // Nếu đang dùng từ vựng mẫu, cập nhật theo cấp độ mới
                      switch (val) {
                        case 'beginner': setVocabulary(sampleVocabularyN5); break;
                        case 'elementary': setVocabulary(sampleVocabularyN4); break;
                        default: setVocabulary(sampleVocabularyN3); break;
                      }
                    }
                  }}
                >
                  <SelectTrigger id="proficiency" className="border-slate-200 focus:border-indigo-300 focus:ring-indigo-200">
                    <SelectValue placeholder="Chọn cấp độ" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(PROFICIENCY_COLORS).map((level) => (
                      <SelectItem key={level} value={level} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={PROFICIENCY_COLORS[level as keyof typeof PROFICIENCY_COLORS]}>
                            {level.charAt(0).toUpperCase()}
                          </Badge>
                          <span>{getProficiencyLabel(level)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label htmlFor="prompt" className="text-slate-700 font-medium">
                    Chủ đề (tùy chọn)
                  </label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={handleUseSamplePrompt}
                    className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-colors"
                  >
                    <Wand2 className="mr-1 h-3 w-3" />
                    Gợi ý ngẫu nhiên
                  </Button>
                </div>
                <Input
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Nhập chủ đề bạn muốn tạo bài đọc"
                  className="border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
                />
                <p className="text-sm text-slate-500">
                  Chủ đề giúp AI tạo bài đọc phù hợp với nội dung bạn muốn học.
                </p>
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span>{error}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-2 pb-6 px-6">
            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md shadow-indigo-200/50 shimmer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang tạo bài đọc...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Tạo bài đọc</span>
                </div>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {readingContent && (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 shimmer">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{readingTitle}</h2>
            <Badge className={PROFICIENCY_COLORS[proficiencyLevel as keyof typeof PROFICIENCY_COLORS]}>
              {proficiencyLevel === 'beginner' ? 'N5' : 
               proficiencyLevel === 'elementary' ? 'N4' :
               proficiencyLevel === 'intermediate' ? 'N3' :
               proficiencyLevel === 'advanced' ? 'N2' : 'N1'}
            </Badge>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
            <JapaneseReader
              text={{
                title: readingTitle,
                jlptLevel: proficiencyLevel === 'beginner' ? 'N5' : 
                       proficiencyLevel === 'elementary' ? 'N4' :
                       proficiencyLevel === 'intermediate' ? 'N3' :
                       proficiencyLevel === 'advanced' ? 'N2' : 'N1',
                content: readingContent
              }}
            />
          </div>
          
          <div className="mt-4 flex justify-center">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Bài đọc đã được tạo thành công!</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 