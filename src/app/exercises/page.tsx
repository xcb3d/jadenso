'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Dumbbell, BookOpen, Sparkles, ArrowRight, Brain, Lightbulb, Zap, PlusCircle, ListChecks } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function ExercisesIndexPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/patterns/circuit-board.svg')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-indigo-400/30 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400/30 to-indigo-400/30 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>
          
          <div className="container mx-auto py-20 px-4 relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="mb-6 flex justify-center">
                <div className="bg-white/20 p-5 rounded-full inline-block shadow-lg shadow-purple-500/20 floating-icon">
                  <Dumbbell className="h-10 w-10 text-white" />
                </div>
              </div>
              <h1 className="text-5xl font-bold mb-6 leading-tight text-glow">
                <span className="bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">Luyện tập từ vựng</span>
              </h1>
              <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto leading-relaxed">
                Cải thiện vốn từ vựng tiếng Nhật của bạn với các bài tập tương tác được cá nhân hóa
              </p>
            </motion.div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 transform wave-effect"></div>
        </div>

        <div className="container mx-auto py-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-center mb-12">
              <Badge className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-0 mb-4">
                Tính năng
              </Badge>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 bg-clip-text text-transparent mb-4">Tùy chỉnh trải nghiệm học tập</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Tạo và thực hành các bài tập được thiết kế riêng cho bạn với sự hỗ trợ của AI</p>
            </div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-0 bg-gradient-to-br from-white to-purple-50/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group floating-card h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-indigo-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform shimmer">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl group-hover:text-purple-700 transition-colors">Tạo bài tập</CardTitle>
                  </div>
                  <CardDescription className="text-base text-slate-600">Tạo bài tập tùy chỉnh từ danh sách từ vựng của bạn với Gemini AI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 rounded-full p-1 mt-0.5">
                      <Zap className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-slate-600">Nhập danh sách từ vựng và tạo các bài tập tùy chỉnh để luyện tập.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 rounded-full p-1 mt-0.5">
                      <Brain className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-slate-600">AI sẽ tạo ra các bài tập phù hợp với trình độ và nhu cầu học tập của bạn.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 rounded-full p-1 mt-0.5">
                      <Lightbulb className="h-4 w-4 text-purple-600" />
                    </div>
                    <p className="text-slate-600">Các bài tập được lưu trữ trong cơ sở dữ liệu để dễ dàng truy cập và quản lý.</p>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Link href="/exercises/generate" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/20 group ripple-effect">
                      <PlusCircle className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                      Tạo bài tập mới
                      <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="border-0 bg-gradient-to-br from-white to-blue-50/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group floating-card h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform shimmer">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl group-hover:text-blue-700 transition-colors">Phiên luyện tập</CardTitle>
                  </div>
                  <CardDescription className="text-base text-slate-600">Luyện tập với các bài tập đã tạo để cải thiện kỹ năng ngôn ngữ</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                      <ListChecks className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-slate-600">Thực hành với các phiên bài tập đã lưu để cải thiện kỹ năng ngôn ngữ của bạn.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                      <Brain className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-slate-600">Đa dạng các loại bài tập giúp ghi nhớ từ vựng lâu hơn và hiệu quả hơn.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                      <Zap className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-slate-600">Theo dõi tiến độ và xem sự cải thiện của bạn theo thời gian với thống kê chi tiết.</p>
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Link href="/exercises/sessions" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 group ripple-effect">
                      <ListChecks className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                      Xem phiên luyện tập
                      <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 max-w-3xl mx-auto text-center"
          >
            <div className="p-8 bg-gradient-to-br from-white to-indigo-50/50 rounded-2xl shadow-lg border border-indigo-100/50">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">Bạn cần trợ giúp?</h3>
              <p className="text-slate-600 mb-6">
                Khám phá hướng dẫn chi tiết về cách tạo và thực hành các bài tập hiệu quả nhất
              </p>
              <Button variant="outline" className="bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 transition-all duration-300 group">
                Xem hướng dẫn
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
} 