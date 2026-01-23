import React, { useRef, useState, useEffect, useCallback } from 'react';
import { message } from 'antd';

const WebcamCapture = ({ onImageCapture, onBack }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startWebcam = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCapturedImage(null);
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera access');
      }

      console.log('Requesting camera access...');
      
      // Request permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        },
        audio: false
      });
      
      console.log('Camera stream received:', stream);
      
      // Wait for video element to be available
      const waitForVideoElement = () => {
        return new Promise((resolve, reject) => {
          let attempts = 0;
          const maxAttempts = 50; // 5 seconds max
          
          const checkVideoElement = () => {
            attempts++;
            console.log(`Checking for video element, attempt ${attempts}...`);
            
            if (videoRef.current) {
              console.log('Video element found!');
              resolve(videoRef.current);
            } else if (attempts >= maxAttempts) {
              reject(new Error('Video element not found after waiting'));
            } else {
              setTimeout(checkVideoElement, 100);
            }
          };
          
          checkVideoElement();
        });
      };

      try {
        const videoElement = await waitForVideoElement();
        
        videoElement.srcObject = stream;
        streamRef.current = stream;
        
        console.log('Stream attached to video element');
        
        // Wait for video to be ready and playing
        videoElement.onloadedmetadata = () => {
          console.log('Video metadata loaded');
          if (videoElement) {
            videoElement.play().then(() => {
              console.log('Video playing');
              setIsStreaming(true);
              setIsLoading(false);
              message.success('📹 Camera ready! Position yourself and click capture');
            }).catch(error => {
              console.error('Error playing video:', error);
              setError('Failed to start video playback');
              setIsLoading(false);
            });
          }
        };
        
        // Fallback timeout in case onloadedmetadata doesn't fire
        setTimeout(() => {
          if (videoElement && streamRef.current && !isStreaming) {
            console.log('Fallback: Setting streaming to true');
            setIsStreaming(true);
            setIsLoading(false);
          }
        }, 3000);
        
      } catch (videoError) {
        console.error('Video element error:', videoError);
        setError('Failed to initialize video preview');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error accessing webcam:', error);
      let errorMessage = 'Unable to access webcam';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = '🚫 Camera permission denied. Please click the camera icon in your browser\'s address bar and allow access, then try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = '📹 No camera found. Please connect a camera to your device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = '⚠️ Camera is being used by another application. Please close other camera apps and try again.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = '⚙️ Camera settings not supported. Trying with basic settings...';
        // Try again with basic constraints
        try {
          const basicStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
          if (videoRef.current && basicStream) {
            videoRef.current.srcObject = basicStream;
            streamRef.current = basicStream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play().then(() => {
                setIsStreaming(true);
                setIsLoading(false);
                message.success('📹 Camera ready with basic settings');
              });
            };
            return;
          }
        } catch (basicError) {
          errorMessage = '❌ Camera access failed. Please check your camera permissions.';
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
      message.error(errorMessage);
    }
  }, [isStreaming]);

  // Auto-start webcam on component mount
  useEffect(() => {
    console.log('WebcamCapture mounted, starting webcam...');
    startWebcam();
  }, [startWebcam]);

  const stopWebcam = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setError(null);
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) {
      message.error('Camera not ready for capture');
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to base64
    const base64Image = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(base64Image);
    
    console.log('📸 Image captured automatically calling onImageCapture...');
    
    // Automatically send image to parent component
    if (onImageCapture) {
      onImageCapture(base64Image);
      console.log('✅ Image sent to parent component automatically');
    }
    
    message.success('📸 Photo captured and stored successfully!');
  };

  const confirmImage = () => {
    if (capturedImage && onImageCapture) {
      onImageCapture(capturedImage);
      message.success('✅ Photo confirmed and saved!');
    }
  };

  const retakeImage = () => {
    setCapturedImage(null);
    setError(null);
    if (!isStreaming) {
      startWebcam();
    }
  };

  const handleBack = () => {
    stopWebcam();
    setCapturedImage(null);
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header with back button */}
      {onBack && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h3 className="text-lg font-semibold text-slate-800">📷 Photo Capture</h3>
          <div></div> {/* Spacer for centering */}
        </div>
      )}

      {/* Camera Preview Area */}
      <div className="relative border-2 border-dashed border-indigo-300 rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 shadow-inner">
        <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative">
          
          {/* Live Video Preview */}
          {(isStreaming || isLoading) && !capturedImage && (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                controls={false}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  display: isStreaming ? 'block' : 'none'
                }}
                onLoadedMetadata={() => console.log('Video metadata loaded from element')}
                onPlay={() => console.log('Video started playing')}
                onError={(e) => console.error('Video error:', e)}
                className="w-full h-full object-cover"
              />
              {/* Live indicator - only show when actually streaming */}
              {isStreaming && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  LIVE
                </div>
              )}
              {/* Capture hint - only show when streaming */}
              {isStreaming && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm">
                  Position yourself and click capture
                </div>
              )}
            </>
          )}

          {/* Captured Image Preview */}
          {capturedImage && (
            <>
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                ✓ CAPTURED
              </div>
              {/* Preview hint */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm text-center">
                Review your photo - Confirm to save or Retake if needed
              </div>
            </>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="text-center text-white p-8">
              <div className="space-y-4">
                <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-lg font-semibold">📹 Starting Camera...</p>
                <p className="text-sm text-slate-300">Please allow camera permissions</p>
                <p className="text-xs text-slate-400">Look for permission popup in your browser</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center text-white p-8">
              <div className="space-y-4">
                <div className="text-red-400">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-red-400">Camera Access Required</p>
                <p className="text-sm text-red-300 whitespace-pre-line">{error}</p>
              </div>
            </div>
          )}

          {/* Initial State */}
          {!isStreaming && !capturedImage && !isLoading && !error && (
            <div className="text-center text-white p-8">
              <div className="space-y-4">
                <div className="text-indigo-400">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-xl font-semibold">📹 Webcam Preview</p>
                <p className="text-sm text-slate-300">Click start to begin camera preview</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center flex-wrap">
        
        {/* Start Camera Button */}
        {!isStreaming && !capturedImage && !isLoading && (
          <button
            onClick={startWebcam}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            📹 Start Camera
          </button>
        )}

        {/* Try Again Button (Error State) */}
        {error && !isLoading && (
          <button
            onClick={startWebcam}
            className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            🔄 Try Again
          </button>
        )}

        {/* Live Camera Controls */}
        {isStreaming && !capturedImage && (
          <>
            <button
              onClick={captureImage}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              📸 Capture Photo
            </button>
            <button
              onClick={stopWebcam}
              className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
              </svg>
              🛑 Stop Camera
            </button>
          </>
        )}

        {/* Captured Image Controls */}
        {capturedImage && (
          <>
            <button
              onClick={confirmImage}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              ✅ Use This Photo
            </button>
            <button
              onClick={retakeImage}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              🔄 Retake Photo
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default WebcamCapture;
