"use client";

import { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";

interface WritingProgressProps {
  characterId: string;
  onTrainingComplete?: () => void;
}

// Trong thực tế, dữ liệu này sẽ được lưu vào cơ sở dữ liệu cho người dùng
// Hiện tại chúng ta sẽ sử dụng localStorage để giả lập
export function WritingProgress({ characterId, onTrainingComplete }: WritingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [successes, setSuccesses] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Đọc dữ liệu từ localStorage khi component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(`writing-progress-${characterId}`);
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          setProgress(data.progress || 0);
          setAttempts(data.attempts || 0);
          setSuccesses(data.successes || 0);
          setStreak(data.streak || 0);
          setBestStreak(data.bestStreak || 0);
          setLastUpdated(data.lastUpdated ? new Date(data.lastUpdated) : null);
        } catch (e) {
          console.error('Failed to parse saved writing progress', e);
        }
      }
    }
  }, [characterId]);
  
  // Lưu dữ liệu vào localStorage khi thay đổi
  useEffect(() => {
    if (typeof window !== 'undefined' && progress > 0) {
      const dataToSave = {
        progress,
        attempts,
        successes,
        streak,
        bestStreak,
        lastUpdated: lastUpdated?.toISOString() || new Date().toISOString()
      };
      localStorage.setItem(`writing-progress-${characterId}`, JSON.stringify(dataToSave));
    }
  }, [progress, attempts, successes, streak, bestStreak, lastUpdated, characterId]);
  
  // Cập nhật tiến trình khi có kết quả nhận diện
  const updateProgress = (isCorrect: boolean) => {
    const now = new Date();
    setAttempts(prev => prev + 1);
    setLastUpdated(now);
    
    if (isCorrect) {
      setSuccesses(prev => prev + 1);
      setStreak(prev => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
        return newStreak;
      });
      
      // Tính toán tiến trình (tối đa là 100%)
      setProgress(prev => {
        const newProgress = Math.min(100, prev + 10);
        if (newProgress >= 100 && onTrainingComplete) {
          onTrainingComplete();
        }
        return newProgress;
      });
    } else {
      // Giảm streak khi viết sai
      setStreak(0);
    }
  };
  
  // Định dạng thời gian từ Date
  const formatDate = (date: Date | null) => {
    if (!date) return 'Chưa luyện tập';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);
    
    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHrs < 24) return `${diffHrs} giờ trước`;
    if (diffDays < 30) return `${diffDays} ngày trước`;
    
    return date.toLocaleDateString('vi-VN');
  };
  
  // Export hàm updateProgress để component cha có thể sử dụng
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.updateWritingProgress = updateProgress;
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        delete window.updateWritingProgress;
      }
    };
  }, []);
  
  return (
    <div className="writing-progress">
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span>Tiến trình luyện viết</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-2">
        <div className="text-center">
          <div className="text-sm text-gray-500">Số lần viết</div>
          <div className="font-semibold">{attempts}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Tỷ lệ chính xác</div>
          <div className="font-semibold">
            {attempts > 0 ? Math.round((successes / attempts) * 100) : 0}%
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-sm text-gray-500">Chuỗi hiện tại</div>
          <div className="font-semibold">{streak}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500">Chuỗi tốt nhất</div>
          <div className="font-semibold">{bestStreak}</div>
        </div>
      </div>
      
      {lastUpdated && (
        <div className="text-xs text-gray-500 text-center mt-2">
          Lần luyện tập cuối: {formatDate(lastUpdated)}
        </div>
      )}
    </div>
  );
}

// Khai báo kiểu toàn cục để tránh lỗi TypeScript
declare global {
  interface Window {
    updateWritingProgress?: (isCorrect: boolean) => void;
  }
} 