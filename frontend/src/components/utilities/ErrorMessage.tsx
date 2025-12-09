import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from '../base/Button';
import './ErrorMessage.css';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div className={`error-message ${className}`}>
      <div className="error-message__icon">
        <AlertCircle size={48} />
      </div>
      <h3 className="error-message__title">{title}</h3>
      <p className="error-message__text">{message}</p>
      {onRetry && (
        <Button
          variant="ghost"
          icon={<RefreshCw size={16} />}
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorMessage;
