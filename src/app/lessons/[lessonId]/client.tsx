'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MultipleChoiceExercise } from '@/components/exercises/multiple-choice-exercise';
import { FillInBlankExercise } from '@/components/exercises/fill-in-blank-exercise';
import { TranslationExercise } from '@/components/exercises/translation-exercise';
import { ListeningExercise } from '@/components/exercises/listening-exercise';
import { SpeakingExercise } from '@/components/exercises/speaking-exercise';
import { MatchingExercise } from '@/components/exercises/matching-exercise';
import { Button } from '@/components/ui/button';
import { PlainExercise } from '@/models/PlainTypes';
import { updateExerciseProgress, completeLesson } from '@/app/actions/userProgress';

interface LessonClientProps {
  lessonId: string;
  exercises: PlainExercise[];
  xpReward: number;
  isLessonCompleted?: boolean;
}

export function LessonClient({ lessonId, exercises, xpReward, isLessonCompleted = false }: LessonClientProps) {
  const router = useRouter();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);
  const [sessionToken, setSessionToken] = useState<string>('');
  
  // Tạo session token khi component được tải
  useEffect(() => {
    const initSession = async () => {
      try {
        // Gọi API để tạo session token
        const response = await fetch('/api/lesson/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lessonId }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create session token');
        }
        
        const data = await response.json();
        setSessionToken(data.token);
      } catch (error) {
        console.error('Error creating session token:', error);
      }
    };
    
    initSession();
  }, [lessonId]);

  const currentExercise = exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === exercises.length - 1;
  
  const handleExerciseSubmit = async (answer: string, isCorrect: boolean, timeSpent: number) => {
    if (!currentExercise._id) return;
    
    // Thêm kết quả bài tập
    const result = { 
      exerciseId: currentExercise._id.toString(), 
      isCorrect, 
      timeSpent 
    };
    
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
    
    // Thêm bài tập vào danh sách đã hoàn thành
    setCompletedExercises(prev => [...prev, result.exerciseId]);
    
    // Tạm dừng một chút để người dùng xem kết quả
    setTimeout(() => {
      if (isLastExercise) {
        setIsCompleted(true);
      } else {
        setCurrentExerciseIndex(currentExerciseIndex + 1);
      }
    }, 1500);
    
    // Gửi kết quả lên server
    try {
      await updateExerciseProgress(
        result.exerciseId,
        lessonId, 
        result.isCorrect
      );
    } catch (error) {
      console.error('Error submitting exercise attempt:', error);
    }
  };
  
  const handleCompleteLession = async () => {
    if (isSubmitting || !sessionToken) return;
    
    setIsSubmitting(true);
    
    try {
      // Debug log
      console.log('Completing lesson with token:', sessionToken);
      console.log('Completed exercises:', completedExercises);
    
      // Tính điểm số dựa trên số câu đúng
      const score = Math.round((correctCount / exercises.length) * 100);
      
      // Gọi API hoàn thành bài học với danh sách bài tập đã hoàn thành
      const result = await completeLesson(lessonId, score, completedExercises, sessionToken);
      
      // Chuyển đến trang unit
      router.push(`/units/${result.unitId}`);
    } catch (error) {
      console.error('Error completing lesson:', error);
      alert('Có lỗi xảy ra khi hoàn thành bài học. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      {/* Hiển thị bài tập hiện tại */}
      {!isCompleted && currentExercise && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Bài tập {currentExerciseIndex + 1}/{exercises.length}
            </div>
          </div>
          
          {currentExercise.type === 'multiple_choice' && (
            <MultipleChoiceExercise
              exercise={currentExercise}
              onSubmit={handleExerciseSubmit}
            />
          )}
          
          {currentExercise.type === 'fill_in_the_blank' && (
            <FillInBlankExercise
              exercise={currentExercise}
              onSubmit={handleExerciseSubmit}
            />
          )}
          
          {currentExercise.type === 'translation' && (
            <TranslationExercise
              exercise={currentExercise}
              onSubmit={handleExerciseSubmit}
            />
          )}
          
          {currentExercise.type === 'listening' && (
            <ListeningExercise
              exercise={currentExercise}
              onSubmit={handleExerciseSubmit}
            />
          )}
          
          {currentExercise.type === 'speaking' && (
            <SpeakingExercise
              exercise={currentExercise}
              onSubmit={handleExerciseSubmit}
            />
          )}
          
          {currentExercise.type === 'matching' && (
            <MatchingExercise
              exercise={currentExercise}
              onSubmit={handleExerciseSubmit}
            />
          )}
        </div>
      )}
      
      {/* Hiển thị trang tổng kết khi hoàn thành tất cả bài tập */}
      {isCompleted && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Hoàn thành bài học!
          </h2>
          
          <div className="mb-6">
            <p className="mb-2">Kết quả:</p>
            <ul className="list-disc list-inside">
              <li>Số câu đúng: {correctCount}/{exercises.length}</li>
              <li>XP nhận được: {isLessonCompleted ? 0 : xpReward}</li>
            </ul>
          </div>
          
          <Button 
            onClick={handleCompleteLession} 
            disabled={isSubmitting}
            size="lg"
            className={`relative ${isLessonCompleted ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
          >
            {isSubmitting ? (
              <>
                <span className="opacity-0">{isLessonCompleted ? "Học lại" : "Hoàn thành bài học"}</span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
              </>
            ) : isLessonCompleted ? "Học lại" : "Hoàn thành bài học"}
          </Button>
        </div>
      )}
    </div>
  );
} 