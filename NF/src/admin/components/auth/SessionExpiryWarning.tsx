import { motion, AnimatePresence } from 'framer-motion';
import { Clock, RefreshCw, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SessionExpiryWarningProps {
  expiresAt: Date;
  onExtend: () => Promise<void>;
  onClose: () => void;
}

export default function SessionExpiryWarning({ 
  expiresAt, 
  onExtend, 
  onClose 
}: SessionExpiryWarningProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [extending, setExtending] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = expiresAt.getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleExtend = async () => {
    setExtending(true);
    try {
      await onExtend();
    } catch (error) {
      console.error('Failed to extend session:', error);
    } finally {
      setExtending(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end justify-center px-4 py-6 pointer-events-none sm:items-start sm:justify-end sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5"
        >
          <div className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <Clock className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-semibold text-gray-900">
                    Session Expiring Soon
                  </h3>
                  <button
                    onClick={onClose}
                    className="ml-4 inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2"
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Your session will expire in{' '}
                  <span className="font-semibold text-amber-600">
                    {timeRemaining}
                  </span>
                  . Extend your session to continue working.
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={handleExtend}
                    disabled={extending}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {extending ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Extending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Extend Session
                      </>
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-800 focus:ring-offset-2 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-red-500"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ 
                duration: 5 * 60, // 5 minutes
                ease: 'linear' 
              }}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
