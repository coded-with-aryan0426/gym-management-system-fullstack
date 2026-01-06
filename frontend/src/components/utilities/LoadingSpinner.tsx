import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  message,
  className = '',
}) => {
  return (
    <div className={`loading-container ${className}`}>
      <div className={`lottie-wrapper lottie-wrapper--${size}`}>
        <DotLottieReact
          src="https://lottie.host/4a174f4a-851d-4ec0-9813-674a4bea876f/dRUaPkKpJH.lottie"
          loop
          autoplay
        />
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
