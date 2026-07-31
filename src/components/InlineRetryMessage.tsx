import React from 'react';

interface InlineRetryMessageProps {
  message: string;
  onRetry: () => void;
  onSkip: () => void;
  isRetrying?: boolean;
}

export const InlineRetryMessage: React.FC<InlineRetryMessageProps> = ({
  message,
  onRetry,
  onSkip,
  isRetrying = false,
}) => {
  return (
    <div className="bg-red-900/80 text-white p-3 rounded-md flex items-center gap-4 mt-2">
      <span>{message}</span>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRetrying}
        className="bg-yellow-500 hover:bg-yellow-600 text-black px-2 py-1 rounded"
      >
        {isRetrying ? '重試中...' : '重試'}
      </button>
      <button
        type="button"
        onClick={onSkip}
        className="bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded"
      >
        略過
      </button>
    </div>
  );
};
