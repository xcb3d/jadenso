"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';

export default function CreateDeckPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Thông báo lỗi",
        description: "Vui lòng nhập tên cho bộ thẻ",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Call the server action to create a new deck
      const response = await fetch('/api/flashcards/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Không thể tạo bộ thẻ mới');
      }
      
      const data = await response.json();
      
      toast({
        title: "Thành công",
        description: "Đã tạo bộ thẻ mới",
      });
      
      // Redirect to the newly created deck
      router.push(`/flashcards/decks/${data._id}`);
    } catch (error) {
      console.error('Error creating deck:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo bộ thẻ. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <Link 
        href="/flashcards" 
        className="flex items-center text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft size={16} className="mr-2" />
        Quay lại
      </Link>
      
      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold mb-1">Tạo bộ thẻ mới</h1>
        <p className="text-slate-600 mb-6">Tạo bộ thẻ flashcard của riêng bạn để học và ôn tập từ vựng</p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 mb-6">
            <div className="space-y-2">
              <label htmlFor="title" className="font-medium">
                Tên bộ thẻ
              </label>
              <Input
                id="title"
                name="title"
                placeholder="Ví dụ: Từ vựng N5 - Bài 1"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="font-medium">
                Mô tả (tùy chọn)
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Nhập mô tả về bộ thẻ flashcard của bạn"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full resize-none"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              onClick={() => router.push('/flashcards')}
            >
              Hủy
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/30"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang tạo..." : "Tạo bộ thẻ"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 