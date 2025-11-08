import React, { useState } from 'react';

function AnnotationToolbar({ 
  activeTool, 
  onToolChange, 
  color, 
  onColorChange,
  width,
  onWidthChange,
  onClearAll
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const highlightColors = [
    { name: 'Yellow', value: '#ffff00' },
    { name: 'Green', value: '#00ff00' },
    { name: 'Pink', value: '#ff00ff' },
    { name: 'Blue', value: '#00ffff' },
    { name: 'Orange', value: '#ff8800' }
  ];

  const penColors = [
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#ff0000' },
    { name: 'Blue', value: '#0000ff' },
    { name: 'Green', value: '#008000' },
    { name: 'Purple', value: '#800080' }
  ];

  const getColorPalette = () => {
    if (activeTool === 'highlighter') {
      return highlightColors;
    } else if (activeTool === 'pen') {
      return penColors;
    }
    return [];
  };

  return (
    <div className="annotation-toolbar">
      <div className="toolbar-section">
        <h4>Annotation Tools</h4>
        <div className="tool-buttons">
          <button
            className={activeTool === 'none' ? 'active' : ''}
            onClick={() => onToolChange('none')}
            title="Select Tool"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            Select
          </button>
          <button
            className={activeTool === 'highlighter' ? 'active' : ''}
            onClick={() => onToolChange('highlighter')}
            title="Highlighter"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            Highlight
          </button>
          <button
            className={activeTool === 'pen' ? 'active' : ''}
            onClick={() => onToolChange('pen')}
            title="Pen"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Pen
          </button>
          <button
            className={activeTool === 'eraser' ? 'active' : ''}
            onClick={() => onToolChange('eraser')}
            title="Eraser"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eraser
          </button>
        </div>
      </div>

      {(activeTool === 'pen' || activeTool === 'highlighter') && (
        <>
          <div className="toolbar-section">
            <h4>Color</h4>
            <div className="color-palette">
              {getColorPalette().map((colorOption) => (
                <button
                  key={colorOption.value}
                  className={`color-swatch ${color === colorOption.value ? 'active' : ''}`}
                  style={{ backgroundColor: colorOption.value }}
                  onClick={() => onColorChange(colorOption.value)}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>

          {(activeTool === 'pen') && (
            <div className="toolbar-section">
              <h4>Width: {width}px</h4>
              <input
                type="range"
                min="1"
                max="20"
                value={width}
                onChange={(e) => onWidthChange(parseInt(e.target.value))}
                className="width-slider"
              />
            </div>
          )}
        </>
      )}

      <div className="toolbar-section">
        <button 
          className="clear-all-btn"
          onClick={onClearAll}
          title="Clear All Annotations"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}

export default AnnotationToolbar;

