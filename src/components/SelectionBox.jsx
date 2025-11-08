import React from 'react';

function SelectionBox({ selectedText, onClearSelection }) {

  const handleCopy = () => {
    if (selectedText.trim()) {
      navigator.clipboard.writeText(selectedText);
    }
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
        <button id="btnClearSelection" onClick={onClearSelection}>Clear</button>
      </div>
    </div>
  );
}

export default SelectionBox;