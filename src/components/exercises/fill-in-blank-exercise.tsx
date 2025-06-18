"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import type { PlainExercise } from "@/models/PlainTypes"
import { Input } from "../ui/input"
import { CheckCircle, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface FillInBlankExerciseProps {
  exercise: PlainExercise
  onSubmit: (answer: string, isCorrect: boolean, timeSpent: number) => void
}

export function FillInBlankExercise({ exercise, onSubmit }: FillInBlankExerciseProps) {
  const [answer, setAnswer] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [startTime, setStartTime] = useState<number>(Date.now())

  useEffect(() => {
    setAnswer("")
    setIsSubmitted(false)
    setStartTime(Date.now())
  }, [exercise._id])

  const handleSubmit = () => {
    if (!answer.trim() || isSubmitted) return

    const normalizedAnswer = answer.trim().toLowerCase()
    const normalizedCorrect = exercise.correctAnswer.toLowerCase()
    const isCorrect = normalizedAnswer === normalizedCorrect
    const timeSpent = Math.round((Date.now() - startTime) / 1000)

    setIsSubmitted(true)
    onSubmit(answer, isCorrect, timeSpent)
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-indigo-200/20 to-purple-200/20 rounded-full translate-y-12 -translate-x-12 floating-orb-slow"></div>
      
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

          <div className="max-w-md mx-auto">
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
            <Input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Nhập câu trả lời..."
              disabled={isSubmitted}
                  className="text-center text-lg py-4 rounded-lg border-slate-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all shadow-sm"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
                {answer && !isSubmitted && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-400"
                  >
                    Nhấn Enter để gửi
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>

          <AnimatePresence>
          {isSubmitted && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-lg mx-auto"
              >
              {answer.trim().toLowerCase() === exercise.correctAnswer.toLowerCase() ? (
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
              disabled={!answer.trim() || isSubmitted}
              className={`px-8 py-2.5 font-medium rounded-lg transition-all shadow-sm ${
                  isSubmitted 
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                    : answer.trim() 
                    ? "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white hover:shadow shimmer" 
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
