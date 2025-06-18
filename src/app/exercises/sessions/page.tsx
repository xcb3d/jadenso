'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/main-layout';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { Loader2, PlusCircle, Book, BookOpen, Target, Calendar, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ExerciseSession {
  _id: string;
  title: string;
  description: string;
  exerciseCount: number;
  proficiencyLevel: string;
  createdAt: string;
  updatedAt: string;
}

export default function ExerciseSessionsPage() {
  const { status } = useSession();
  const [sessions, setSessions] = useState<ExerciseSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
    
    if (status === 'authenticated') {
      loadSessions();
    }
  }, [status]);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/exercises/sessions');
      if (!response.ok) {
        throw new Error('Failed to load sessions');
      }
      
      const data = await response.json();
      setSessions(data.sessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
  };

  const getProficiencyLabel = (level: string) => {
    const levels: Record<string, string> = {
      'beginner': 'Tập sự (N5)',
      'elementary': 'Sơ cấp (N4)',
      'intermediate': 'Trung cấp (N3)',
      'advanced': 'Nâng cao (N2)',
      'expert': 'Chuyên gia (N1)',
    };
    return levels[level] || level;
  };

  const getProficiencyColor = (level: string): string => {
    const colors: Record<string, string> = {
      'beginner': 'from-emerald-400 to-teal-500',
      'elementary': 'from-cyan-400 to-blue-500',
      'intermediate': 'from-blue-400 to-indigo-500',
      'advanced': 'from-indigo-400 to-purple-500',
      'expert': 'from-purple-400 to-pink-500',
    };
    return colors[level] || 'from-slate-400 to-slate-500';
  };

  return (
    <MainLayout>
      <section className="px-6 py-16 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Phiên tập luyện</h1>
            <p className="text-slate-600">Tạo và quản lý các phiên luyện tập từ vựng của bạn</p>
          </div>
          <Link href="/exercises/generate">
            <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/50 shimmer">
              <PlusCircle className="mr-2 h-4 w-4" />
              Tạo bài tập mới
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-24">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 opacity-75 blur animate-pulse"></div>
              <div className="relative bg-white rounded-full p-4">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
              </div>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 floating-card overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
            <CardHeader>
              <CardTitle className="text-2xl text-slate-900">Không có phiên tập luyện</CardTitle>
              <CardDescription className="text-slate-600">
                Bạn chưa tạo bài tập nào. Tạo bài tập mới để bắt đầu luyện tập.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-12">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-200/50 to-blue-200/50 rounded-full animate-pulse blur-md"></div>
                <div className="relative flex items-center justify-center w-full h-full bg-white rounded-full shadow-md">
                  <BookOpen className="h-12 w-12 text-cyan-500" />
                </div>
              </div>
              <p className="mb-6 text-slate-600 max-w-md mx-auto">Tạo bài tập từ vựng từ danh sách từ của bạn và lưu trữ chúng thành các phiên. Bạn có thể theo dõi tiến trình và xem kết quả của mình.</p>
            </CardContent>
            <CardFooter>
              <Link href="/exercises/generate" className="w-full">
                <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/50 shimmer">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tạo bài tập đầu tiên
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <Card key={session._id} className="group overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 floating-card-slow">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full translate-y-12 -translate-x-12 floating-orb-slow"></div>
                
                <div className="relative h-24 w-full overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-r ${getProficiencyColor(session.proficiencyLevel)} flowing-bg`}></div>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-cyan-700 border-0 font-semibold floating-badge">
                      {getProficiencyLabel(session.proficiencyLevel)}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 right-4 text-white/80">
                    <div className="text-4xl font-bold opacity-20 floating-text character-bounce">ひ</div>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900 group-hover:text-cyan-600 transition-colors">{session.title}</CardTitle>
                  <CardDescription className="text-slate-600">
                    {session.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50/30 hover:from-slate-50/80 hover:to-blue-50/50 transition-colors border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Book className="h-4 w-4 text-cyan-600" />
                        <span className="text-sm font-medium text-slate-700">Số lượng bài tập</span>
                      </div>
                      <span className="font-medium text-cyan-700">{session.exerciseCount}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50/30 hover:from-slate-50/80 hover:to-blue-50/50 transition-colors border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-cyan-600" />
                        <span className="text-sm font-medium text-slate-700">Cấp độ</span>
                      </div>
                      <span className="font-medium text-cyan-700">{getProficiencyLabel(session.proficiencyLevel)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50/30 hover:from-slate-50/80 hover:to-blue-50/50 transition-colors border border-slate-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-cyan-600" />
                        <span className="text-sm font-medium text-slate-700">Ngày tạo</span>
                      </div>
                      <span className="font-medium text-cyan-700">{formatDate(session.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/exercises/sessions/${session._id}`} className="w-full">
                    <Button variant="outline" className="w-full group-hover:border-cyan-200 group-hover:bg-gradient-to-r group-hover:from-cyan-50 group-hover:to-blue-50/50 transition-all duration-300">
                      <div className="flex items-center">
                        <div className="p-1 rounded-full bg-cyan-100 mr-2 group-hover:bg-cyan-200 transition-colors">
                          <Play className="h-3 w-3 text-cyan-600" />
                        </div>
                        <span className="text-slate-700 group-hover:text-cyan-700 transition-colors">Luyện tập</span>
                      </div>
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </MainLayout>
  );
} 