"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import type { PlainExercise } from "@/models/PlainTypes"
import { Mic, Square, CheckCircle, SkipForward, Loader2, AlertCircle, XCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface SpeakingExerciseProps {
  exercise: PlainExercise
  onSubmit: (answer: string, isCorrect: boolean, timeSpent: number) => void
}

// Khai báo kiểu cho SpeechRecognition không có sẵn trong TypeScript
interface IWindow extends Window {
  webkitSpeechRecognition?: new () => SpeechRecognition;
  SpeechRecognition?: new () => SpeechRecognition;
}

// Định nghĩa interface cho SpeechRecognition
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
}

// Định nghĩa interface cho SpeechRecognitionEvent
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

// Định nghĩa interface cho SpeechRecognitionResultList
interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export function SpeakingExercise({ exercise, onSubmit }: SpeakingExerciseProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [allowSkip, setAllowSkip] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false) 
  const [error, setError] = useState<string | null>(null)
  const [isRecordingSupported, setIsRecordingSupported] = useState(true)
  const [recognizedText, setRecognizedText] = useState<string>("")
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [isRecognitionSupported, setIsRecognitionSupported] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Check if recording and speech recognition are supported by the browser
  useEffect(() => {
    const checkSupport = () => {
      // Check recording support
      const isMediaDevicesSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const isMediaRecorderSupported = typeof window !== 'undefined' && 'MediaRecorder' in window;

      if (!isMediaDevicesSupported || !isMediaRecorderSupported) {
        setIsRecordingSupported(false);
        setError('Trình duyệt của bạn không hỗ trợ thu âm. Vui lòng sử dụng Chrome, Firefox, hoặc Edge mới hơn.');
      }

      // Check speech recognition support
      const isSpeechRecognitionSupported = !!(
        (window as IWindow).SpeechRecognition || 
        (window as IWindow).webkitSpeechRecognition
      );
      setIsRecognitionSupported(isSpeechRecognitionSupported);
    };

    checkSupport();
  }, []);

  // Reset state when exercise changes
  useEffect(() => {
    setIsRecording(false)
    setIsSubmitted(false)
    setRecordingTime(0)
    setStartTime(Date.now())
    setAllowSkip(false)
    setIsLoading(false)
    setIsProcessing(false) 
    setError(null)
    setRecognizedText("")
    setAccuracy(null)

    // Không reset audioUrl khi exercise thay đổi để tránh mất âm thanh khi người dùng đang nghe

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      
      // Chỉ xóa audioUrl khi component unmount
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
      
      // Đảm bảo dừng stream nếu còn
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }

      // Dừng speech recognition nếu đang chạy
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    }
  }, [exercise._id])

  // Set timer for skip button
  useEffect(() => {
    const timer = setTimeout(() => {
      setAllowSkip(true)
    }, 15000)

    return () => clearTimeout(timer)
  }, [])

  // Tính độ chính xác giữa văn bản nhận dạng và câu trả lời đúng
  const calculateAccuracy = (recognized: string, correct: string): number => {
    if (!recognized || !correct) return 0;

    // Chuẩn hóa cả hai chuỗi để so sánh
    const normalizedRecognized = recognized.toLowerCase().trim()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "") // Loại bỏ dấu câu
      .replace(/\s+/g, " ");  // Chuẩn hóa khoảng trắng
    
    const normalizedCorrect = correct.toLowerCase().trim()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "") 
      .replace(/\s+/g, " ");
      
    // Sử dụng khoảng cách Levenshtein để so sánh độ tương đồng chuỗi
    // Đây là thuật toán đo khoảng cách chỉnh sửa giữa hai chuỗi
    const levenshteinDistance = (a: string, b: string): number => {
      const matrix: number[][] = [];

      // Khởi tạo ma trận
      for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
      }

      // Điền ma trận
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          const cost = a[j - 1] === b[i - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,      // Xóa
            matrix[i][j - 1] + 1,      // Chèn
            matrix[i - 1][j - 1] + cost // Thay thế
          );
        }
      }

      return matrix[b.length][a.length];
    };

    // Đối với tiếng Nhật, có thể chia câu thành từng ký tự để so sánh tốt hơn
    // vì nhận dạng giọng nói có thể bỏ qua một số ký tự hoặc thêm vào ký tự khác
    const distance = levenshteinDistance(normalizedRecognized, normalizedCorrect);
    
    // Tính độ chính xác dựa trên khoảng cách Levenshtein
    // Số càng nhỏ càng giống nhau, 0 là giống hoàn toàn
    const maxLength = Math.max(normalizedRecognized.length, normalizedCorrect.length);
    if (maxLength === 0) return 0;
    
    // Công thức: (1 - khoảng_cách/độ_dài_tối_đa) * 100
    const similarityScore = (1 - distance / maxLength) * 100;
    
    // Áp dụng trọng số và cân chỉnh để kết quả phản ánh chính xác hơn
    // cho tiếng Nhật và có khả năng khoan dung với lỗi nhỏ
    const weightedScore = Math.max(0, similarityScore * 1.2);
    
    return Math.min(100, Math.round(weightedScore));
  };

  // Xác định xem câu trả lời có đúng không dựa trên độ chính xác
  const determineCorrectness = (accuracyValue: number): boolean => {
    // Với tiếng Nhật, yêu cầu độ chính xác thấp hơn vì nhận dạng giọng nói 
    // có thể khó khăn hơn với ngôn ngữ này
    return accuracyValue >= 50; // Ngưỡng 50% để coi là đúng
  };

  // Khởi tạo speech recognition để nhận dạng giọng nói
  const initSpeechRecognition = () => {
    if (!isRecognitionSupported) return;

    const SpeechRecognitionClass = (window as IWindow).SpeechRecognition || (window as IWindow).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;
    
    const recognition = new SpeechRecognitionClass();
    
    // Cấu hình recognition
    recognition.lang = 'ja-JP'; // Tiếng Nhật
    recognition.continuous = true; // Tiếp tục nhận dạng cho đến khi dừng
    recognition.interimResults = true; // Kết quả tạm thời
    
    // Xử lý kết quả
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = Array.from({ length: event.results.length }, (_, i) => event.results[i]);
      const transcript = results
        .map(result => result[0].transcript)
        .join("");
      
      setRecognizedText(transcript);
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.log("Speech recognition error", event.error);
      // Không hiển thị lỗi cho người dùng vì không ảnh hưởng đến chức năng chính
    };
    
    recognitionRef.current = recognition;
    return recognition;
  };

  // Start recording function
  const handleStartRecording = async () => {
    // Reset error state and audio URL
    setError(null);
    setRecognizedText("");
    setAccuracy(null);
    
    // Xóa bỏ audio trước đó nếu có
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    
    if (!isRecordingSupported) {
      setError('Trình duyệt của bạn không hỗ trợ thu âm.');
      return;
    }
    
    try {
      setIsLoading(true)
      
      // Request audio permission with specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Lưu stream để có thể dọn dẹp sau
      streamRef.current = stream;
      
      // Determine supported MIME types
      let mimeType = 'audio/webm';
      
      // Check if the browser supports the WebM format
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }
      
      // Initialize MediaRecorder with options
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000
      });
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      // Khởi động speech recognition nếu được hỗ trợ
      if (isRecognitionSupported) {
        const recognition = initSpeechRecognition();
        if (recognition) {
          recognition.start();
        }
      }

      // Set up event handlers
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
        audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        setIsProcessing(true); // Bắt đầu xử lý âm thanh
        
        // Dừng speech recognition
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        
        // Sử dụng timeout để đảm bảo có đủ thời gian cho việc xử lý dữ liệu
        setTimeout(() => {
          if (audioChunksRef.current.length === 0) {
            setError('Không thu được âm thanh. Vui lòng kiểm tra micro và thử lại.');
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop());
              streamRef.current = null;
            }
            setIsProcessing(false);
            setIsLoading(false);
            return;
          }
          
          try {
            const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            
            // Tính độ chính xác nếu có nhận dạng văn bản
            if (recognizedText) {
              const accuracyValue = calculateAccuracy(recognizedText, exercise.correctAnswer);
              setAccuracy(accuracyValue);
            }
          } catch {
            setError('Không thể tạo file âm thanh. Vui lòng thử lại.');
          } finally {
            if (streamRef.current) {
              streamRef.current.getTracks().forEach((track) => track.stop());
              streamRef.current = null;
            }
            setIsProcessing(false);
            setIsLoading(false);
          }
        }, 500); // Đợi 500ms để đảm bảo dữ liệu âm thanh đã được xử lý
      }

      mediaRecorder.onerror = () => {
        setError('Lỗi xảy ra khi ghi âm. Vui lòng thử lại.');
        setIsProcessing(false);
        setIsLoading(false);
        
        if (recognitionRef.current) {
          recognitionRef.current.abort();
        }
      };

      // Start recording with 1 second timeslices to ensure data is collected
      mediaRecorder.start(1000)
      setIsRecording(true)
      setIsLoading(false)

      // Set up timer for recording duration
      let seconds = 0
      timerRef.current = setInterval(() => {
        seconds += 1
        setRecordingTime(seconds)

        if (seconds >= 30) {
          handleStopRecording()
        }
      }, 1000)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setError('Bạn đã từ chối quyền truy cập microphone. Vui lòng cấp quyền truy cập micro từ cài đặt trình duyệt.');
      } else if (error instanceof DOMException && error.name === 'NotFoundError') {
        setError('Không tìm thấy thiết bị thu âm. Vui lòng kết nối microphone và thử lại.');
      } else {
        setError('Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập và thử lại.');
      }
      setIsLoading(false);
      setIsProcessing(false);
    }
  }

  // Stop recording function
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        setIsProcessing(true); // Đánh dấu là đang xử lý
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        }
      } catch {
        setError('Lỗi khi dừng ghi âm. Vui lòng làm mới trang và thử lại.');
        setIsProcessing(false);
      }
    }
  }

  // Submit recording
  const handleSubmit = () => {
    // Sử dụng độ chính xác từ nhận dạng giọng nói nếu có
    let isCorrect = true;
    if (accuracy !== null) {
      isCorrect = determineCorrectness(accuracy);
    }
    
    const timeSpent = Math.round((Date.now() - startTime) / 1000)

    setIsSubmitted(true)
    
    // Gửi cả văn bản nhận dạng và URL âm thanh
    const answer = recognizedText || audioUrl || "";
    onSubmit(answer, isCorrect, timeSpent)
  }

  // Skip exercise
  const handleSkip = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    setIsSubmitted(true)
    onSubmit("skipped", true, timeSpent)
  }

  // Handle reset recording
  const handleResetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecognizedText("");
    setAccuracy(null);
  }

  // Xác định trạng thái chính xác dựa trên độ chính xác
  const getAccuracyStatus = () => {
    if (accuracy === null) return null;
    if (accuracy >= 80) return "high";
    if (accuracy >= 60) return "medium";
    return "low";
  }

  // Hiển thị thông báo độ chính xác
  const getAccuracyMessage = () => {
    const status = getAccuracyStatus();
    if (status === "high") return "Rất tốt! Phát âm của bạn rất chính xác.";
    if (status === "medium") return "Khá tốt! Phát âm của bạn tương đối chính xác.";
    return "Cần cải thiện. Hãy tiếp tục luyện tập phát âm.";
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-200/30 to-blue-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-200/20 to-blue-200/20 rounded-full translate-y-12 -translate-x-12 floating-orb-slow"></div>
      
      <CardContent className="p-6 sm:p-8 relative">
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto"
          >
            <div className="p-6 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200/70 shadow-sm transition-all hover:shadow-md">
              <div className="text-center space-y-4">
                <p className="text-lg font-semibold text-slate-700">Đọc to câu sau:</p>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-lg border border-slate-200/70 shadow-sm"
                >
                  <p className="text-xl text-slate-800 font-medium leading-relaxed">&quot;{exercise.correctAnswer}&quot;</p>
                </motion.div>

                {/* Use either audioUrl or audioText for sample pronunciation */}
                {(exercise.metadata.audioUrl || exercise.metadata.audioText) && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="pt-4 border-t border-slate-200"
                  >
                    <p className="text-sm text-slate-600 mb-3">Mẫu phát âm:</p>
                    {exercise.metadata.audioUrl ? (
                    <audio controls src={exercise.metadata.audioUrl} className="w-full max-w-sm mx-auto">
                      Trình duyệt của bạn không hỗ trợ phát âm thanh.
                    </audio>
                    ) : exercise.metadata.audioText ? (
                      <Button 
                        className="w-full max-w-sm mx-auto py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow shimmer"
                        onClick={() => {
                          if ('speechSynthesis' in window) {
                            const utterance = new SpeechSynthesisUtterance(exercise.metadata.audioText);
                            utterance.lang = 'ja-JP';
                            window.speechSynthesis.speak(utterance);
                          }
                        }}
                      >
                        Nghe mẫu phát âm
                      </Button>
                    ) : null}
                  </motion.div>
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
            <div className="text-center space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Ghi âm của bạn</span>
                <span className={isRecording ? "text-rose-600 font-medium" : ""}>{recordingTime}s</span>
              </div>

              {/* Show error message if any */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-gradient-to-r from-rose-50 to-red-50/50 border border-rose-200 rounded-lg text-sm text-rose-600 flex items-start gap-2 shadow-sm"
                >
                  <div className="p-1 rounded-full bg-rose-100 flex-shrink-0">
                    <AlertCircle className="w-3 h-3 text-rose-500" />
                  </div>
                  <p>{error}</p>
                </motion.div>
              )}

              {!isRecordingSupported ? (
                <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50/50 border border-amber-200 rounded-lg shadow-sm">
                  <p className="text-sm text-amber-700">Trình duyệt của bạn không hỗ trợ thu âm. Vui lòng sử dụng Chrome, Firefox hoặc Edge phiên bản mới nhất.</p>
                </div>
              ) : isProcessing ? (
                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/70 shadow-sm flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shimmer flex items-center justify-center mr-3">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                  <p className="text-slate-700 font-medium">Đang xử lý âm thanh...</p>
                </div>
              ) : !audioUrl ? (
                <div className="space-y-4">
                  {!isRecording ? (
                    <Button
                      onClick={handleStartRecording}
                      className={`w-full py-6 rounded-lg transition-all shadow-sm ${
                        isLoading || !isRecordingSupported
                          ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow shimmer"
                      }`}
                      disabled={isLoading || !isRecordingSupported}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                          Đang chuẩn bị...
                        </>
                      ) : (
                        <>
                          <div className="p-1.5 rounded-full bg-white/20 mr-3">
                            <Mic className="w-5 h-5" />
                          </div>
                      Bắt đầu ghi âm
                        </>
                      )}
                    </Button>
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                    <Button
                      onClick={handleStopRecording}
                      className="w-full py-6 bg-gradient-to-r from-rose-500 to-red-500 text-white hover:shadow shimmer rounded-lg shadow-sm"
                        disabled={isProcessing}
                    >
                      <div className="p-1.5 rounded-full bg-white/20 mr-3">
                        <Square className="w-5 h-5" />
                      </div>
                      Dừng ghi âm
                    </Button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200/70 shadow-sm"
                >
                  {/* Hiển thị audio player */}
                  <audio controls src={audioUrl} className="w-full">
                    Trình duyệt của bạn không hỗ trợ phát âm thanh.
                  </audio>
                  
                  {/* Hiển thị kết quả nhận dạng giọng nói nếu có */}
                  {recognizedText && (
                    <div className="mt-3 p-3 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-lg border border-slate-200/70 shadow-sm">
                      <p className="text-sm text-slate-600 mb-1">Giọng nói được nhận dạng:</p>
                      <p className="text-slate-800 font-medium">{recognizedText}</p>
                      
                      {accuracy !== null && (
                        <div className="mt-2 pt-2 border-t border-slate-200/70">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Độ chính xác:</span>
                            <span className={`text-sm font-medium ${
                              accuracy >= 80 ? "text-emerald-600" : 
                              accuracy >= 60 ? "text-amber-600" : 
                              "text-rose-600"
                            }`}>
                              {accuracy}%
                            </span>
                          </div>
                          <div className="mt-1 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full shimmer ${
                                accuracy >= 80 ? "bg-gradient-to-r from-emerald-400 to-teal-500" : 
                                accuracy >= 60 ? "bg-gradient-to-r from-amber-400 to-yellow-500" : 
                                "bg-gradient-to-r from-rose-400 to-red-500"
                              }`}
                              style={{ width: `${accuracy}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {!isSubmitted && (
                    <Button
                      onClick={handleResetRecording}
                      className="mt-3 text-sm text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg"
                    >
                      Ghi lại
                    </Button>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>

          <AnimatePresence>
          {isSubmitted && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-lg mx-auto"
              >
                {(accuracy === null || accuracy >= 60) ? (
                <div className="flex items-start gap-3 p-5 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200 shadow-sm">
                  <div className="p-1.5 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 shimmer flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                <div className="space-y-2">
                    <p className="font-medium text-emerald-800 text-lg">Tuyệt vời!</p>
                      {accuracy !== null && (
                        <p className="text-sm text-emerald-700 leading-relaxed">
                          {getAccuracyMessage()}
                        </p>
                      )}
                  <p className="text-sm text-emerald-700 leading-relaxed">Tiếp tục luyện tập để phát âm tốt hơn.</p>
                  {exercise.explanation && (
                    <p className="text-sm text-emerald-700 leading-relaxed">{exercise.explanation}</p>
                  )}
                </div>
              </div>
                ) : (
                  <div className="flex items-start gap-3 p-5 rounded-lg bg-gradient-to-br from-amber-50 to-yellow-50/50 border border-amber-200 shadow-sm">
                    <div className="p-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 shimmer flex-shrink-0">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-amber-800 text-lg">Cần cải thiện</p>
                      <p className="text-sm text-amber-700 leading-relaxed">
                        {getAccuracyMessage()} Hãy thử lại và tập trung vào phát âm rõ ràng các từ.
                      </p>
                      <p className="text-sm text-amber-700 leading-relaxed">
                        Đáp án đúng: <span className="font-medium">{exercise.correctAnswer}</span>
                      </p>
                      <p className="text-sm text-amber-700 leading-relaxed">
                        Nhận dạng: <span className="font-medium">{recognizedText}</span>
                      </p>
                      {exercise.explanation && (
                        <p className="text-sm text-amber-700 leading-relaxed">{exercise.explanation}</p>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
          )}
          </AnimatePresence>

          <div className="flex justify-center gap-4">
            <AnimatePresence>
            {allowSkip && !isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Button 
                    variant="ghost" 
                    onClick={handleSkip} 
                    className="text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg"
                  >
                <SkipForward className="w-4 h-4 mr-2" />
                Bỏ qua
              </Button>
                </motion.div>
            )}
            </AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
            <Button
              onClick={handleSubmit}
              disabled={!audioUrl || isSubmitted}
                className={`px-8 py-2.5 font-medium rounded-lg transition-all shadow-sm ${
                  isSubmitted || !audioUrl
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed" 
                    : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white hover:shadow shimmer"
                }`}
            >
              {isSubmitted ? "Đã hoàn thành" : "Hoàn thành"}
            </Button>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
