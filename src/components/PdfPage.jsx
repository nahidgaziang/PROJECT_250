import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import AnnotationLayer from './AnnotationLayer';


import 'pdfjs-dist/web/pdf_viewer.css';


function PdfPage({ 
  pdfDoc, 
  pageNumber, 
  activeTool, 
  toolColor, 
  toolWidth,
  annotations, 
  onAnnotationAdd, 
  onAnnotationDelete 
}) {
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);

  
  const [pageData, setPageData] = useState(null);
  
  const [viewport, setViewport] = useState(null);

  // 1. Load the page object
  useEffect(() => {
    if (!pdfDoc) return;
    
    pdfDoc.getPage(pageNumber).then((page) => {
      setPageData(page);
      setViewport(page.getViewport({ scale: 1.5 }));
    });
  }, [pdfDoc, pageNumber]);

  // 2. Render the page canvas and text layer
  useEffect(() => {
    if (!pageData || !viewport || !canvasRef.current || !textLayerRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render canvas
    pageData.render({
      canvasContext: context,
      viewport: viewport,
    }).promise.then(() => {
      // Render text layer
      return pageData.getTextContent();
    }).then((textContent) => {
      
      // This code is correct for the pdf.js version (3.9.179) we installed
      pdfjsLib.renderTextLayer({
        textContent: textContent,
        container: textLayerRef.current,
        viewport: viewport,
      });
    });

  }, [pageData, viewport]);

  return (
    <div
      className="page-container"
      data-page-number={pageNumber}
      style={{
        width: viewport ? viewport.width + 'px' : 'auto',
        height: viewport ? viewport.height + 'px' : 'auto',
        position: 'relative'
      }}
    >
      <canvas ref={canvasRef}></canvas>
      <div className="textLayer" ref={textLayerRef}></div>
      {viewport && (
        <AnnotationLayer
          pageNumber={pageNumber}
          viewport={viewport}
          annotations={annotations || {}}
          tool={activeTool || 'none'}
          color={toolColor || '#ffff00'}
          width={toolWidth || 2}
          onAnnotationAdd={(annotation) => onAnnotationAdd && onAnnotationAdd(pageNumber, annotation)}
          onAnnotationDelete={(id, type) => onAnnotationDelete && onAnnotationDelete(pageNumber, id, type)}
        />
      )}
    </div>
  );
}

export default PdfPage;