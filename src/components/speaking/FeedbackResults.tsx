'use client';

import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { CheckCircle, AlertCircle, ThumbsUp } from 'lucide-react';

interface FeedbackResultsProps {
  feedback: {
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
  };
  targetText: string;
}

export function FeedbackResults({ feedback, targetText }: FeedbackResultsProps) {
  // Function to determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  // Function to determine progress bar color based on score
  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Function to get score label
  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Xuất sắc';
    if (score >= 80) return 'Rất tốt';
    if (score >= 70) return 'Tốt';
    if (score >= 60) return 'Khá';
    if (score >= 50) return 'Trung bình';
    return 'Cần cải thiện';
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-blue-100">
      {/* Friendly comment section */}
      {feedback.feedback.friendlyComment && (
        <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
          <p className="text-lg font-medium text-slate-800">{feedback.feedback.friendlyComment}</p>
        </div>
      )}
      
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Kết quả đánh giá phát âm</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Score section */}
          <div>
            <div className="mb-6">
              <div className="flex justify-between items-baseline mb-2">
                <h4 className="text-lg font-medium text-slate-900">Điểm tổng thể</h4>
                <div className="flex items-center gap-1">
                  <span className={`font-bold text-3xl ${getScoreColor(feedback.score)}`}>
                    {Math.round(feedback.score)}
                  </span>
                  <span className="text-slate-600">/100</span>
                </div>
              </div>
              <Progress value={feedback.score} className={`h-3 ${getProgressColor(feedback.score)}`} />
              <div className="flex justify-end mt-1">
                <span className={`text-sm font-medium ${getScoreColor(feedback.score)}`}>
                  {getScoreLabel(feedback.score)}
                </span>
              </div>
            </div>

            {/* Detailed scores */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-700">Độ chính xác</span>
                  <span className={`text-sm font-medium ${getScoreColor(feedback.accuracy)}`}>{Math.round(feedback.accuracy)}%</span>
                </div>
                <Progress value={feedback.accuracy} className={`h-2 ${getProgressColor(feedback.accuracy)}`} />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-700">Ngữ điệu</span>
                  <span className={`text-sm font-medium ${getScoreColor(feedback.pitchAccent)}`}>{Math.round(feedback.pitchAccent)}%</span>
                </div>
                <Progress value={feedback.pitchAccent} className={`h-2 ${getProgressColor(feedback.pitchAccent)}`} />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-700">Nhịp điệu</span>
                  <span className={`text-sm font-medium ${getScoreColor(feedback.rhythm)}`}>{Math.round(feedback.rhythm)}%</span>
                </div>
                <Progress value={feedback.rhythm} className={`h-2 ${getProgressColor(feedback.rhythm)}`} />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-slate-700">Sự trôi chảy</span>
                  <span className={`text-sm font-medium ${getScoreColor(feedback.fluency)}`}>{Math.round(feedback.fluency)}%</span>
                </div>
                <Progress value={feedback.fluency} className={`h-2 ${getProgressColor(feedback.fluency)}`} />
              </div>
            </div>
          </div>

          {/* Feedback section */}
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium text-slate-900 flex items-center gap-1">
                <span className="text-emerald-500"><ThumbsUp className="h-4 w-4 inline" /></span>
                Điểm mạnh
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                {feedback.feedback.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="mb-2 font-medium text-slate-900 flex items-center gap-1">
                <span className="text-amber-500"><AlertCircle className="h-4 w-4 inline" /></span>
                Điểm cần cải thiện
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                {feedback.feedback.weaknesses.map((weakness, index) => (
                  <li key={index}>{weakness}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="mb-2 font-medium text-slate-900 flex items-center gap-1">
                <span className="text-blue-500"><CheckCircle className="h-4 w-4 inline" /></span>
                Gợi ý cải thiện
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                {feedback.feedback.improvementTips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Transcription section */}
      <div>
        <h4 className="mb-2 font-medium text-slate-900">So sánh phát âm</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <Card className="p-4 bg-white border-slate-200">
            <h5 className="text-sm font-medium text-slate-600 mb-1">Văn bản mục tiêu</h5>
            <p className="text-slate-900">{targetText}</p>
          </Card>
          <Card className="p-4 bg-white border-slate-200">
            <h5 className="text-sm font-medium text-slate-600 mb-1">Chúng tôi nghe thấy</h5>
            <p className="text-slate-900">{feedback.transcription}</p>
          </Card>
        </div>
        {feedback.feedback.comparison && (
          <Card className="p-4 bg-white border-slate-200">
            <p className="text-slate-900">{feedback.feedback.comparison}</p>
          </Card>
        )}
      </div>
    </div>
  );
} 