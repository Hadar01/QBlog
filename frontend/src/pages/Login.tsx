import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, isAuthenticated } from '../services/storage';
import { Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (isAuthenticated()) {
    navigate('/admin');
    return null;
  }

  // login() is now async — handleSubmit must await it
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(password);
    setLoading(false);
    if (success) {
      navigate('/admin');
    } else {
      setError('Incorrect access code');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-zinc-800">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
            <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Admin Access</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passcode</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Enter'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-gray-400">
          Admin access only.
        </p>
      </div>
    </div>
  );
};
