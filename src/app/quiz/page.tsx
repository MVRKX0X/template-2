'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getActiveQuiz, Quiz, updateUserPoints } from '@/lib/firebase/firebaseUtils';
import Navbar from '@/components/Navbar';

export default function QuizPage() {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const loadQuiz = async () => {
      const activeQuizzes = await getActiveQuiz();
      if (activeQuizzes.length > 0) {
        setQuiz(activeQuizzes[0] as Quiz);
      }
    };
    loadQuiz();
  }, []);

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !user) return;

    let correctAnswers = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const earnedPoints = correctAnswers * quiz.pointsPerQuestion;
    setScore(earnedPoints);
    
    // Update user points
    if (user.points !== undefined) {
      const newPoints = user.points + earnedPoints;
      await updateUserPoints(user.uid, newPoints);
    }
    
    setIsSubmitted(true);
  };

  if (!quiz) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold">No active quiz available</h2>
          <p className="mt-4 text-gray-400">Check back later for new quizzes!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-[#1F1F2B] rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-8 text-[#E10600]">{quiz.title}</h1>

          {!isSubmitted ? (
            <>
              <div className="mb-8">
                <div className="flex justify-between mb-4">
                  <span className="text-gray-400">
                    Question {currentQuestion + 1} of {quiz.questions.length}
                  </span>
                  <span className="text-gray-400">
                    {quiz.pointsPerQuestion} points
                  </span>
                </div>

                <h3 className="text-xl mb-6">
                  {quiz.questions[currentQuestion].question}
                </h3>

                <div className="space-y-4">
                  {quiz.questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      className={`w-full p-4 text-left rounded-lg transition-colors ${
                        selectedAnswers[currentQuestion] === index
                          ? 'bg-[#E10600] text-white'
                          : 'bg-[#2A2A3A] hover:bg-[#3A3A4A]'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className="px-6 py-2 rounded-md bg-[#2A2A3A] disabled:opacity-50"
                >
                  Previous
                </button>

                {currentQuestion === quiz.questions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={selectedAnswers.length !== quiz.questions.length}
                    className="px-6 py-2 rounded-md bg-[#E10600] disabled:opacity-50"
                  >
                    Submit
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={selectedAnswers[currentQuestion] === undefined}
                    className="px-6 py-2 rounded-md bg-[#E10600] disabled:opacity-50"
                  >
                    Next
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
              <p className="text-xl mb-2">
                You earned: <span className="text-[#E10600] font-bold">{score} points</span>
              </p>
              <p className="text-gray-400">
                Come back next week for a new quiz!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 