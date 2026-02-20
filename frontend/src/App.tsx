import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Landing } from './pages/Landing';
import { BlogList } from './pages/BlogList';
import { SinglePost } from './pages/BlogPost';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';
import { VisitorTicker } from './components/VisitorTicker';

const Footer: React.FC = () => (
  <footer className="border-t border-gray-200 dark:border-zinc-800 mt-20">
    <div className="max-w-4xl mx-auto px-4 py-8 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
      <p>&copy; {new Date().getFullYear()} MindStream.</p>
      <p>Built with React & Tailwind</p>
    </div>
  </footer>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col transition-colors duration-300 relative">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:id" element={<SinglePost />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <VisitorTicker />
      </div>
    </HashRouter>
  );
};

export default App;