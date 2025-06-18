"use client"

import type React from "react"

import { ArrowLeft, BookOpen, Lock, Check, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CardContent, CardHeader } from "@/components/ui/card"
import { RippleButton } from "./components/ripple-button"
import { RippleCard } from "./components/ripple-card"
import { useRipple } from "./hooks/use-ripple"

export default function Component() {
  const createRipple = useRipple()

  const lessons = [
    {
      id: 1,
      title: "Hiragana - Nhóm A",
      description: "Học các ký tự Hiragana nhóm A: あ、い、う、え、お",
      progress: 100,
      status: "completed",
      duration: "15 phút",
      exercises: "15-20 phút",
    },
    {
      id: 2,
      title: "Hiragana - Nhóm K",
      description: "Học các ký tự Hiragana nhóm K: か、き、く、け、こ",
      progress: 100,
      status: "completed",
      duration: "15 phút",
      exercises: "15-20 phút",
    },
    {
      id: 3,
      title: "Hiragana - Nhóm S",
      description: "Học các ký tự Hiragana nhóm S: さ、し、す、せ、そ",
      progress: 0,
      status: "available",
      duration: "15 phút",
      exercises: "15-20 phút",
    },
    {
      id: 4,
      title: "Hiragana - Nhóm T",
      description: "Học các ký tự Hiragana nhóm T: た、ち、つ、て、と",
      progress: 0,
      status: "locked",
      duration: "15 phút",
      exercises: "15-20 phút",
    },
    {
      id: 5,
      title: "Hiragana - Nhóm N",
      description: "Học các ký tự Hiragana nhóm N: な、に、ぬ、ね、の",
      progress: 0,
      status: "locked",
      duration: "15 phút",
      exercises: "15-20 phút",
    },
  ]

  const handleLessonClick = (event: React.MouseEvent<HTMLDivElement>, lesson: any) => {
    if (lesson.status !== "locked") {
      createRipple(event)
      console.log(`Clicked on lesson: ${lesson.title}`)
    }
  }

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    createRipple(event)
    console.log("Progress clicked")
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50/30 to-blue-50/20">
      <div className="relative z-10 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div
            className="flex items-center gap-3 text-blue-600 mb-6 cursor-pointer relative overflow-hidden rounded-lg p-2 -m-2 transition-colors hover:bg-blue-50/50"
            onClick={createRipple}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Quay lại danh sách đơn vị</span>
          </div>

          {/* Main Course Card */}
          <RippleCard className="bg-white/90 backdrop-blur-sm border border-blue-100/30 shadow-sm relative overflow-hidden">
            <CardHeader className="pb-4 relative z-10">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 bg-gradient-to-br from-blue-400/80 to-cyan-400/80 rounded-xl flex items-center justify-center shadow-sm relative overflow-hidden cursor-pointer transition-transform hover:scale-105"
                  onClick={createRipple}
                >
                  <BookOpen className="w-6 h-6 text-white relative z-10" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">Bảng chữ cái Hiragana</h1>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Học bảng chữ cái Hiragana cơ bản - hệ thống ký tự đầu tiên bạn cần làm chủ để học tiếng Nhật. Mỗi
                    bài học sẽ tập trung vào một nhóm ký tự.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Tiến độ học tập
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>2/10</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {/* Progress Bar */}
                  <div
                    className="relative h-2.5 bg-blue-50/50 rounded-full overflow-hidden cursor-pointer transition-transform hover:scale-105"
                    onClick={handleProgressClick}
                  >
                    <div
                      className="relative h-full bg-gradient-to-r from-blue-300/80 via-cyan-300/80 to-blue-400/80 rounded-full transition-all duration-1000 ease-out overflow-hidden"
                      style={{ width: "20%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>20% hoàn thành</span>
                    <span>8 bài học còn lại</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </RippleCard>

          {/* Lessons List */}
          <RippleCard
            className="bg-white/90 backdrop-blur-sm border border-blue-50/50 shadow-sm relative overflow-hidden"
            enableRipple={false}
          >
            <CardHeader className="pb-4 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer transition-transform hover:scale-110"
                    onClick={createRipple}
                  >
                    <BookOpen className="w-4 h-4 text-white relative z-10" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">Danh sách bài học</h2>
                </div>
                <span className="text-sm text-blue-600 font-medium">10 bài học</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-4 p-4 rounded-xl bg-white border border-blue-50/30 hover:shadow-sm transition-all duration-300 relative overflow-hidden group ${
                    lesson.status !== "locked" ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                  }`}
                  onClick={(e) => handleLessonClick(e, lesson)}
                >
                  <div className="flex items-center gap-3 flex-1 relative z-10">
                    <div className="relative">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium text-lg shadow-sm relative overflow-hidden transition-transform hover:scale-105 ${
                          lesson.status === "completed"
                            ? "bg-gradient-to-br from-emerald-300/90 to-teal-300/90"
                            : lesson.status === "available"
                              ? "bg-gradient-to-br from-blue-300/90 to-cyan-300/90"
                              : "bg-gradient-to-br from-gray-200/90 to-gray-300/90"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (lesson.status !== "locked") {
                            createRipple(e)
                          }
                        }}
                      >
                        <div className="relative z-10">
                          {lesson.status === "completed" ? (
                            <Check className="w-6 h-6" />
                          ) : lesson.status === "locked" ? (
                            <Lock className="w-5 h-5" />
                          ) : (
                            <span>{index + 1}</span>
                          )}
                        </div>
                      </div>
                      {index < lessons.length - 1 && (
                        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-blue-200 to-transparent"></div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{lesson.title}</h3>
                        <Badge
                          variant="secondary"
                          className="bg-blue-100 text-blue-700 text-xs cursor-pointer relative overflow-hidden transition-transform hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation()
                            createRipple(e)
                          }}
                        >
                          BEGINNER
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{lesson.description}</p>

                      {lesson.status !== "locked" && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              {lesson.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              {lesson.exercises}
                            </span>
                          </div>

                          {lesson.progress > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Tiến độ</span>
                                <span className="text-gray-600">{lesson.progress}%</span>
                              </div>
                              <div
                                className="relative h-2 bg-gray-100 rounded-full overflow-hidden cursor-pointer transition-transform hover:scale-105"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  createRipple(e)
                                }}
                              >
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full relative overflow-hidden transition-all duration-1000"
                                  style={{ width: `${lesson.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0 relative z-10">
                    {lesson.status === "completed" ? (
                      <Badge
                        className="bg-emerald-100 text-emerald-700 border-emerald-200 cursor-pointer relative overflow-hidden transition-transform hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation()
                          createRipple(e)
                        }}
                      >
                        <div className="flex items-center">
                          <BookOpen className="w-3 h-3 mr-1.5" />
                          Học lại
                        </div>
                      </Badge>
                    ) : lesson.status === "available" ? (
                      <RippleButton
                        size="sm"
                        className="bg-gradient-to-r from-blue-400/80 to-cyan-400/80 hover:from-blue-500/80 hover:to-cyan-500/80 text-white shadow-sm font-medium"
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log(`Starting lesson: ${lesson.title}`)
                        }}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Bắt đầu
                      </RippleButton>
                    ) : (
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </RippleCard>
        </div>
      </div>
    </div>
  )
}
