import React from 'react';
import PdfPage from './PdfPage';

function ViewerPane({ 
  pdfDoc, 
  activeTool, 
  toolColor, 
  toolWidth,
  annotations, 
  onAnnotationAdd, 
  onAnnotationDelete 
}) {
  if (!pdfDoc) {
    return (
      <div id="viewerPane">
        <div id="pdf-container">
          <div className="loader">Open a PDF file or load a sample to begin.</div>
        </div>
      </div>
    );
  }

  const pages = Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1);

  return (
    <div id="viewerPane">
      <div id="pdf-container">
        {pages.map((pageNumber) => (
          <PdfPage 
            key={pageNumber} 
            pdfDoc={pdfDoc} 
            pageNumber={pageNumber}
            activeTool={activeTool}
            toolColor={toolColor}
            toolWidth={toolWidth}
            annotations={annotations}
            onAnnotationAdd={onAnnotationAdd}
            onAnnotationDelete={onAnnotationDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default ViewerPane;