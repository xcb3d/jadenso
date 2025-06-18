"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import type { PlainExercise } from "@/models/PlainTypes"
import { Input } from "../ui/input"
import { Play, Pause, Volume2, CheckCircle, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ListeningExerciseProps {
  exercise: PlainExercise
  onSubmit: (answer: string, isCorrect: boolean, timeSpent: number) => void
}

export function ListeningExercise({ exercise, onSubmit }: ListeningExerciseProps) {
  const [answer, setAnswer] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])

  // Get text to be spoken - use audioText or fallback to correctAnswer
  const textToSpeak = exercise.metadata.audioText || exercise.correctAnswer
  
  // Check if speech synthesis is available
  const isSpeechSynthesisAvailable = typeof window !== 'undefined' && 'speechSynthesis' in window

  // Load voices when component mounts
  useEffect(() => {
    if (!isSpeechSynthesisAvailable) {
      setAudioError("Trình duyệt của bạn không hỗ trợ chức năng đọc văn bản")
      return
    }

    // Function to set available voices
    const setVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        setAvailableVoices(voices)
      }
    }

    // Set voices if already available
    setVoices()

    // Handle the voiceschanged event
    window.speechSynthesis.onvoiceschanged = setVoices

    // Clean up
    return () => {
      if (isSpeechSynthesisAvailable) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isSpeechSynthesisAvailable])

  // Reset state when exercise changes
  useEffect(() => {
    setAnswer("")
    setIsSubmitted(false)
    setStartTime(Date.now())
    setAudioError(null)

    // Check if text-to-speech is available
    if (!isSpeechSynthesisAvailable && !exercise.metadata.audioUrl) {
      setAudioError("Không hỗ trợ chức năng đọc văn bản")
    }
  }, [exercise._id, isSpeechSynthesisAvailable, exercise.metadata.audioUrl])

  // Handle play button click
  const handlePlayAudio = () => {
    // Cancel any ongoing speech
    if (isPlaying && isSpeechSynthesisAvailable) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      return
    }

    // Try to use text-to-speech
    if (isSpeechSynthesisAvailable && textToSpeak) {
      try {
        // Create a new utterance
        const utterance = new SpeechSynthesisUtterance(textToSpeak)
        
        // Try to find a Japanese voice
        const japaneseVoice = availableVoices.find(voice => 
          voice.lang.includes('ja') || voice.lang.startsWith('ja-')
        )
        
        // Set voice and language
        if (japaneseVoice) {
          utterance.voice = japaneseVoice
          utterance.lang = japaneseVoice.lang
        } else {
          // Try to use any available voice with Japanese lang setting
          utterance.lang = 'ja-JP'
        }
        
        // Set other properties to try to make speech clearer
        utterance.rate = 0.9  // Slightly slower
        utterance.pitch = 1.0
        utterance.volume = 1.0
        
        // Handle speech events
        utterance.onend = () => {
          setIsPlaying(false)
        }
        
        utterance.onerror = () => {
          setAudioError("Lỗi khi phát âm thanh")
          setIsPlaying(false)
        }
        
        // Start speaking
        window.speechSynthesis.cancel()  // Cancel any previous speech
        window.speechSynthesis.speak(utterance)
        setIsPlaying(true)
        setAudioError(null)
        
        return
      } catch {
        setAudioError("Lỗi khi sử dụng chức năng đọc văn bản")
      }
    }
    
    // Fall back to audio URL if available
    if (exercise.metadata.audioUrl) {
      try {
        const audio = new Audio(exercise.metadata.audioUrl)
        audio.onended = () => setIsPlaying(false)
        audio.onerror = () => {
          setAudioError("Không thể phát file âm thanh")
          setIsPlaying(false)
        }
        
        audio.play()
              .then(() => {
                setIsPlaying(true)
                setAudioError(null)
              })
          .catch(() => {
                setAudioError("Không thể phát file âm thanh")
                setIsPlaying(false)
              })
      } catch {
        setAudioError("Lỗi khi phát âm thanh")
        setIsPlaying(false)
      }
    } else {
      setAudioError("Không có dữ liệu âm thanh cho bài tập này")
    }
  }

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
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
      
      <CardContent className="p-6 sm:p-8 relative">
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 leading-relaxed">{exercise.question}</h2>
            {!isSpeechSynthesisAvailable && <p className="text-sm text-amber-600 mt-2">Trình duyệt của bạn không hỗ trợ chức năng đọc văn bản.</p>}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-md mx-auto"
          >
            <div className="p-6 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/70 shadow-sm">
                <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-400 to-blue-500 shimmer rounded-full flex items-center justify-center shadow-md">
                  <Volume2 className="w-8 h-8 text-white" />
                  </div>
                  <Button
                    onClick={handlePlayAudio}
                  disabled={(!textToSpeak && !exercise.metadata.audioUrl) || !!audioError}
                  className={`w-full py-3 font-medium rounded-lg transition-all shadow-sm ${
                    isPlaying 
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow shimmer" 
                      : (!textToSpeak && !exercise.metadata.audioUrl) || !!audioError
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow shimmer"
                  }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Dừng
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Nghe
                      </>
                    )}
                  </Button>
                {audioError && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-rose-600 bg-rose-50 p-2 rounded-md"
                  >
                    {audioError}
                  </motion.p>
                )}
                </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-md mx-auto"
          >
            <Input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Nhập những gì bạn nghe được..."
              disabled={isSubmitted}
              className="text-center text-lg py-4 rounded-lg border-slate-200 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all shadow-sm"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </motion.div>

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
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white hover:shadow shimmer" 
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
