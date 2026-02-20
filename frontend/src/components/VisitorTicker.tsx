import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getVisitors } from '../services/visitorStorage';
import { Visitor } from '../types';
import { User } from 'lucide-react';

export const VisitorTicker: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Initial load
    getVisitors().then(setVisitors);

    // Poll every 60 seconds to pick up new visitors from other browsers
    const interval = setInterval(() => {
      getVisitors().then(setVisitors);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (visitors.length === 0) return;

    // Cycle through names every 4 seconds
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visitors.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [visitors.length]);

  if (visitors.length === 0) return null;

  const currentVisitor = visitors[currentIndex];

  const getTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="fixed bottom-6 left-6 z-40 pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentVisitor.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200 dark:border-zinc-800 rounded-full px-4 py-2 shadow-lg flex items-center gap-3"
        >
          <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full">
            <User size={14} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-none">
              {currentVisitor.name}
            </span>
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              visited {getTimeAgo(currentVisitor.timestamp)}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
