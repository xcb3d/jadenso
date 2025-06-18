'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MultipleChoiceExercise } from '@/components/exercises/multiple-choice-exercise';
import { Button } from '@/components/ui/button';
import { Exercise } from '@/models/Exercise';
import { submitExerciseAttempt, completeReviewSession } from '@/app/actions/review';
import { ObjectId } from 'mongodb';

// Define a ReviewExercise type that has string IDs instead of ObjectId
type ReviewExercise = Omit<Exercise, '_id' | 'lessonId'> & {
  _id: string;
  lessonId: string;
};

interface ReviewClientProps {
  reviewId: string;
  exercises: ReviewExercise[];
}

export function ReviewClient({ reviewId, exercises }: ReviewClientProps) {
  const router = useRouter();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseResults, setExerciseResults] = useState<{ exerciseId: string; isCorrect: boolean; timeSpent: number }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentExercise = exercises[currentExerciseIndex];
  const isLastExercise = currentExerciseIndex === exercises.length - 1;
  
  // Tính số câu đúng
  const correctCount = exerciseResults.filter(r => r.isCorrect).length;
  
  // Tính điểm tạm thời
  const currentScore = exercises.length > 0 
    ? Math.round((correctCount / exercises.length) * 100) 
    : 0;
  
  const handleExerciseSubmit = async (answer: string, isCorrect: boolean, timeSpent: number) => {
    if (!currentExercise._id) return;
    
    // Thêm kết quả bài tập vào mảng kết quả
    const result = { 
      exerciseId: currentExercise._id.toString(), 
      isCorrect, 
      timeSpent 
    };
    
    setExerciseResults([...exerciseResults, result]);
    
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
      await submitExerciseAttempt(
        reviewId, 
        result.exerciseId, 
        answer, 
        result.isCorrect, 
        result.timeSpent
      );
    } catch (error) {
      console.error('Error submitting exercise attempt:', error);
    }
  };
  
  const handleCompleteReview = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Tính điểm và hoàn thành phiên ôn tập
      const score = Math.round((correctCount / exercises.length) * 100);
      await completeReviewSession(reviewId, score);
      
      // Chuyển hướng về trang ôn tập
      router.push('/reviews');
      router.refresh();
    } catch (error) {
      console.error('Error completing review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      {/* Tiến trình ôn tập */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Tiến độ: {currentExerciseIndex + 1}/{exercises.length} 
            ({isCompleted ? '100' : Math.round(((currentExerciseIndex + 1) / exercises.length) * 100)}%)
          </span>
          
          {exerciseResults.length > 0 && (
            <span className="text-sm font-medium text-gray-700">
              Điểm: {currentScore}/100
            </span>
          )}
        </div>
        
        <div className="w-full bg-gray-200 h-2 rounded-full">
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-300" 
            style={{ 
              width: isCompleted 
                ? '100%' 
                : `${Math.round(((currentExerciseIndex + 1) / exercises.length) * 100)}%` 
            }}
          ></div>
        </div>
      </div>
      
      {/* Hiển thị bài tập hiện tại */}
      {!isCompleted && currentExercise && (
        <div>
          {currentExercise.type === 'multiple_choice' && (
            <MultipleChoiceExercise
              exercise={currentExercise}
              onSubmit={handleExerciseSubmit}
            />
          )}
        </div>
      )}
      
      {/* Hiển thị trang tổng kết khi hoàn thành tất cả bài tập */}
      {isCompleted && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Hoàn thành phiên ôn tập!
          </h2>
          
          <div className="mb-6">
            <div className="inline-block bg-white py-3 px-6 rounded-lg shadow-sm border border-gray-200">
              <div className="mb-2">
                <span className="text-4xl font-bold text-blue-600">{currentScore}</span>
                <span className="text-gray-500">/100</span>
              </div>
              <p className="text-sm text-gray-500">điểm</p>
            </div>
            
            <div className="mt-4">
              <p className="mb-2">Kết quả chi tiết:</p>
              <ul className="list-disc list-inside text-left max-w-xs mx-auto">
                <li>Số câu đúng: {correctCount}/{exercises.length}</li>
                <li>Tỷ lệ đúng: {Math.round((correctCount / exercises.length) * 100)}%</li>
                <li>Thời gian làm bài: {Math.round(exerciseResults.reduce((sum, result) => sum + result.timeSpent, 0))} giây</li>
              </ul>
            </div>
          </div>
          
          <Button 
            onClick={handleCompleteReview} 
            disabled={isSubmitting}
            size="lg"
          >
            {isSubmitting ? 'Đang xử lý...' : 'Hoàn thành'}
          </Button>
        </div>
      )}
    </div>
  );
} 