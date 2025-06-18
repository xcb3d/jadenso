'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSession } from 'next-auth/react';
import { redirect, useParams } from 'next/navigation';
import { MultipleChoiceExercise } from '@/components/exercises/multiple-choice-exercise';
import { FillInBlankExercise } from '@/components/exercises/fill-in-blank-exercise';
import { TranslationExercise } from '@/components/exercises/translation-exercise';
import { ListeningExercise } from '@/components/exercises/listening-exercise';
import { SpeakingExercise } from '@/components/exercises/speaking-exercise';
import { MatchingExercise } from '@/components/exercises/matching-exercise';
import { MainLayout } from '@/components/layout/main-layout';
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ExerciseType } from '@/models/Exercise';
import { decrypt } from '@/lib/encryption';

interface ExerciseSession {
  _id: string;
  title: string;
  description: string;
  exerciseCount: number;
  proficiencyLevel: string;
  createdAt: string;
  updatedAt: string;
  vocabulary: string;
}

interface Exercise {
  _id: string;
  sessionId: string;
  userId: string;
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
    imageUrl?: string;
    [key: string]: string | number | boolean | undefined;
  };
  createdAt: string;
  updatedAt: string;
}

interface ExerciseResult {
  exercise: Exercise;
  userAnswer: string;
  isCorrect: boolean;
}

