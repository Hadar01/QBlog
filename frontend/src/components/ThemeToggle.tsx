import React, { useEffect, useState } from 'react';
import { Moon, Sun, BookOpen } from 'lucide-react';
import { StorageKeys } from '../types/index';
import { motion } from 'framer-motion';

type Theme = 'light' | 'dark' | 'kindle';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(StorageKeys.THEME) as Theme;
      if (saved === 'dark' || saved === 'light' || saved === 'kindle') {
        return saved;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    // Reset classes
    root.classList.remove('dark');
    body.classList.remove('kindle');

    // Apply new theme
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'kindle') {
      body.classList.add('kindle');
    }
    
    localStorage.setItem(StorageKeys.THEME, theme);
  }, [theme]);

  const toggleSwitch = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('kindle');
    else setTheme('light');
  };

  const setSpecificTheme = (t: Theme) => {
    setTheme(t);
  };

  return (
    <div className="bg-gray-100 dark:bg-zinc-800 rounded-full p-1 flex items-center relative h-9 w-28 shadow-inner border border-gray-200 dark:border-zinc-700">
       {/* Sliding Background */}
       <motion.div 
         className="absolute top-1 bottom-1 w-8 bg-white dark:bg-zinc-600 rounded-full shadow-sm z-0"
         animate={{ 
           left: theme === 'light' ? 4 : theme === 'dark' ? 38 : 74
         }}
         transition={{ type: "spring", stiffness: 500, damping: 30 }}
       />

       {/* Buttons */}
       <button
         onClick={() => setSpecificTheme('light')}
         className={`relative z-10 w-8 h-7 flex items-center justify-center rounded-full transition-colors ml-1 ${theme === 'light' ? 'text-yellow-500' : 'text-gray-400'}`}
         aria-label="Light Mode"
       >
         <Sun size={14} />
       </button>
       
       <button
         onClick={() => setSpecificTheme('dark')}
         className={`relative z-10 w-8 h-7 flex items-center justify-center rounded-full transition-colors ml-1 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-400'}`}
         aria-label="Dark Mode"
       >
         <Moon size={14} />
       </button>

       <button
         onClick={() => setSpecificTheme('kindle')}
         className={`relative z-10 w-8 h-7 flex items-center justify-center rounded-full transition-colors ml-1 ${theme === 'kindle' ? 'text-amber-800' : 'text-gray-400'}`}
         aria-label="Kindle Mode"
       >
         <BookOpen size={14} />
       </button>
    </div>
  );
};