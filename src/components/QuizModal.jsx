import React, { useState } from 'react';

function QuizModal({ quizData, onClose }) {
  const [answers, setAnswers] = useState({}); // { 0: "answer1", 1: "answer2" }
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const handleAnswerChange = (index, value) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleSubmit = () => {
    let correctCount = 0;
    let totalMCQs = 0;

    quizData.forEach((item, index) => {
      if (item.type === 'multiple_choice') {
        totalMCQs++;
        const userAnswer = answers[index];
        if (userAnswer && userAnswer.trim().toLowerCase() === item.answer.trim().toLowerCase()) {
          correctCount++;
        }
      }
    });

    setScore({ correct: correctCount, total: totalMCQs });
    setIsSubmitted(true);
  };

  const getOptionClass = (item, index, option) => {
    if (!isSubmitted) return "";
    const isCorrect = option.trim().toLowerCase() === item.answer.trim().toLowerCase();
    const isSelected = answers[index] && option.trim().toLowerCase() === answers[index].trim().toLowerCase();

    if (isCorrect) return "correct";
    if (isSelected && !isCorrect) return "incorrect";
    return "";
  };

  return (
    <>
      <div id="modalOverlay" onClick={onClose}></div>
      <div id="quizModal" style={{ display: 'flex' }}>
        <div className="modal-header">
          <h2 id="quizTitle">Knowledge Check</h2>
          <button className="modal-close" id="quizCloseBtn" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body" id="quizBody">
          
          {/* --- THIS IS THE SCORE DISPLAY --- */}
          {isSubmitted && (
            <div id="quizResultDisplay">
              You scored {score.correct} out of {score.total} on the multiple-choice questions.
            </div>
          )}
  
          {quizData.map((item, index) => (
            <div className="quiz-question" data-index={index} key={index}>
              <p>{`${index + 1}. ${item.question}`}</p>
              {item.type === 'multiple_choice' ? (
                <div className="quiz-options">
                  {item.options.map((option, optIndex) => (
                    <label key={optIndex} className={getOptionClass(item, index, option)}>
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        onChange={() => handleAnswerChange(index, option)}
                        disabled={isSubmitted}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  placeholder="Type your answer here..."
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  disabled={isSubmitted}
                  value={answers[index] || ''} // Show user's answer
                ></textarea>
              )}

              {/*
              // --- THIS IS THE NEW EXPLANATION BLOCK ---
              // It only appears after the user clicks "Submit"
              */}
              {isSubmitted && (
                <div className="quiz-explanation">
                  {/* For descriptive, we show the answer. For MCQ, the green highlight is enough. */}
                  {item.type === 'descriptive' && (
                    <p><strong>Correct Answer:</strong> {item.answer}</p>
                  )}
                  <p><strong>Explanation:</strong> {item.explanation || "No explanation provided."}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="modal-footer">
          {!isSubmitted && (
            <button id="submitQuizBtn" className="primary" onClick={handleSubmit}>
              Submit Answers
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default QuizModal;