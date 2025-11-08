import React, { useState } from 'react';
import { callGemini } from '../api/gemini';

function QuizBox({ selectedText, onStartQuiz }) {
  const [count, setCount] = useState(3);
  const [result, setResult] = useState("Quiz will appear here");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateQuiz = async () => {
    if (!selectedText.trim()) {
      setResult("Please select text to create a quiz from.");
      return;
    }
    setIsLoading(true);
    setResult("Generating...");

    //
    // --- CHANGE 1: Updated Prompt ---
    // We now ask for an explanation for each answer.
    //
    const prompt = `Create a quiz based on the following text. Generate ${count} questions. Include a mix of 'multiple_choice' and 'descriptive' (short answer) questions. For multiple choice questions, provide 4 options. The correct answer must be one of the options.

    For EVERY question, provide a brief 'explanation' for why the answer is correct.

    Text:
    "${selectedText}"`;

    //
    // --- CHANGE 2: Updated Schema ---
    // We added an 'explanation' field and made it required.
    //
    const quizSchema = {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          question: { type: "STRING" },
          type: {
            type: "STRING",
            enum: ["multiple_choice", "descriptive"],
          },
          options: { type: "ARRAY", items: { type: "STRING" } },
          answer: { type: "STRING" },
          explanation: { type: "STRING" }, // <-- ADDED
        },
        required: ["question", "type", "answer", "explanation"], // <-- ADDED
      },
    };

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      },
    };

    try {
      const quizData = await callGemini(payload);
      if (quizData && Array.isArray(quizData)) {
        setResult(`Quiz with ${quizData.length} questions generated successfully.`);
        onStartQuiz(quizData); // Pass data to App to open modal
      } else {
        throw new Error("Failed to generate a valid quiz. API returned: " + JSON.stringify(quizData));
      }
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="box">
      <h3>Generate Quiz</h3>
      <label>
        Questions:
        <input
          id="quizCount"
          type="number"
          value={count}
          min="1"
          max="10"
          onChange={(e) => setCount(Number(e.target.value))}
        />
      </label>
      <button id="btnQuiz" className="primary" onClick={handleCreateQuiz} disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Quiz'}
      </button>
      <div id="quizResult" className={`result-pane ${result !== 'Quiz will appear here' && 'has-content'}`}>
        {result}
      </div>
    </div>
  );
}

export default QuizBox;