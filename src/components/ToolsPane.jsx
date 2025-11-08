import React from 'react';
import SelectionBox from './SelectionBox';
import TranslateBox from './TranslateBox';
import SummarizeBox from './SummarizeBox';
import QuizBox from './QuizBox';
import HistoryBox from './HistoryBox';

function ToolsPane({ selectedText, onStartQuiz, onClearSelection }) {
  return (
    <aside id="toolsPane">
      <SelectionBox
        selectedText={selectedText}
        onClearSelection={onClearSelection}
      />
      <TranslateBox selectedText={selectedText} />
      <SummarizeBox selectedText={selectedText} />
      <QuizBox selectedText={selectedText} onStartQuiz={onStartQuiz} />
      <HistoryBox />
    </aside>
  );
}

export default ToolsPane;