"use client"

import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card"
import type { PlainExercise } from "@/models/PlainTypes"
import { CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exercise } from "@/models/Exercise"
import { ObjectId } from "mongodb"
import { cn } from '@/lib/utils'
import { ExerciseType } from '@/models/Exercise';

// Generic interface for exercises that works with either MongoDB or serialized data
export interface GenericExercise {
  _id?: string | any; // Support both string and ObjectId
  lessonId?: string | any; // Support both string and ObjectId
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  skills: string[];
  difficulty: string;
  metadata: {
    targetLanguage: string;
    nativeLanguage: string;
    audioUrl?: string;
    audioText?: string;
    imageUrl?: string;
    [key: string]: any;
  };
  createdAt?: Date | string | any;
  updatedAt?: Date | string | any;
}

interface MultipleChoiceExerciseProps {
  exercise: GenericExercise;
  onSubmit: (answer: string, isCorrect: boolean, timeSpent: number) => void;
}

export function MultipleChoiceExercise({ exercise, onSubmit }: MultipleChoiceExerciseProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [startTime, setStartTime] = useState<number>(Date.now())

  useEffect(() => {
    setSelectedAnswer(null)
    setIsSubmitted(false)
    setStartTime(Date.now())
  }, [exercise._id])

  const handleAnswerSelect = (option: string) => {
    if (isSubmitted) return
    setSelectedAnswer(option)
  }

  const handleSubmit = () => {
    if (!selectedAnswer || isSubmitted) return

    const isCorrect = selectedAnswer === exercise.correctAnswer
    const timeSpent = Math.round((Date.now() - startTime) / 1000)

    setIsSubmitted(true)
    onSubmit(selectedAnswer, isCorrect, timeSpent)
  }

  const getOptionClass = (option: string) => {
    if (!isSubmitted) {
      return selectedAnswer === option
        ? "bg-blue-50 border-blue-300 ring-2 ring-blue-100"
        : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
    }

    if (option === exercise.correctAnswer) {
      return "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-100"
    }

    return selectedAnswer === option ? "bg-rose-50 border-rose-300 ring-2 ring-rose-100" : "bg-white border-slate-200"
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/20 to-cyan-200/20 rounded-full translate-y-12 -translate-x-12 floating-orb-slow"></div>
      
      <CardContent className="p-6 sm:p-8 relative">
        <div className="space-y-8">
          <div className="text-center">
            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl sm:text-2xl font-semibold text-slate-800 leading-relaxed"
            >
              {exercise.question}
            </motion.h2>
          </div>

          <div className="space-y-3 max-w-2xl mx-auto">
            {exercise.options?.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${getOptionClass(option)}`}
                onClick={() => handleAnswerSelect(option)}
                whileHover={!isSubmitted ? { scale: 1.01, transition: { duration: 0.2 } } : {}}
                whileTap={!isSubmitted ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-medium text-sm flex-shrink-0 ${
                    selectedAnswer === option 
                      ? 'bg-gradient-to-r from-blue-400 to-cyan-400 shimmer' 
                      : 'bg-gradient-to-r from-slate-400 to-slate-500'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-slate-700 leading-relaxed">{option}</span>
                  {isSubmitted && option === exercise.correctAnswer && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                    <CheckCircle className="w-5 h-5 text-emerald-600 ml-auto" />
                    </motion.div>
                  )}
                  {isSubmitted && selectedAnswer === option && option !== exercise.correctAnswer && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                    <XCircle className="w-5 h-5 text-rose-600 ml-auto" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
          {isSubmitted && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-lg mx-auto"
              >
              {selectedAnswer === exercise.correctAnswer ? (
                  <div className="flex items-start gap-3 p-5 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200 shadow-sm">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 shimmer flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  <div className="space-y-2">
                      <p className="font-medium text-emerald-800 text-lg">Chính xác</p>
                    {exercise.explanation && (
                      <p className="text-sm text-emerald-700 leading-relaxed">{exercise.explanation}</p>
                    )}
                  </div>
                </div>
              ) : (
                  <div className="flex items-start gap-3 p-5 rounded-lg bg-gradient-to-br from-rose-50 to-red-50/50 border border-rose-200 shadow-sm">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-rose-400 to-red-500 shimmer flex-shrink-0">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                  <div className="space-y-2">
                      <p className="font-medium text-rose-800 text-lg">Chưa chính xác</p>
                    <p className="text-sm text-rose-700">
                      Đáp án đúng: <span className="font-medium">{exercise.correctAnswer}</span>
                    </p>
                    {exercise.explanation && (
                      <p className="text-sm text-rose-700 leading-relaxed">{exercise.explanation}</p>
                    )}
                  </div>
                </div>
              )}
              </motion.div>
          )}
          </AnimatePresence>

          <div className="text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer || isSubmitted}
              className={`px-8 py-2.5 font-medium rounded-lg transition-all shadow-sm ${
                  isSubmitted 
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                    : selectedAnswer 
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white hover:shadow shimmer" 
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }`}
            >
              {isSubmitted ? "Đã hoàn thành" : "Kiểm tra"}
            </Button>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
