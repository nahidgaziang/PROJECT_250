import React, { useState } from 'react';
import { callGemini } from '../api/gemini';

function SummarizeBox({ selectedText }) {
  const [length, setLength] = useState("medium");
  const [result, setResult] = useState("Summary will appear here");
  const [isLoading, setIsLoading] = useState(false);

  const handleSummarize = async () => {
    if (!selectedText.trim()) {
      setResult("Please select text to summarize.");
      return;
    }
    setIsLoading(true);
    setResult("Generating...");

    const prompt = `Provide a ${length} summary of the following text:\n\n"${selectedText}"`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    try {
      const summary = await callGemini(payload);
      setResult(summary);
    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="box">
      <h3>Summarize</h3>
      <label>
        Length:
        <select
          id="summaryLen"
          value={length}
          onChange={(e) => setLength(e.target.value)}
        >
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="long">Long</option>
        </select>
      </label>
      <button id="btnSummarize" className="primary" onClick={handleSummarize} disabled={isLoading}>
        {isLoading ? 'Summarizing...' : 'Summarize Selection'}
      </button>
      <div id="summaryResult" className={`result-pane ${result !== 'Summary will appear here' && 'has-content'}`}>
        {result}
      </div>
    </div>
  );
}

export default SummarizeBox;