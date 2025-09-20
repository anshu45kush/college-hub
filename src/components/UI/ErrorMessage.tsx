import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry, className = '' }) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}>
      <div className="flex items-center">
        <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
        <span className="text-sm text-red-700">{message}</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-auto flex items-center text-sm text-red-600 hover:text-red-800"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;