export default function SessionPracticePage() {
  const { status } = useSession();
  const params = useParams();
  const sessionId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<ExerciseSession | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);
  const [completed, setCompleted] = useState<boolean>(false);
  const [score, setScore] = useState<{ correct: number, total: number }>({ correct: 0, total: 0 });
  const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([]);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<ExerciseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
    
    if (status === 'authenticated') {
      loadSession();
    }
  }, [status, sessionId]);

  const loadSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/exercises/sessions/${sessionId}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to load session');
      }
      
      const encryptedData = await response.json();
      
      // Decrypt the data
      if (encryptedData.data && encryptedData.key) {
        const decryptedData = decrypt(encryptedData.data, encryptedData.key) as {
          session: ExerciseSession;
          exercises: Exercise[];
        };
        
        if (decryptedData) {
          setSession(decryptedData.session);
          setExercises(decryptedData.exercises);
        } else {
          throw new Error('Failed to decrypt session data');
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error loading session:', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExerciseSubmit = (answer: string, isCorrect: boolean) => {
    const currentExercise = exercises[currentExerciseIndex];
    const result = {
      exercise: currentExercise,
      userAnswer: answer,
      isCorrect
    };

    // Update results array
    setExerciseResults(prev => [...prev, result]);
    setCurrentResult(result);
    
    // Update score
    if (isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
    }
    setScore(prev => ({ ...prev, total: prev.total + 1 }));

    // Show feedback
    setShowFeedback(true);
  };

  const continueToNext = () => {
    setShowFeedback(false);
    
    // Move to next exercise or finish
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
    } else {
      setCompleted(true);
    }
  };

  const resetExercises = () => {
    setCurrentExerciseIndex(0);
    setCompleted(false);
    setScore({ correct: 0, total: 0 });
    setExerciseResults([]);
    setShowFeedback(false);
    setCurrentResult(null);
  };

  const renderExercise = (exercise: Exercise) => {
    switch (exercise.type) {
      case 'multiple_choice':
        return <MultipleChoiceExercise exercise={exercise} onSubmit={handleExerciseSubmit} />;
      case 'fill_in_the_blank':
        return <FillInBlankExercise exercise={exercise} onSubmit={handleExerciseSubmit} />;
      case 'translation':
        return <TranslationExercise exercise={exercise} onSubmit={handleExerciseSubmit} />;
      case 'listening':
        return <ListeningExercise exercise={exercise} onSubmit={handleExerciseSubmit} />;
      case 'speaking':
        return <SpeakingExercise exercise={exercise} onSubmit={handleExerciseSubmit} />;
      case 'matching':
        return <MatchingExercise exercise={exercise} onSubmit={handleExerciseSubmit} />;
      default:
        return <div>Unsupported exercise type: {exercise.type}</div>;
    }
  };
  
  // Format matching exercise answer for display
  const formatMatchingAnswer = (answer: string, exercise: Exercise): string => {
    if (exercise.type !== 'matching' || !exercise.options) {
      return answer;
    }
    
    try {
      // Parse the answer JSON if it's in JSON format
      const answerObj = answer.startsWith('{') ? JSON.parse(answer) : null;
      if (!answerObj) {
        return answer; // Not a JSON object, return as is
      }
      
      // Extract left and right items from options
      const optionsMap: Record<string, {left: string, right: string}> = {};
      exercise.options.forEach((option, index) => {
        const parts = option.split(' - ');
        if (parts.length === 2) {
          const leftKey = `L${index}`;
          optionsMap[leftKey] = {left: parts[0], right: parts[1]};
          optionsMap[`R${index}`] = {left: parts[0], right: parts[1]};
        }
      });
      
      // Format the matches based on user's answer
      const formattedMatches: string[] = [];
      Object.entries(answerObj).forEach(([leftKey, rightKey]) => {
        const leftItem = optionsMap[leftKey]?.left || leftKey;
        const rightItem = optionsMap[`R${(rightKey as string).substring(1)}`]?.right || rightKey;
        formattedMatches.push(`${leftItem} - ${rightItem}`);
      });
      
      return formattedMatches.join('\n');
      
    } catch (error) {
      console.error("Error formatting matching answer:", error);
      return answer;
    }
  };
  
  // Format correct answer for matching exercises
  const formatCorrectMatchingAnswer = (correctAnswer: string, exercise: Exercise): string => {
    if (exercise.type !== 'matching') {
      return correctAnswer;
    }
    
    try {
      // Correct answer format might be "leftItem:rightItem,leftItem:rightItem"
      const pairs = correctAnswer.split(',');
      return pairs.map(pair => {
        const [left, right] = pair.split(':');
        return `${left} - ${right}`;
      }).join('\n');
      
    } catch (error) {
      console.error("Error formatting correct matching answer:", error);
      return correctAnswer;
    }
  };
  
  const renderFeedback = (result: ExerciseResult) => {
    // Format user answer and correct answer based on exercise type
    const formattedUserAnswer = result.exercise.type === 'matching' 
      ? formatMatchingAnswer(result.userAnswer, result.exercise)
      : result.userAnswer;
      
    const formattedCorrectAnswer = result.exercise.type === 'matching'
      ? formatCorrectMatchingAnswer(result.exercise.correctAnswer, result.exercise)
      : result.exercise.correctAnswer;
      
    return (
      <Card className="w-full my-4 shadow-md overflow-hidden border-0">
        <CardHeader className={result.isCorrect 
          ? "bg-gradient-to-r from-emerald-50 to-emerald-100 border-b border-emerald-200" 
          : "bg-gradient-to-r from-rose-50 to-rose-100 border-b border-rose-200"
        }>
          <div className="flex items-center">
            {result.isCorrect ? (
              <CheckCircle2 className="text-emerald-600 mr-3 h-6 w-6" />
            ) : (
              <XCircle className="text-rose-600 mr-3 h-6 w-6" />
            )}
            <CardTitle className={result.isCorrect ? "text-emerald-800" : "text-rose-800"}>
              {result.isCorrect ? "Chính xác!" : "Không chính xác"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-5 px-5">
          <div className="space-y-4">
          <div>
              <p className="font-semibold text-slate-800 mb-1.5">Câu hỏi:</p>
              <p className="mb-3 text-slate-700 bg-slate-50/50 p-3 rounded-md border border-slate-100">{result.exercise.question}</p>
            </div>
            
            <div>
              <p className="font-semibold text-slate-800 mb-1.5">Câu trả lời của bạn:</p>
              <pre className="mb-3 whitespace-pre-wrap bg-slate-50 p-3 rounded-md border border-slate-100 text-slate-700 font-sans">
              {formattedUserAnswer}
            </pre>
            </div>
            
            {!result.isCorrect && (
              <div>
                <p className="font-semibold text-emerald-700 mb-1.5">Đáp án đúng:</p>
                <pre className="mb-3 whitespace-pre-wrap bg-emerald-50 p-3 rounded-md border border-emerald-100 text-emerald-800 font-sans">
                  {formattedCorrectAnswer}
                </pre>
              </div>
            )}
            
            {result.exercise.explanation && (
              <div className="bg-blue-50 border-l-4 border-blue-300 p-4 rounded-md">
                <p className="font-semibold text-blue-800 mb-1.5">Giải thích:</p>
                <p className="text-blue-700">{result.exercise.explanation}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-4">
          <Button 
            onClick={continueToNext} 
            className={`w-full shadow-sm ${
              currentExerciseIndex < exercises.length - 1 
                ? "bg-blue-600 hover:bg-blue-700" 
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {currentExerciseIndex < exercises.length - 1 ? (
              <>
                Tiếp tục <ChevronRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              'Kết thúc'
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  // Calculate statistics for summary
  const calculateStatistics = () => {
    if (exerciseResults.length === 0) return null;
    
    const typeStats: Record<string, { correct: number, total: number }> = {};
    const difficultyCounts: Record<string, number> = {};
    
    exerciseResults.forEach(result => {
      // Track exercise type stats
      const type = result.exercise.type.replace('_', ' ');
      if (!typeStats[type]) {
        typeStats[type] = { correct: 0, total: 0 };
      }
      
      if (result.isCorrect) {
        typeStats[type].correct += 1;
      }
      typeStats[type].total += 1;
      
      // Track difficult questions (incorrect answers)
      if (!result.isCorrect) {
        const difficulty = result.exercise.difficulty || 'unknown';
        difficultyCounts[difficulty] = (difficultyCounts[difficulty] || 0) + 1;
      }
    });
    
    return {
      typeStats,
      difficultyCounts
    };
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="text-center py-12">
            <div className="spinner mb-4"></div>
            <p>Đang tải phiên tập luyện...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardHeader>
              <CardTitle>Lỗi</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-500">{error}</p>
            </CardContent>
            <CardFooter>
              <Link href="/exercises/sessions">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!session || exercises.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <Card>
            <CardHeader>
              <CardTitle>Không có bài tập</CardTitle>
              <CardDescription>Không tìm thấy bài tập trong phiên này</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Hãy tạo bài tập mới để bắt đầu luyện tập</p>
            </CardContent>
            <CardFooter>
              <Link href="/exercises/generate">
                <Button>Tạo bài tập</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
          <h1 className="text-2xl font-bold">{session.title}</h1>
            {session.description && (
              <p className="text-slate-600 mt-1">{session.description}</p>
            )}
          </div>
          <Link href="/exercises/sessions">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Danh sách phiên
            </Button>
          </Link>
        </div>

        {completed ? (
          <Card className="w-full max-w-3xl mx-auto shadow-md border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-blue-600" />
                </div>
                <div>
              <CardTitle>Đã hoàn thành!</CardTitle>
                  <CardDescription className="text-slate-600">
                Đã hoàn thành {exercises.length} bài tập
              </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="mb-4 bg-white p-5 rounded-lg shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xl font-semibold">Điểm số: {score.correct} / {score.total}</p>
                  <span className="text-2xl font-bold text-blue-600">
                    {Math.round((score.correct / score.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4 mt-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-4 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2" 
                    style={{ width: `${((score.correct) / score.total) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">
                      {score.correct}/{score.total}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Performance by exercise type */}
              {calculateStatistics() && (
                <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-100">
                  <h3 className="font-bold text-lg mb-4">Kết quả theo loại bài tập</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(calculateStatistics()!.typeStats).map(([type, stats]) => (
                      <div key={type} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                          <span className="font-medium capitalize">{type}</span>
                          <span className="text-sm text-slate-500 ml-2">
                            ({stats.correct}/{stats.total})
                          </span>
                        </div>
                        <div className="w-32 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                      </div>
              )}
            </CardContent>
            <CardFooter className="bg-slate-50 p-6 border-t border-slate-100">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Button 
                  onClick={resetExercises} 
                  className="flex-1 bg-slate-700 hover:bg-slate-800"
                >
                  <RotateCcw className="mr-2" size={16} />
                  Luyện tập lại
                </Button>
                <Link href="/exercises/generate" className="flex-1">
                  <Button variant="outline" className="w-full border-slate-300 hover:bg-slate-100">
                    Tạo bài tập mới
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        ) : showFeedback && currentResult ? (
          renderFeedback(currentResult)
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 bg-white p-5 rounded-lg shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-3">
                <p className="font-medium">Bài tập {currentExerciseIndex + 1} / {exercises.length}</p>
                <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {exercises[currentExerciseIndex]?.type.replace('_', ' ')}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${((currentExerciseIndex + 1) / exercises.length) * 100}%` }}
                ></div>
              </div>
            </div>
            {exercises[currentExerciseIndex] && renderExercise(exercises[currentExerciseIndex])}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
