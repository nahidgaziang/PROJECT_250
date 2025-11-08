import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { arrayBufferToBase64, base64ToArrayBuffer } from './utils/pdfUtils';
import TopToolbar from './components/TopToolbar';
import ViewerPane from './components/ViewerPane';
import ToolsPane from './components/ToolsPane';
import QuizModal from './components/QuizModal';
import AnnotationToolbar from './components/AnnotationToolbar';
import SplashScreen from './components/SplashScreen';

// --- NEW IMPORTS ---
import { useAuth } from './context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function App() {
  // --- AUTH HOOKS ---
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // --- PDF State ---
  const [pdfData, setPdfData] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);

  // --- UI State ---
  const [selectedText, setSelectedText] = useState("");
  const [isToolsVisible, setIsToolsVisible] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

  // --- Annotation State ---
  const [annotations, setAnnotations] = useState({});
  const [activeTool, setActiveTool] = useState('none');
  const [toolColor, setToolColor] = useState('#ffff00');
  const [toolWidth, setToolWidth] = useState(2);
  const pdfIdRef = useRef(null);

  // --- Splash Screen State ---
  const [showSplash, setShowSplash] = useState(true);

  // --- Effects (no changes) ---
  useEffect(() => {
    const savedPdfBase64 = sessionStorage.getItem("lastPdf");
    if (savedPdfBase64) {
      try {
        const data = base64ToArrayBuffer(savedPdfBase64);
        setPdfData(data);
      } catch (error) {
        console.error("Failed to load PDF from session storage:", error);
        sessionStorage.removeItem("lastPdf");
      }
    }
  }, []);

  useEffect(() => {
    if (!pdfData) return;
    const loadPdf = async () => {
      try {
        const doc = await pdfjsLib.getDocument({ data: pdfData }).promise;
        setPdfDoc(doc);
        
        // Generate a unique ID for this PDF based on its content
        const hash = await generatePdfHash(pdfData);
        pdfIdRef.current = hash;
        
        // Load saved annotations for this PDF
        const savedAnnotations = localStorage.getItem(`pdf-annotations-${hash}`);
        if (savedAnnotations) {
          try {
            setAnnotations(JSON.parse(savedAnnotations));
          } catch (e) {
            console.error("Failed to load annotations:", e);
          }
        } else {
          setAnnotations({});
        }
      } catch (error) {
        console.error("Error loading PDF document:", error);
        alert(`Error loading PDF: ${error.message}`);
      }
    };
    loadPdf();
  }, [pdfData]);

  // Generate a simple hash for PDF identification
  const generatePdfHash = async (data) => {
    try {
      if (crypto && crypto.subtle) {
        const buffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(buffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
      }
    } catch (e) {
      console.warn('Crypto API not available, using fallback hash');
    }
    // Fallback: simple hash based on data length and first few bytes
    const bytes = new Uint8Array(data);
    let hash = bytes.length.toString();
    for (let i = 0; i < Math.min(100, bytes.length); i++) {
      hash += bytes[i].toString(16);
    }
    return hash.substring(0, 16);
  };

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection().toString().trim();
      if (selection.length > 0) {
        setSelectedText(selection);
      }
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Annotation handlers (using useCallback to avoid dependency issues)
  const handleAnnotationAdd = React.useCallback((pageNumber, annotation) => {
    setAnnotations(prev => {
      const pageAnnotations = prev[pageNumber] || { highlights: [], drawings: [] };
      const newAnnotations = { ...prev };
      
      if (annotation.type === 'highlight') {
        newAnnotations[pageNumber] = {
          ...pageAnnotations,
          highlights: [...(pageAnnotations.highlights || []), annotation]
        };
      } else if (annotation.type === 'drawing') {
        if (!annotation.id) {
          annotation.id = `drawing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        newAnnotations[pageNumber] = {
          ...pageAnnotations,
          drawings: [...(pageAnnotations.drawings || []), annotation]
        };
      }
      
      return newAnnotations;
    });
  }, []);

  // Disable text selection when using drawing tools
  useEffect(() => {
    if (activeTool === 'pen' || activeTool === 'marker' || activeTool === 'eraser') {
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }
    
    return () => {
      document.body.style.userSelect = '';
    };
  }, [activeTool]);

  // Handle text selection for highlighter (only when highlighter tool is active)
  useEffect(() => {
    if (activeTool !== 'highlighter') {
      return;
    }
    
    const handleTextSelection = () => {
      const selection = window.getSelection();
      if (selection.rangeCount === 0) return;
      
      const range = selection.getRangeAt(0);
      const rects = Array.from(range.getClientRects());
      if (rects.length === 0) return;
      
      // Find the page container
      let pageContainer = range.commonAncestorContainer;
      if (pageContainer.nodeType !== Node.ELEMENT_NODE) {
        pageContainer = pageContainer.parentElement;
      }
      while (pageContainer && !pageContainer.classList.contains('page-container')) {
        pageContainer = pageContainer.parentElement;
      }
      
      if (!pageContainer) return;
      
      // Get page number from data attribute
      const pageNumber = parseInt(pageContainer.getAttribute('data-page-number'));
      
      if (!pageNumber || !pdfDoc) return;
      
      const pageRect = pageContainer.getBoundingClientRect();
      const highlightRects = rects
        .filter(rect => rect.width > 0 && rect.height > 0)
        .map(rect => ({
          x: rect.left - pageRect.left,
          y: rect.top - pageRect.top,
          width: rect.width,
          height: rect.height
        }));
      
      if (highlightRects.length === 0) return;
      
      const annotation = {
        id: `highlight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'highlight',
        tool: 'highlighter',
        color: toolColor,
        rects: highlightRects,
        text: selection.toString(),
        timestamp: Date.now()
      };
      
      handleAnnotationAdd(pageNumber, annotation);
      selection.removeAllRanges();
    };
    
    // Small delay to ensure selection is complete
    const timeoutId = setTimeout(() => {
      document.addEventListener('mouseup', handleTextSelection);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mouseup', handleTextSelection);
    };
  }, [activeTool, toolColor, pdfDoc, handleAnnotationAdd]);

  // Save annotations to localStorage
  useEffect(() => {
    if (pdfIdRef.current && Object.keys(annotations).length > 0) {
      try {
        localStorage.setItem(`pdf-annotations-${pdfIdRef.current}`, JSON.stringify(annotations));
      } catch (e) {
        console.error("Failed to save annotations:", e);
      }
    }
  }, [annotations]);

  // --- Helper Function (no change) ---
  const savePdfToSession = (data) => {
    try {
      const base64Pdf = arrayBufferToBase64(data);
      sessionStorage.setItem("lastPdf", base64Pdf);
    } catch (error) {
      console.error("Failed to save PDF to session storage:", error);
      sessionStorage.removeItem("lastPdf");
    }
  };

  // --- Event Handlers (no changes) ---
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (isPdf) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        setPdfData(data);
        savePdfToSession(data);
      };
      reader.onerror = (e) => {
        console.error("FileReader error:", e);
        alert("An error occurred reading the file.");
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please select a valid PDF file.");
    }
  };

  const handleLoadSample = async () => {
    const sampleUrl = "https://raw.githubusercontent.com/mozilla/pdf.js-sample-files/master/helloworld.pdf";
    try {
      const response = await fetch(sampleUrl);
      const data = await response.arrayBuffer();
      setPdfData(data);
      savePdfToSession(data);
    } catch (error) {
      console.error("Error loading sample PDF:", error);
    }
  };

  const handleStartQuiz = (data) => {
    setQuizData(data);
    setIsQuizModalOpen(true);
  };

  const handleCloseQuiz = () => {
    setIsQuizModalOpen(false);
    setQuizData(null);
  };

  const handleClearSelection = () => {
    setSelectedText("");
    window.getSelection().removeAllRanges();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setPdfData(null);
    setPdfDoc(null);
    setIsToolsVisible(false);
  };

  const handleToggleTools = () => {
    if (!currentUser) {
      alert("Please log in or sign up to use the tools.");
      navigate('/login');
    } else {
      setIsToolsVisible(!isToolsVisible);
    }
  };


  const handleAnnotationDelete = (pageNumber, annotationId, annotationType) => {
    setAnnotations(prev => {
      const pageAnnotations = prev[pageNumber] || { highlights: [], drawings: [] };
      const newAnnotations = { ...prev };
      
      if (annotationType === 'highlight') {
        newAnnotations[pageNumber] = {
          ...pageAnnotations,
          highlights: (pageAnnotations.highlights || []).filter(h => h.id !== annotationId)
        };
      } else if (annotationType === 'drawing') {
        newAnnotations[pageNumber] = {
          ...pageAnnotations,
          drawings: (pageAnnotations.drawings || []).filter(d => d.id !== annotationId)
        };
      }
      
      return newAnnotations;
    });
  };

  const handleClearAllAnnotations = () => {
    if (window.confirm('Are you sure you want to clear all annotations?')) {
      setAnnotations({});
      if (pdfIdRef.current) {
        localStorage.removeItem(`pdf-annotations-${pdfIdRef.current}`);
      }
    }
  };

  const handleFileChangeWithReset = (event) => {
    // Clear annotations when loading new PDF
    if (pdfIdRef.current) {
      localStorage.removeItem(`pdf-annotations-${pdfIdRef.current}`);
    }
    setAnnotations({});
    setActiveTool('none');
    pdfIdRef.current = null;
    handleFileChange(event);
  };

  const handleLoadSampleWithReset = async () => {
    // Clear annotations when loading new PDF
    if (pdfIdRef.current) {
      localStorage.removeItem(`pdf-annotations-${pdfIdRef.current}`);
    }
    setAnnotations({});
    setActiveTool('none');
    pdfIdRef.current = null;
    await handleLoadSample();
  };

  // Splash screen handler
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <div className={`app-container ${isToolsVisible ? 'tools-visible' : ''}`}>
      {/* Splash Screen */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      
      {/* --- THIS IS THE CHANGE --- */}
      {/* We pass the user info and logout function TO the toolbar */}
      <TopToolbar
        onFileChange={handleFileChangeWithReset}
        onLoadSample={handleLoadSampleWithReset}
        onToggleTools={handleToggleTools}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* --- The overlapping auth block has been REMOVED --- */}

      <main id="main-content">
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {pdfDoc && (
            <div style={{ 
              background: '#f8f9fa', 
              borderBottom: '1px solid #dee2e6',
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <AnnotationToolbar
                activeTool={activeTool}
                onToolChange={setActiveTool}
                color={toolColor}
                onColorChange={setToolColor}
                width={toolWidth}
                onWidthChange={setToolWidth}
                onClearAll={handleClearAllAnnotations}
              />
            </div>
          )}
          <ViewerPane 
            pdfDoc={pdfDoc}
            activeTool={activeTool}
            toolColor={toolColor}
            toolWidth={toolWidth}
            annotations={annotations}
            onAnnotationAdd={handleAnnotationAdd}
            onAnnotationDelete={handleAnnotationDelete}
          />
        </div>
        {currentUser && (
          <ToolsPane
            selectedText={selectedText}
            onStartQuiz={handleStartQuiz}
            onClearSelection={handleClearSelection}
          />
        )}
      </main>

      {isQuizModalOpen && <QuizModal quizData={quizData} onClose={handleCloseQuiz} />}
    </div>
  );
}

export default App;