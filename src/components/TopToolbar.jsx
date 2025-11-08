import React, { useRef } from 'react';

// Accept new props: currentUser and onLogout
function TopToolbar({ onFileChange, onLoadSample, onToggleTools, currentUser, onLogout }) {
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div id="top-toolbar">
      {/* --- Group 1: Title (Left) --- */}
      <div className="toolbar-group">
        <h1>
          <span style={{ color: 'red' }}>ReaD</span>
          <span>efy</span>
          <sub style={{ fontStyle: 'italic' }} className="Smart">
            Your Smart Study Partner
          </sub>
        </h1>
      </div>

      {/* --- Group 2: Buttons (Middle) --- */}
      <div className="toolbar-group toolbar-center">
        <button id="fileBtn" title="Open PDF File" onClick={handleFileClick}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            ></path>
          </svg>
          Open PDF
        </button>
        <input
          id="fileInput"
          type="file"
          accept="application/pdf"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={onFileChange}
        />
        <button id="loadSample" title="Load a Sample PDF" onClick={onLoadSample}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
          Sample
        </button>
        <button id="toolsToggleBtn" title="Toggle Tools Sidebar" onClick={onToggleTools}>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h7"
            ></path>
          </svg>
          Tools
        </button>
      </div>

      {/* --- Group 3: Auth (Right) --- */}
      <div className="toolbar-group toolbar-right">
        {currentUser ? (
          <>
            <span className="user-email">{currentUser}</span>
            <button onClick={onLogout}>Log Out</button>
          </>
        ) : (
          /* Empty div to balance the flexbox */
          <div></div>
        )}
      </div>
    </div>
  );
}

export default TopToolbar;