"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import type { PlainExercise } from "@/models/PlainTypes"
import { CheckCircle, XCircle, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface MatchPair {
  id: string
  text: string
}

interface MatchingExerciseProps {
  exercise: PlainExercise
  onSubmit: (answer: string, isCorrect: boolean, timeSpent: number) => void
}

export function MatchingExercise({ exercise, onSubmit }: MatchingExerciseProps) {
  const [leftItems, setLeftItems] = useState<MatchPair[]>([])
  const [rightItems, setRightItems] = useState<MatchPair[]>([])
  const [matches, setMatches] = useState<{ [key: string]: string }>({})
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [correctPairs, setCorrectPairs] = useState<Map<string, string>>(new Map())
  const [result, setResult] = useState<{ isCorrect: boolean; correctMatches: number } | null>(null)
  const [pairResults, setPairResults] = useState<{ [leftId: string]: boolean }>({})

  useEffect(() => {
    if (!exercise.options || !exercise.options.length) return

    try {
      const left: MatchPair[] = []
      const right: MatchPair[] = []
      const pairMap = new Map<string, string>()

      exercise.options.forEach((option, index) => {
        const parts = option.split(" - ")
        if (parts.length === 2) {
          const leftText = parts[0].trim()
          const rightText = parts[1].trim()

          left.push({ id: `L${index}`, text: leftText })
          right.push({ id: `R${index}`, text: rightText })
          pairMap.set(leftText, rightText)
        }
      })

      setCorrectPairs(pairMap)

      if (left.length > 0) {
        const shuffledRight = [...right].sort(() => Math.random() - 0.5)
        setLeftItems(left)
        setRightItems(shuffledRight)
      } else {
        setLeftItems([])
        setRightItems([])
      }

      setMatches({})
      setSelectedLeft(null)
      setSelectedRight(null)
      setIsSubmitted(false)
      setStartTime(Date.now())
    } catch (error) {
      console.error("Error setting up matching exercise:", error)
      setLeftItems([])
      setRightItems([])
    }
  }, [exercise._id, exercise.options])

  const handleItemClick = useCallback(
    (id: string, side: "left" | "right") => {
      if (isSubmitted) return

      if (side === "left") {
        setSelectedLeft(selectedLeft === id ? null : id)
      } else {
        setSelectedRight(selectedRight === id ? null : id)
      }
    },
    [isSubmitted, selectedLeft, selectedRight],
  )

  useEffect(() => {
    if (selectedLeft && selectedRight) {
      setMatches((prev) => ({
        ...prev,
        [selectedLeft]: selectedRight,
      }))
      setSelectedLeft(null)
      setSelectedRight(null)
    }
  }, [selectedLeft, selectedRight])

  const handleRemoveMatch = (leftId: string) => {
    if (isSubmitted) return

    setMatches((prev) => {
      const updated = { ...prev }
      delete updated[leftId]
      return updated
    })
  }

  const allMatched = Object.keys(matches).length === leftItems.length

  const handleSubmit = () => {
    if (!allMatched || isSubmitted) return

    let correctMatches = 0
    const results: { [leftId: string]: boolean } = {}

    Object.keys(matches).forEach((leftId) => {
      const leftItem = leftItems.find((item) => item.id === leftId)
      if (!leftItem) return

      const rightId = matches[leftId]
      const rightItem = rightItems.find((item) => item.id === rightId)
      if (!rightItem) return

      const isCorrectPair = correctPairs.get(leftItem.text) === rightItem.text
      results[leftId] = isCorrectPair

      if (isCorrectPair) {
        correctMatches++
      }
    })

    const isCorrect = correctMatches === leftItems.length
    setResult({ isCorrect, correctMatches })
    setPairResults(results)

    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    setIsSubmitted(true)
    onSubmit(JSON.stringify(matches), isCorrect, timeSpent)
  }

  const getLeftItemClass = (item: MatchPair) => {
    const isMatched = matches[item.id] !== undefined
    const isSelected = selectedLeft === item.id

    if (isSubmitted && isMatched) {
      if (pairResults[item.id]) {
        return "bg-emerald-50 border-emerald-200 ring-2 ring-emerald-100"
      } else {
        return "bg-rose-50 border-rose-200 ring-2 ring-rose-100"
      }
    }

    return isMatched
      ? "bg-slate-100 border-slate-300"
      : isSelected
        ? "bg-blue-50 border-blue-300 ring-2 ring-blue-100"
        : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
  }

  const getRightItemClass = (item: MatchPair) => {
    const isMatched = Object.values(matches).includes(item.id)
    const isSelected = selectedRight === item.id

    if (isSubmitted && isMatched) {
      const leftId = Object.keys(matches).find((key) => matches[key] === item.id)
      if (leftId && pairResults[leftId]) {
        return "bg-emerald-50 border-emerald-200 ring-2 ring-emerald-100"
      } else if (leftId) {
        return "bg-rose-50 border-rose-200 ring-2 ring-rose-100"
      }
    }

    return isMatched
      ? "bg-slate-100 border-slate-300"
      : isSelected
        ? "bg-blue-50 border-blue-300 ring-2 ring-blue-100"
        : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
  }

  return (
    <Card className="border-0 shadow-md bg-gradient-to-b from-white to-slate-50/80 overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        <div className="space-y-8">
          <div className="text-center">
            <motion.h2 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl sm:text-2xl font-semibold text-slate-800 leading-relaxed"
            >
              {exercise.question}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-sm text-slate-600 mt-2"
            >
              Nhấp vào các mục để ghép cặp
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          >
            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-4 text-center">Cột A</h3>
              <div className="space-y-3">
                {leftItems.map((item, idx) => {
                  const isMatched = matches[item.id] !== undefined
                  const itemClass = getLeftItemClass(item)

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      onClick={() => !isMatched && handleItemClick(item.id, "left")}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${itemClass}`}
                      whileHover={!isMatched && !isSubmitted ? { scale: 1.02, transition: { duration: 0.2 } } : {}}
                      whileTap={!isMatched && !isSubmitted ? { scale: 0.98 } : {}}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700 leading-relaxed">{item.text}</span>
                        {isMatched && !isSubmitted && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (!isSubmitted) handleRemoveMatch(item.id)
                            }}
                            disabled={isSubmitted}
                            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                        {isSubmitted && isMatched && (
                          <motion.span 
                            className="ml-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                          >
                            {pairResults[item.id] ? (
                              <CheckCircle className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-rose-600" />
                            )}
                          </motion.span>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-700 mb-4 text-center">Cột B</h3>
              <div className="space-y-3">
                {rightItems.map((item, idx) => {
                  const isMatched = Object.values(matches).includes(item.id)
                  const itemClass = getRightItemClass(item)

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      onClick={() => !isMatched && handleItemClick(item.id, "right")}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${itemClass}`}
                      whileHover={!isMatched && !isSubmitted ? { scale: 1.02, transition: { duration: 0.2 } } : {}}
                      whileTap={!isMatched && !isSubmitted ? { scale: 0.98 } : {}}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-slate-700 leading-relaxed">{item.text}</span>
                        {isSubmitted && isMatched && (
                          <motion.span 
                            className="ml-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20 }}
                          >
                            {(() => {
                              const leftId = Object.keys(matches).find((key) => matches[key] === item.id)
                              if (leftId && pairResults[leftId]) {
                                return <CheckCircle className="w-5 h-5 text-emerald-600" />
                              } else if (leftId) {
                                return <XCircle className="w-5 h-5 text-rose-600" />
                              }
                              return null
                            })()}
                          </motion.span>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
          {isSubmitted && result && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-lg mx-auto"
              >
              {result.isCorrect ? (
                  <div className="flex items-start gap-3 p-5 rounded-lg bg-emerald-50/80 border border-emerald-200 shadow-sm">
                    <CheckCircle className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                      <p className="font-medium text-emerald-800 text-lg">Chính xác</p>
                    <p className="text-sm text-emerald-700">
                      Bạn đã ghép đúng {result.correctMatches}/{leftItems.length} cặp.
                    </p>
                    {exercise.explanation && (
                      <p className="text-sm text-emerald-700 leading-relaxed">{exercise.explanation}</p>
                    )}
                  </div>
                </div>
              ) : (
                  <div className="flex items-start gap-3 p-5 rounded-lg bg-rose-50/80 border border-rose-200 shadow-sm">
                    <XCircle className="w-6 h-6 text-rose-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                      <p className="font-medium text-rose-800 text-lg">Chưa chính xác</p>
                    <p className="text-sm text-rose-700">
                      Bạn chỉ ghép đúng {result.correctMatches}/{leftItems.length} cặp.
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
              disabled={!allMatched || isSubmitted}
                className={`px-8 py-2.5 text-white font-medium rounded-lg transition-all shadow-sm ${
                  isSubmitted 
                    ? "bg-slate-300 cursor-not-allowed" 
                    : allMatched 
                      ? "bg-blue-600 hover:bg-blue-700 hover:shadow" 
                      : "bg-slate-300 cursor-not-allowed"
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
