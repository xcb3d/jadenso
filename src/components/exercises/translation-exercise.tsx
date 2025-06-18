"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import type { PlainExercise } from "@/models/PlainTypes"
import { Textarea } from "../ui/textarea"
import { CheckCircle, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface TranslationExerciseProps {
  exercise: PlainExercise
  onSubmit: (answer: string, isCorrect: boolean, timeSpent: number) => void
}

export function TranslationExercise({ exercise, onSubmit }: TranslationExerciseProps) {
  const [translation, setTranslation] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [startTime, setStartTime] = useState<number>(Date.now())

  useEffect(() => {
    setTranslation("")
    setIsSubmitted(false)
    setStartTime(Date.now())
  }, [exercise._id])

  const handleSubmit = () => {
    if (!translation.trim() || isSubmitted) return

    const userAnswer = translation.trim().toLowerCase()
    const correctAnswer = exercise.correctAnswer.toLowerCase()

    const userWords = new Set(userAnswer.split(/\s+/).filter((word) => word.length > 2))
    const correctWords = new Set(correctAnswer.split(/\s+/).filter((word) => word.length > 2))

    let correctWordCount = 0
    userWords.forEach((word) => {
      if (correctWords.has(word)) {
        correctWordCount++
      }
    })

    const accuracy = correctWordCount / Math.max(correctWords.size, 1)
    const isCorrect = accuracy >= 0.7

    const timeSpent = Math.round((Date.now() - startTime) / 1000)

    setIsSubmitted(true)
    onSubmit(translation, isCorrect, timeSpent)
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-indigo-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/20 to-indigo-200/20 rounded-full translate-y-12 -translate-x-12 floating-orb-slow"></div>
      
      <CardContent className="p-6 sm:p-8 relative">
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/70 shadow-sm transition-all hover:shadow">
              <h2 className="text-lg font-medium text-slate-800 mb-4 text-center">Dịch câu sau:</h2>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50/50 rounded-lg border border-purple-100"
              >
                <p className="text-xl text-slate-800 leading-relaxed text-center">{exercise.question}</p>
              </motion.div>
              {exercise.metadata.imageUrl && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 text-center"
                >
                  <img
                    src={exercise.metadata.imageUrl || "/placeholder.svg"}
                    alt="Translation context"
                    className="max-h-48 object-contain mx-auto rounded-lg shadow-sm"
                  />
                </motion.div>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-2xl mx-auto"
          >
            <label htmlFor="translation" className="block text-sm font-medium text-slate-700 mb-3">
              Bản dịch của bạn ({exercise.metadata.targetLanguage || "Tiếng Việt"}):
            </label>
            <Textarea
              id="translation"
              value={translation}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTranslation(e.target.value)}
              placeholder="Nhập bản dịch của bạn..."
              disabled={isSubmitted}
              className="min-h-[120px] text-lg leading-relaxed border-slate-200 focus:border-purple-400 focus:ring-purple-400/20 transition-all shadow-sm rounded-lg"
            />
          </motion.div>

          <AnimatePresence>
          {isSubmitted && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto"
              >
                {translation.trim().toLowerCase() === exercise.correctAnswer.toLowerCase() ? (
                <div className="flex items-start gap-3 p-5 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200 shadow-sm">
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 shimmer flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                <div className="space-y-2">
                    <p className="font-medium text-emerald-800 text-lg">Hoàn hảo!</p>
                    <div className="text-sm text-emerald-700">
                    <p className="font-medium">Bản dịch tham khảo:</p>
                    <p className="mt-1 leading-relaxed">{exercise.correctAnswer}</p>
                  </div>
                  {exercise.explanation && (
                      <p className="text-sm text-emerald-700 leading-relaxed">
                      {exercise.explanation}
                    </p>
                  )}
                </div>
              </div>
              ) : (
                <div className="flex items-start gap-3 p-5 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50/50 border border-amber-200 shadow-sm">
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 shimmer flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium text-amber-800 text-lg">Có thể chấp nhận</p>
                    <div className="text-sm text-amber-700">
                      <p className="font-medium">Bản dịch tham khảo:</p>
                      <p className="mt-1 leading-relaxed">{exercise.correctAnswer}</p>
                    </div>
                    {exercise.explanation && (
                      <p className="text-sm text-amber-700 leading-relaxed">
                        {exercise.explanation}
                      </p>
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
              disabled={!translation.trim() || isSubmitted}
              className={`px-8 py-2.5 font-medium rounded-lg transition-all shadow-sm ${
                  isSubmitted 
                  ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                    : translation.trim() 
                    ? "bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white hover:shadow shimmer" 
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
