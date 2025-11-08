import React, { useState } from 'react';
import { callGemini } from '../api/gemini';

// --- Imports are now cleaned up (no duplicates) ---
import { useAuth } from '../context/AuthContext';
import { addUserHistory } from '../utils/history';

function TranslateBox({ selectedText }) {
  // --- Component State ---
  const [inputText, setInputText] = useState("");
  const [targetLang, setTargetLang] = useState("English");
  const [result, setResult] = useState("Translation will appear here");
  const [isLoading, setIsLoading] = useState(false);

  // --- Get current user ---
  const { currentUser } = useAuth();

  // --- Event Handlers ---

  const handleUseSelection = () => {
    setInputText(selectedText);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setResult("Generating...");

    const prompt = `Translate the following text to ${targetLang}. Provide only the translation, without any additional explanations or context: \n\n"${inputText}"`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    try {
      const translation = await callGemini(payload);
      setResult(translation);

      // --- Save to history ---
      if (currentUser) {
        addUserHistory(currentUser, {
          type: "Translation",
          text: inputText,
          result: translation,
          date: new Date().toISOString()
        });
      }
      // --- End of new block ---

    } catch (error) {
      setResult(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="box">
      <h3>Translate</h3>
      <textarea
        id="translateInput"
        rows="4"
        placeholder="Select text, paste, or type..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
      ></textarea>
      <div className="controls-inline">
        <button id="btnUseSelection" onClick={handleUseSelection}>Use Selection</button>
        <button id="btnPasteInput" onClick={handlePaste}>Paste</button>
        <select
          id="targetLang"
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
        >
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
          <option value="Chinese">Chinese</option>
          <option value="Japanese">Japanese</option>
          <option value="Bengali">Bengali</option>
          <option value="Hindi">Hindi</option>
          <option value="Arabic">Arabic</option>
          <option value="Russian">Russian</option>
          <option value="Portuguese">Portuguese</option>
        </select>
      </div>
      <button id="btnTranslate" className="primary" onClick={handleTranslate} disabled={isLoading}>
        {isLoading ? 'Translating...' : 'Translate'}
      </button>
      <div id="translateResult" className={`result-pane ${result !== 'Translation will appear here' && 'has-content'}`}>
        {result}
      </div>
    </div>
  );
}

export default TranslateBox;