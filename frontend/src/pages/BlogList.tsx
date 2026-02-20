import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getPosts } from '../services/storage';
import { BlogPost } from '../types';
import { Calendar, Clock, Tag, Eye, Search, X } from 'lucide-react';

export const BlogList: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  
  // Search State
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    getPosts().then(data => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Filter logic
  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    const lowerQ = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(lowerQ) ||
      post.summary.toLowerCase().includes(lowerQ) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowerQ))
    );
  });

  const clearSearch = () => {
    setSearchParams({});
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading thoughts...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 relative">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold mb-4 font-serif">Latest Writings</h2>
           <p className="text-gray-500 dark:text-gray-400">Hold any card to peek at the content.</p>
        </div>
        
        {/* Search Input in BlogList */}
        <div className="relative group w-full md:w-64">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
             <Search className="h-4 w-4 text-gray-400" />
           </div>
           <input 
             type="text" 
             placeholder="Search..." 
             className="w-full pl-10 pr-8 py-2 bg-gray-100 dark:bg-zinc-800 border-transparent focus:bg-white dark:focus:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm transition-all outline-none focus:ring-2 focus:ring-blue-500/50"
             value={searchQuery}
             onChange={(e) => setSearchParams(e.target.value ? { search: e.target.value } : {})}
           />
           {searchQuery && (
             <button 
               onClick={clearSearch}
               className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
             >
               <X className="h-4 w-4" />
             </button>
           )}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-gray-300 dark:border-zinc-700">
          <p className="text-gray-500">
            {searchQuery ? `No posts found for "${searchQuery}"` : "No posts yet. Time to study something new!"}
          </p>
          {searchQuery && (
            <button onClick={clearSearch} className="mt-4 text-blue-600 hover:underline">Clear search</button>
          )}
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {filteredPosts.map((post) => (
            <motion.div 
              key={post.id} 
              variants={item}
              className="relative"
            >
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => {
                   // Optional: We could trigger on hover after a delay, but let's stick to explicit long press logic or just visual feedback
                }}
                className="block group cursor-pointer"
                onContextMenu={(e) => {
                  e.preventDefault();
                  setPreviewPost(post);
                }}
                onTouchStart={() => {
                   const timer = setTimeout(() => setPreviewPost(post), 500);
                   (window as any)._pressTimer = timer;
                }}
                onTouchEnd={() => {
                   clearTimeout((window as any)._pressTimer);
                }}
                onMouseDown={() => {
                   const timer = setTimeout(() => setPreviewPost(post), 500);
                   (window as any)._pressTimer = timer;
                }}
                onMouseUp={() => {
                   clearTimeout((window as any)._pressTimer);
                }}
              >
                <Link to={`/blog/${post.id}`}>
                    <article className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-zinc-800 transition-all duration-300 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900/30">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300">
                            {tag}
                        </span>
                        ))}
                    </div>
                    <h3 className="text-2xl font-bold text-ink dark:text-white mb-3 font-serif group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {post.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                        {post.summary}
                    </p>
                    <div className="flex items-center text-sm text-gray-400 dark:text-gray-500 gap-4">
                        <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        {post.readingTime && (
                        <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {post.readingTime} min read
                        </span>
                        )}
                    </div>
                    </article>
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {previewPost && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/20 backdrop-blur-sm" onClick={() => setPreviewPost(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 w-full max-w-lg p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-zinc-700 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold font-serif">{previewPost.title}</h3>
                <button onClick={() => setPreviewPost(null)} className="text-gray-400 hover:text-gray-600">
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
              <div className="prose prose-sm dark:prose-invert">
                 <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                   {previewPost.content.substring(0, 500)}...
                 </p>
              </div>
              <div className="mt-6 flex justify-end">
                <Link 
                  to={`/blog/${previewPost.id}`} 
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700"
                >
                  Read Full Article <Eye size={14} className="ml-2" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};