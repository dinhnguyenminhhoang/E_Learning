"use client";

import { useState, useRef } from "react";
import { Play, Pause, RotateCcw, CheckCircle, XCircle, Send } from "lucide-react";
import { listeningPracticeService, ListeningQuestion } from "@/services/listeningPractice.service";

interface ListeningPracticeProps {
  blockId?: string;
  lessonId?: string;
  mediaUrl: string;
  mediaTitle?: string;
  questions: Array<{
    id: string;
    question: string;
    correctAnswer: string;
  }>;
  onComplete?: (accuracy: number, score: number) => void;
}

export default function ListeningPractice({
  blockId,
  lessonId,
  mediaUrl,
  mediaTitle,
  questions,
  onComplete,
}: ListeningPracticeProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<ListeningQuestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accuracy, setAccuracy] = useState(0);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    if (submitted) return;

    setIsSubmitting(true);

    const evaluatedQuestions: ListeningQuestion[] = questions.map((q) => {
      const userAnswer = (answers[q.id] || "").trim().toLowerCase();
      const correctAnswer = q.correctAnswer.trim().toLowerCase();
      const isCorrect = userAnswer === correctAnswer;

      return {
        question: q.question,
        userAnswer: answers[q.id] || "",
        correctAnswer: q.correctAnswer,
        isCorrect,
      };
    });

    const correctCount = evaluatedQuestions.filter((q) => q.isCorrect).length;
    const accuracyPercent = Math.round((correctCount / questions.length) * 100);

    setResults(evaluatedQuestions);
    setAccuracy(accuracyPercent);
    setSubmitted(true);

    try {
      const result = await listeningPracticeService.submitListeningPractice({
        blockId,
        lessonId,
        mediaTitle,
        questions: evaluatedQuestions,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
      });

      console.log("[Listening Practice] Submitted successfully:", result);

      if (onComplete) {
        onComplete(result.accuracy, result.score);
      }
    } catch (error) {
      console.error("[Listening Practice] Submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Listening Practice
      </h2>

      {mediaTitle && (
        <p className="text-gray-600 mb-4">{mediaTitle}</p>
      )}

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
        <audio
          ref={audioRef}
          src={mediaUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={togglePlayPause}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>

          <button
            onClick={handleRestart}
            className="w-12 h-12 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-gray-50 rounded-xl p-4">
            <p className="font-semibold text-gray-800 mb-3">
              {index + 1}. {q.question}
            </p>
            <input
              type="text"
              value={answers[q.id] || ""}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              disabled={submitted}
              placeholder="Type your answer here..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {submitted && results[index] && (
              <div className="mt-2 flex items-start gap-2">
                {results[index].isCorrect ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">Correct!</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Incorrect</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-7">
                      Correct answer: <span className="font-semibold text-green-600">{q.correctAnswer}</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || Object.keys(answers).length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          {isSubmitting ? "Submitting..." : "Submit Answers"}
        </button>
      ) : (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600 mb-2">
              {accuracy}%
            </p>
            <p className="text-gray-700 font-medium">
              {results.filter(r => r.isCorrect).length} out of {questions.length} correct
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
