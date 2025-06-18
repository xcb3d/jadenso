'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Mic, Volume2, PlayCircle, RotateCcw, Share2, Square, Loader2 } from 'lucide-react';
import { SpeakingExercise } from '@/models/SpeakingExercise';
import { useToast } from '@/components/ui/use-toast';
import { FeedbackResults } from './FeedbackResults';

interface SpeakingExercisePracticeProps {
  exercise: SpeakingExercise;
}

interface FeedbackData {
  transcription: string;
  score: number;
  accuracy: number;
  pitchAccent: number;
  rhythm: number;
  fluency: number;
  feedback: {
    friendlyComment: string;
    strengths: string[];
    weaknesses: string[];
    improvementTips: string[];
    comparison: string;
  };
  success: boolean;
}

export function SpeakingExercisePractice({ exercise }: SpeakingExercisePracticeProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const { toast } = useToast();

  // Play reference audio if available
  const playReferenceAudio = () => {
    if (exercise.audioUrl) {
      const audio = new Audio(exercise.audioUrl);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: 'Lỗi phát âm thanh',
          description: 'Không thể phát âm thanh tham khảo',
          variant: 'destructive',
        });
      });
    }
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const audioURL = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioURL(audioURL);

        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: 'Lỗi truy cập microphone',
        description: 'Không thể truy cập vào microphone của bạn',
        variant: 'destructive',
      });
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Reset recording
  const resetRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioBlob(null);
    setAudioURL(null);
    setFeedbackData(null);
  };

  // Play recorded audio
  const playRecordedAudio = () => {
    if (audioURL) {
      const audio = new Audio(audioURL);
      audio.play().catch(error => {
        console.error('Error playing recorded audio:', error);
      });
    }
  };

  // Submit recording for analysis
  const submitRecording = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      const base64Audio = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert audio to base64'));
          }
        };
        reader.onerror = () => reject(reader.error);
      });

      // Send to API
      const response = await fetch('/api/speech-recognition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioBase64: base64Audio,
          targetText: exercise.text,
          difficultyLevel: exercise.difficulty,
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setFeedbackData(data);
    } catch (error) {
      console.error('Error submitting audio:', error);
      toast({
        title: 'Lỗi phân tích phát âm',
        description: 'Không thể phân tích bản ghi âm của bạn',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-0 shadow-md overflow-hidden bg-gradient-to-br from-white to-indigo-50/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
        <CardHeader className="border-b border-indigo-100/30 bg-white/70 relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">Bài tập phát âm</CardTitle>
              <CardDescription className="text-slate-600">Luyện tập phát âm chính xác</CardDescription>
            </div>
            <Badge className={`
              ${exercise.difficulty === 'beginner' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : ''}
              ${exercise.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-800 border-amber-200' : ''}
              ${exercise.difficulty === 'advanced' ? 'bg-red-100 text-red-800 border-red-200' : ''}
              font-medium px-3 py-1.5
            `}>
              {exercise.difficulty === 'beginner' && 'Sơ cấp'}
              {exercise.difficulty === 'intermediate' && 'Trung cấp'}
              {exercise.difficulty === 'advanced' && 'Nâng cao'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10 pt-6">
          {/* Exercise content */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-lg border border-blue-100/50 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-700 mb-1">Văn bản tiếng Nhật</h3>
            <p className="text-3xl font-bold text-slate-900 mb-4">{exercise.text}</p>
            
            <h3 className="text-lg font-semibold text-slate-700 mb-1">Dịch nghĩa</h3>
            <p className="text-xl text-slate-700">{exercise.translation}</p>
          </div>

          {/* Audio controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-slate-900 flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-blue-100 text-blue-600">
                  <Volume2 className="h-4 w-4" />
                </span>
                Âm thanh mẫu
              </h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={playReferenceAudio}
                disabled={!exercise.audioUrl}
                className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
              >
                <Volume2 className="h-4 w-4" />
                Nghe mẫu
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="font-medium text-slate-900 flex items-center gap-2">
                <span className="p-1.5 rounded-md bg-indigo-100 text-indigo-600">
                  <Mic className="h-4 w-4" />
                </span>
                Bản thu của bạn
              </h3>
              <div className="flex gap-2">
                {audioURL ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={playRecordedAudio}
                      className="flex items-center gap-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      <PlayCircle className="h-4 w-4" />
                      Phát
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={resetRecording}
                      className="flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Thu lại
                    </Button>
                  </>
                ) : (
                  isRecording ? (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={stopRecording}
                      className="flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      <Square className="h-4 w-4" />
                      Dừng ghi âm
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      onClick={startRecording}
                      className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
                    >
                      <Mic className="h-4 w-4" />
                      Bắt đầu ghi âm
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Recorded audio section */}
          {audioURL && !feedbackData && (
            <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/50 rounded-lg shadow-sm">
              <p className="text-center mb-4 text-slate-700">
                Bạn đã thu âm xong! Hãy phát lại để nghe và nộp để nhận phản hồi.
              </p>
              <div className="flex justify-center">
                <Button 
                  onClick={submitRecording}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all shadow-md hover:shadow-lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Đang phân tích...
                    </>
                  ) : (
                    <>Nộp để nhận phản hồi</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Feedback results */}
          {feedbackData && <FeedbackResults feedback={feedbackData} targetText={exercise.text} />}
        </CardContent>
        <CardFooter className="border-t border-indigo-100/30 bg-white/70 flex justify-between relative z-10">
          <p className="text-sm text-slate-500">
            Thử nhiều lần để cải thiện phát âm của bạn
          </p>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
          >
            <Share2 className="h-4 w-4 mr-1" />
            Chia sẻ kết quả
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 