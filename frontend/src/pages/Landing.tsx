import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Code, Brain, Zap, MessageSquare, Send } from 'lucide-react';
import { addVisitor, getVisitors, hasUserJoined, setUserJoined } from '../services/visitorStorage';
import { Visitor } from '../types';

export const Landing: React.FC = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [name, setName] = useState('');
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    getVisitors().then(setVisitors);
    setJoined(hasUserJoined());
  }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const updated = await addVisitor(name.trim());
      setVisitors(updated);
      setJoined(true);
      setUserJoined();
      setName('');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      
      {/* Background Bubbles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {visitors.map((visitor, i) => (
          <Bubble key={visitor.id} visitor={visitor} index={i} total={visitors.length} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-2xl w-full z-10"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
          I learn, therefore <br />
          <span className="text-blue-600 dark:text-blue-500">I create.</span>
        </h1>
        
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed max-w-lg mx-auto">
          Welcome to my digital garden. A minimalist collection of thoughts, 
          coding adventures, and summaries of things I'm currently studying.
        </p>

        {/* Visitor Input instead of Search */}
        {!joined ? (
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="max-w-xs mx-auto mb-10"
           >
             <form onSubmit={handleJoin} className="relative group">
                <input
                  type="text"
                  maxLength={15}
                  className="block w-full pl-6 pr-12 py-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-lg hover:shadow-xl text-center"
                  placeholder="What's your name?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!name.trim()}
                  className="absolute inset-y-1 right-1 px-4 rounded-full bg-blue-600 text-white disabled:bg-gray-300 dark:disabled:bg-zinc-700 flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <Send size={16} />
                </button>
             </form>
             <p className="text-xs text-gray-400 mt-2">Join the circle of visitors (active for 24h)</p>
           </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="mb-10 p-4 bg-blue-50 dark:bg-blue-900/10 text-blue-800 dark:text-blue-300 rounded-2xl inline-block"
          >
            <p className="font-medium">Thanks for visiting! You are now part of the circle.</p>
          </motion.div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/blog"
            className="group relative inline-flex items-center justify-center px-8 py-3 font-medium text-white transition-all duration-200 bg-gray-900 dark:bg-white dark:text-gray-900 rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none ring-offset-2 focus:ring-2"
          >
            Read the Log
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl w-full z-10"
      >
        <FeatureItem 
          icon={<Code className="w-6 h-6 text-blue-500" />}
          title="Dev Log"
          desc="Tracking my journey through code, bugs, and breakthroughs."
        />
        <FeatureItem 
          icon={<Brain className="w-6 h-6 text-purple-500" />}
          title="Study Summaries"
          desc="Concise notes on complex topics to solidify understanding."
        />
        <FeatureItem 
          icon={<Zap className="w-6 h-6 text-yellow-500" />}
          title="Quick Thoughts"
          desc="Random musings and ideas that don't fit anywhere else."
        />
      </motion.div>

      {/* Feedback Link */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="mt-20 mb-10 z-10"
      >
        <a href="mailto:aarushpandey820@gmail.com?subject=MindStream Feedback" className="inline-flex items-center text-sm text-gray-400 hover:text-blue-500 transition-colors">
          <MessageSquare className="w-4 h-4 mr-2" />
          Have a suggestion or found a bug? Let me know.
        </a>
      </motion.div>
    </div>
  );
};

// Helper component for individual floating bubbles
const Bubble: React.FC<{ visitor: Visitor, index: number, total: number }> = ({ visitor, index, total }) => {
  // Generate pseudo-random positions based on index to distribute them nicely
  // We want them somewhat around the center but spread out
  const angle = (index / total) * 2 * Math.PI;
  const radius = 200 + Math.random() * 150; // Distance from center
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  // Randomize size slightly
  const size = 60 + Math.random() * 40;
  
  // Randomize float duration
  const duration = 3 + Math.random() * 4;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0.4, 0.7, 0.4],
        scale: 1,
        x: [x, x + 20, x],
        y: [y, y - 30, y],
      }}
      transition={{ 
        opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        x: { duration: duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
        y: { duration: duration * 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
      }}
      className="absolute top-1/2 left-1/2 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-200 to-indigo-200 dark:from-blue-900 dark:to-indigo-900 shadow-lg border border-white/20 backdrop-blur-sm"
      style={{
        width: size,
        height: size,
        marginLeft: -size / 2, // Center anchor
        marginTop: -size / 2, // Center anchor
      }}
    >
      <span className="text-xs font-bold text-blue-900 dark:text-blue-100 truncate px-2 max-w-full">
        {visitor.name}
      </span>
    </motion.div>
  );
};

const FeatureItem = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
    <div className="mb-4 bg-gray-50 dark:bg-zinc-800 w-12 h-12 rounded-xl flex items-center justify-center">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
  </div>
);
