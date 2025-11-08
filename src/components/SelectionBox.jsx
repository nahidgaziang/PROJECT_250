import React from 'react';

function SelectionBox({ selectedText, onClearSelection }) {

  const handleCopy = () => {
    if (selectedText.trim()) {
      navigator.clipboard.writeText(selectedText);
    }
  };

  const handleHighlight = () => {
    // This requires more complex logic to track selection coordinates
    console.log("Highlight feature not yet implemented in React version.");
  };

  return (
    <div className="box">
      <h3>Selected Text</h3>
      <textarea
        id="selectionText"
        rows="4"
        placeholder="No text selected"
        value={selectedText}
        readOnly // Make it read-only, as it's controlled by mouseup
      ></textarea>
      <div className="selection-controls">
        <button id="btnCopy" onClick={handleCopy}>Copy</button>
        <button id="btnHighlight" onClick={handleHighlight} disabled>Highlight</button>
        <button id="btnClearSelection" onClick={onClearSelection}>Clear</button>
        <button id="btnClearHighlights" disabled>Clear Highlights</button>
      </div>
    </div>
  );
}

export default SelectionBox;