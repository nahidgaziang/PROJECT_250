import React, { useEffect, useState } from 'react';

function SplashScreen({ onComplete }) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Show animation for 2 seconds, then fade out
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2000);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      // Wait for fade animation to complete before calling onComplete
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 500); // Match fade-out duration
    }, 2500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className={`splash-screen ${isFading ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <h1 className="splash-title">
          <span className="splash-read" style={{ color: 'red' }}>ReaD</span>
          <span className="splash-efy">efy</span>
        </h1>
        <p className="splash-subtitle">
          Your Smart Study Partner
        </p>
      </div>
    </div>
  );
}

export default SplashScreen;

