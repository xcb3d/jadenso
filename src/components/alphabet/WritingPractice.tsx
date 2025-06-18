"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WritingProgress } from "./WritingProgress";

interface WritingPracticeProps {
  character: string;
  onRecognitionResult?: (result: string, isCorrect: boolean) => void;
}

// Helper function để resize canvas
const resizeCanvas = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D | null
) => {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  
  // Thiết lập lại context sau khi resize
  if (context) {
    context.lineWidth = 8; // Reduced from 12 for better accuracy
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#000";
  }
};

export function WritingPractice({ character, onRecognitionResult }: WritingPracticeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  type DebugInfoType = {
    imagePreview: string;
    recognizedResult: string;
    isRecognizedCorrectly: boolean;
    confidence?: number;
    reason?: string;
    debug: {
      imageDataLength: number;
      imageDataStartsWith: string;
      promptSent: string;
      rawGeminiResponse: Record<string, unknown>;
      targetCharacter: string;
    };
  };
  
  const [debugInfo, setDebugInfo] = useState<DebugInfoType | null>(null);

  // Khởi tạo canvas
  // Draw guide grid on canvas
  const drawGuideGrid = (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D | null) => {
    if (!context) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Save context state
    context.save();
    
    // Draw grid
    context.strokeStyle = "#e5e5e5"; // Light gray
    context.lineWidth = 1;
    
    // Draw center cross
    context.beginPath();
    context.moveTo(width / 2, 0);
    context.lineTo(width / 2, height);
    context.moveTo(0, height / 2);
    context.lineTo(width, height / 2);
    context.stroke();
    
    // Draw outline
    context.strokeRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);
    
    // Restore context state
    context.restore();
  };

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      
      if (context) {
        context.lineWidth = 8; // Reduced from 12 for better accuracy
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = "#000";
        setCtx(context);
      }
      
      // Resize canvas ban đầu
      resizeCanvas(canvas, context);
      
      // Draw guide grid
      drawGuideGrid(canvas, context);
      
      // Setup event listener cho resize
      const handleResize = () => {
        resizeCanvas(canvas, context);
        drawGuideGrid(canvas, context);
      };
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [canvasRef]);

  // Xử lý sự kiện vẽ
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    
    if (ctx) {
      ctx.beginPath();
      
      // Xử lý tọa độ từ sự kiện chuột hoặc cảm ứng
      const { clientX, clientY } = getEventCoordinates(e);
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      
      ctx.moveTo(clientX - rect.left, clientY - rect.top);
    }
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    
    // Xử lý tọa độ
    const { clientX, clientY } = getEventCoordinates(e);
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
    if (ctx) {
      ctx.closePath();
    }
  };
  
  // Helper để lấy tọa độ từ cả chuột và cảm ứng
  const getEventCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return { clientX, clientY };
  };
  
  // Xóa canvas
  const clearCanvas = () => {
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      // Redraw guide grid after clearing
      drawGuideGrid(canvasRef.current, ctx);
      setResult(null);
      setIsCorrect(null);
      setDebugInfo(null);
    }
  };
  
  // Nhận diện ký tự vừa viết
  const recognizeCharacter = async () => {
    if (!canvasRef.current) return;
    
    setIsRecognizing(true);
    setDebugInfo(null);
    
    try {
      // Lấy ảnh từ canvas dưới dạng base64
      // Đảm bảo có nội dung trên canvas trước khi gửi
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      // Kiểm tra xem canvas có trống không bằng cách lấy dữ liệu pixel
      const imageData = context?.getImageData(0, 0, canvas.width, canvas.height).data;
      let hasDrawing = false;
      
      if (imageData) {
        // Lặp qua tất cả các pixel để kiểm tra xem có bất kỳ pixel không trong suốt nào
        for (let i = 3; i < imageData.length; i += 4) {
          if (imageData[i] > 0) {  // Kiểm tra kênh alpha
            hasDrawing = true;
            break;
          }
        }
      }
      
      if (!hasDrawing) {
        setResult("Vui lòng vẽ một ký tự trước khi kiểm tra");
        setIsCorrect(false);
        setIsRecognizing(false);
        return;
      }
      
      // Tạo canvas tạm thời với nền trắng để cải thiện nhận diện
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasRef.current.width;
      tempCanvas.height = canvasRef.current.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        // Vẽ nền trắng
        tempCtx.fillStyle = 'white';
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Sao chép nội dung từ canvas gốc
        tempCtx.drawImage(canvasRef.current, 0, 0);
      }
      
      // Lấy dữ liệu hình ảnh với chất lượng cao nhất từ canvas tạm thời
      const imageBase64 = tempCanvas.toDataURL('image/png', 1.0);
      console.log("Canvas image data:", imageBase64.substring(0, 100) + "...");
      
      // Xác định loại ký tự (hiragana, katakana, kanji) từ character
      // Các ký tự hiragana nằm trong khoảng mã Unicode U+3040 đến U+309F
      // Các ký tự katakana nằm trong khoảng mã Unicode U+30A0 đến U+30FF
      let characterType = null;
      const charCode = character.charCodeAt(0);
      
      if (charCode >= 0x3040 && charCode <= 0x309F) {
        characterType = 'hiragana';
      } else if (charCode >= 0x30A0 && charCode <= 0x30FF) {
        characterType = 'katakana';
      } else if ((charCode >= 0x4E00 && charCode <= 0x9FFF) || 
                 (charCode >= 0x3400 && charCode <= 0x4DBF)) {
        characterType = 'kanji';
      }
      
      console.log("Detected character type:", characterType);
      
      // Gọi API nhận diện ký tự
      const response = await fetch('/api/recognize-character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64,
          targetCharacter: character,
          characterType: characterType // Thêm thông tin loại ký tự
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Lỗi khi nhận diện ký tự');
      }
      
      const data = await response.json();
      const recognizedResult = data.recognizedCharacter;
      const isRecognizedCorrectly = data.isCorrect;
      
      // Lưu thông tin debug
      setDebugInfo({
        imagePreview: data.imagePreview,
        recognizedResult,
        isRecognizedCorrectly,
        confidence: data.confidence,
        reason: data.reason,
        debug: data.debug
      });
      
      setResult(recognizedResult);
      setIsCorrect(isRecognizedCorrectly);
      
      // Cập nhật tiến trình
      if (window.updateWritingProgress) {
        window.updateWritingProgress(isRecognizedCorrectly);
      }
      
      // Không hiển thị hiệu ứng
      
      if (onRecognitionResult) {
        onRecognitionResult(recognizedResult, isRecognizedCorrectly);
      }
    } catch (error) {
      console.error("Lỗi khi nhận diện ký tự:", error);
      setResult("Lỗi");
      setIsCorrect(false);
    } finally {
      setIsRecognizing(false);
    }
  };
  


  // Xử lý khi hoàn thành luyện tập
  const handleTrainingComplete = () => {
    // Không hiển thị hiệu ứng
    console.log("Hoàn thành luyện tập");
  };
  
  return (
    <div className="writing-practice-container">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4 border-b pb-2">Luyện viết</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Ký tự: <span className="text-2xl">{character}</span></h3>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCanvas}
                  >
                    Xóa
                  </Button>
                  <Button
                    size="sm"
                    onClick={recognizeCharacter}
                    disabled={isRecognizing}
                  >
                    {isRecognizing ? "Đang nhận diện..." : "Kiểm tra"}
                  </Button>
                </div>
              </div>
              
              {result && (
                <div className={`mb-3 p-2 rounded-md text-center ${
                  isCorrect 
                    ? "bg-green-50 text-green-800 border border-green-200" 
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}>
                  <p>
                    {isCorrect 
                      ? `Chính xác! Bạn đã viết đúng ký tự "${result}".` 
                      : result === "UNKNOWN" 
                        ? "Không thể nhận diện được ký tự. Hãy thử lại!"
                        : `Nhận diện thành "${result}" (khác với ký tự yêu cầu "${character}").`}
                  </p>
                  {debugInfo?.confidence !== undefined && (
                    <p className="text-sm mt-1">
                      <span className="font-medium">Độ tin cậy: </span>
                      <span className={`${
                        debugInfo.confidence > 80 ? "font-bold text-green-700" :
                        debugInfo.confidence > 50 ? "text-yellow-700" :
                        "text-red-700"
                      }`}>
                        {debugInfo.confidence}%
                      </span>
                    </p>
                  )}
                  {debugInfo?.reason && (
                    <p className="text-sm mt-1 italic">
                      <span className="font-medium">Lý do: </span> {debugInfo.reason}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="border rounded-md bg-white relative">
              <canvas
                ref={canvasRef}
                className="w-full aspect-square touch-none cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{background: '#f8f8f8'}}
              />
            </div>
            
            <div className="mt-2 text-center text-sm text-gray-500">
              Vẽ ký tự &quot;{character}&quot; vào ô trên và bấm &quot;Kiểm tra&quot; để nhận diện
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border">
            <WritingProgress 
              characterId={character} 
              onTrainingComplete={handleTrainingComplete}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 