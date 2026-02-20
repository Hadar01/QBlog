import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { isAuthenticated, logout } from '../services/storage';
import { Lock, LogOut, PenTool, Home, BookOpen } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isAdmin = isAuthenticated();

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const isActive = (path: string) => location.pathname === path ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100";

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-gray-200 dark:border-zinc-800">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          MindStream
        </Link>
        
        <div className="flex items-center space-x-6">
          <Link to="/" className={isActive('/')}>
             <span className="hidden sm:inline">Home</span>
             <Home className="sm:hidden" size={20} />
          </Link>
          <Link to="/blog" className={isActive('/blog')}>
             <span className="hidden sm:inline">Blog</span>
             <BookOpen className="sm:hidden" size={20} />
          </Link>
          
          {isAdmin ? (
            <>
              <Link to="/admin" className={isActive('/admin')}>
                <span className="hidden sm:inline">Admin</span>
                <PenTool className="sm:hidden" size={20} />
              </Link>
              <button onClick={handleLogout} className="text-red-500 hover:text-red-600">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <Link to="/login" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <Lock size={16} />
            </Link>
          )}
          
          <div className="h-6 w-px bg-gray-300 dark:bg-zinc-700 mx-2"></div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};
