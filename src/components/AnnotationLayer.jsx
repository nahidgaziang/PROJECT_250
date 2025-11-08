import React, { useRef, useEffect, useState } from 'react';

function AnnotationLayer({ 
  pageNumber, 
  viewport, 
  annotations, 
  tool, 
  color, 
  width,
  onAnnotationAdd,
  onAnnotationDelete
}) {
  const svgRef = useRef(null);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const currentPathRef = useRef([]);
  const [isErasing, setIsErasing] = useState(false);

  // Render existing annotations
  useEffect(() => {
    if (!svgRef.current || !viewport) return;
    
    const svg = svgRef.current;
    // Clear existing content
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    
    const pageAnnotations = annotations[pageNumber] || { highlights: [], drawings: [] };
    
    // Render highlights
    if (pageAnnotations.highlights) {
      pageAnnotations.highlights.forEach(highlight => {
        highlight.rects.forEach(rect => {
          const rectEl = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          rectEl.setAttribute('x', rect.x);
          rectEl.setAttribute('y', rect.y);
          rectEl.setAttribute('width', rect.width);
          rectEl.setAttribute('height', rect.height);
          rectEl.setAttribute('fill', highlight.color || '#ffff00');
          rectEl.setAttribute('opacity', '0.3');
          rectEl.setAttribute('data-annotation-id', highlight.id);
          rectEl.setAttribute('data-annotation-type', 'highlight');
          svg.appendChild(rectEl);
        });
      });
    }
    
    // Render drawings as SVG paths
    if (pageAnnotations.drawings) {
      pageAnnotations.drawings.forEach(drawing => {
        if (drawing.path && drawing.path.length >= 2) {
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          const pathData = drawing.path.map((p, i) => 
            `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
          ).join(' ');
          path.setAttribute('d', pathData);
          path.setAttribute('stroke', drawing.color || '#000000');
          path.setAttribute('stroke-width', drawing.width || 2);
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke-linecap', 'round');
          path.setAttribute('stroke-linejoin', 'round');
          path.setAttribute('data-annotation-id', drawing.id);
          path.setAttribute('data-annotation-type', 'drawing');
          svg.appendChild(path);
        }
      });
    }
  }, [annotations, pageNumber, viewport]);

  // Setup canvas for drawing preview
  useEffect(() => {
    if (!canvasRef.current || !viewport) return;
    const canvas = canvasRef.current;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
  }, [viewport]);

  const getPointFromEvent = (e) => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleMouseDown = (e) => {
    if (tool === 'eraser') {
      setIsErasing(true);
      handleEraser(e);
      return;
    }

    if (tool === 'pen' || tool === 'highlighter') {
      isDrawingRef.current = true;
      const point = getPointFromEvent(e);
      if (point) {
        currentPathRef.current = [point];
      }
    }
  };

  const handleMouseMove = (e) => {
    if (tool === 'eraser' && isErasing) {
      handleEraser(e);
      return;
    }

    if (!isDrawingRef.current || !canvasRef.current) return;
    
    const point = getPointFromEvent(e);
    if (!point) return;

    currentPathRef.current.push(point);
    
    // Draw on canvas for real-time preview
    const ctx = canvasRef.current.getContext('2d');
    if (currentPathRef.current.length >= 2) {
      const lastPoint = currentPathRef.current[currentPathRef.current.length - 2];
      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(point.x, point.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = width || (tool === 'highlighter' ? 12 : 2);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (tool === 'highlighter') {
        ctx.globalAlpha = 0.3;
      } else {
        ctx.globalAlpha = 1;
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  };

  const handleMouseUp = () => {
    if (isErasing) {
      setIsErasing(false);
      return;
    }

    if (isDrawingRef.current && currentPathRef.current.length > 0) {
      const annotationType = tool === 'highlighter' ? 'highlight' : 'drawing';
      
      if (tool === 'highlighter') {
        // For highlighter, create a rect from the path bounds
        const xs = currentPathRef.current.map(p => p.x);
        const ys = currentPathRef.current.map(p => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        
        onAnnotationAdd({
          id: `highlight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'highlight',
          tool: 'highlighter',
          color: color,
          rects: [{
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
          }],
          path: [...currentPathRef.current]
        });
      } else {
        onAnnotationAdd({
          id: `drawing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'drawing',
          tool: tool,
          color: color,
          width: width || 2,
          path: [...currentPathRef.current]
        });
      }
      
      currentPathRef.current = [];
      isDrawingRef.current = false;
      
      // Clear canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  const handleEraser = (e) => {
    if (!onAnnotationDelete) return;
    
    const point = getPointFromEvent(e);
    if (!point) return;

    const pageAnnotations = annotations[pageNumber] || { highlights: [], drawings: [] };
    const threshold = 15; // pixels
    
    // Check highlights
    if (pageAnnotations.highlights) {
      for (const highlight of pageAnnotations.highlights) {
        if (highlight.rects) {
          const intersects = highlight.rects.some(r => 
            point.x >= r.x - threshold && 
            point.x <= r.x + r.width + threshold &&
            point.y >= r.y - threshold && 
            point.y <= r.y + r.height + threshold
          );
          if (intersects) {
            onAnnotationDelete(highlight.id, 'highlight');
            return;
          }
        }
      }
    }
    
    // Check drawings
    if (pageAnnotations.drawings) {
      for (const drawing of pageAnnotations.drawings) {
        if (drawing.path) {
          const nearPath = drawing.path.some(p => 
            Math.sqrt((p.x - point.x) ** 2 + (p.y - point.y) ** 2) < threshold
          );
          if (nearPath) {
            onAnnotationDelete(drawing.id, 'drawing');
            return;
          }
        }
      }
    }
  };

  if (!viewport) return null;

  const isDrawingTool = tool === 'pen' || tool === 'highlighter';
  const cursorStyle = tool === 'eraser' ? 'grab' : 
                     isDrawingTool ? 'crosshair' : 
                     'default';

  return (
    <div 
      className="annotation-layer"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: viewport.width,
        height: viewport.height,
        pointerEvents: tool !== 'none' ? 'auto' : 'none',
        zIndex: 10,
        cursor: cursorStyle
      }}
    >
      <svg
        ref={svgRef}
        width={viewport.width}
        height={viewport.height}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0,
          pointerEvents: tool === 'eraser' ? 'auto' : 'none'
        }}
      />
      {isDrawingTool && (
        <canvas
          ref={canvasRef}
          width={viewport.width}
          height={viewport.height}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            pointerEvents: 'none',
            zIndex: 11
          }}
        />
      )}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      />
    </div>
  );
}

export default AnnotationLayer;

