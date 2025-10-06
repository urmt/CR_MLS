import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  message?: string;
  estimatedDuration?: number; // in milliseconds
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading from Decentralized Database", 
  estimatedDuration = 90000 // 90 seconds default
}) => {
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Initializing IPFS connection...",
    "Connecting to distributed nodes...", 
    "Searching for property data...",
    "Validating database integrity...",
    "Loading property listings...",
    "Finalizing data synchronization..."
  ];

  useEffect(() => {
    const startTime = Date.now();
    
    // Ensure minimum display time for users to see the loading screen
    const minDisplayTime = 3000; // 3 seconds minimum
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setTimeElapsed(elapsed);
      
      // Calculate progress based on time elapsed, but ensure minimum progress speed
      const timeBasedProgress = (elapsed / estimatedDuration) * 100;
      const minProgress = Math.min((elapsed / minDisplayTime) * 30, 30); // Minimum 30% in 3 seconds
      const progressPercent = Math.min(Math.max(timeBasedProgress, minProgress), 95);
      setProgress(progressPercent);
      
      // Update step based on progress
      const stepIndex = Math.min(Math.floor(progressPercent / 16), steps.length - 1);
      setCurrentStep(stepIndex);
      
    }, 100);

    return () => clearInterval(interval);
  }, [estimatedDuration]);

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${remainingSeconds}s`;
  };

  const estimatedRemaining = Math.max(0, estimatedDuration - timeElapsed);

  return (
    <div className="loading-container">
      <div className="loading-content">
        {/* Animated Spinner */}
        <div className="spinner-large"></div>
        
        {/* Main Title */}
        <h2 className="loading-title">{message}</h2>
        
        {/* Current Step */}
        <p className="loading-message">
          {steps[currentStep]}
          <br />
          <span className="loading-estimate">
            {estimatedRemaining > 0 
              ? `Est. ${formatTime(estimatedRemaining)} remaining`
              : "Almost ready..."
            }
          </span>
        </p>
        
        {/* Progress Bar */}
        <div className="loading-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-stats">
            <span className="progress-text">
              {progress.toFixed(0)}% Complete
            </span>
            <span className="time-elapsed">
              {formatTime(timeElapsed)} elapsed
            </span>
          </div>
        </div>

        {/* Network Status */}
        <div className="network-status">
          <div className="status-item">
            <span className={`status-dot ${progress > 10 ? 'connected' : 'connecting'}`}></span>
            <span>IPFS Network</span>
          </div>
          <div className="status-item">
            <span className={`status-dot ${progress > 30 ? 'connected' : 'connecting'}`}></span>
            <span>Database Nodes</span>
          </div>
          <div className="status-item">
            <span className={`status-dot ${progress > 60 ? 'connected' : 'connecting'}`}></span>
            <span>Property Data</span>
          </div>
        </div>

        {/* Tips */}
        <div className="loading-tips">
          <p className="tip">
            💡 <strong>Tip:</strong> This decentralized system ensures your data is always available, 
            even if individual servers go down.
          </p>
          {timeElapsed > 30000 && (
            <p className="tip warning">
              ⚠️ Taking longer than expected? Try refreshing or check your internet connection.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;