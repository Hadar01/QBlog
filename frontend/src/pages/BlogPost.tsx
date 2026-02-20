import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPostById } from '../services/storage';
import { BlogPost } from '../types';
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

export const SinglePost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      getPostById(id).then(data => {
        setPost(data);
        setLoading(false);
      });
    }
  }, [id]);

  // SEO: Update Title and Meta Tags
  useEffect(() => {
    if (!post) return;

    // Update document title
    document.title = `${post.title} | MindStream`;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', post.summary);

    // Update Open Graph tags for better social sharing
    const updateOgTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateOgTag('og:title', post.title);
    updateOgTag('og:description', post.summary);

    // Cleanup: Reset title and description when component unmounts
    return () => {
      document.title = 'MindStream';
      if (metaDesc) {
        metaDesc.setAttribute('content', 'A minimalist, animated blog platform for tracking learning progress.');
      }
    };
  }, [post]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  if (!post) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Post not found</h2>
        <Link to="/blog" className="text-blue-600 hover:underline">Return to Blog</Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-6 py-16">
      <button 
        onClick={() => navigate('/blog')}
        className="group flex items-center text-sm font-medium text-gray-400 hover:text-blue-600 mb-12 transition-colors"
      >
        <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to list
      </button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <header className="mb-12">
          <div className="flex flex-wrap gap-2 mb-6">
             {post.tags.map(tag => (
               <span key={tag} className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                 {tag}
               </span>
             ))}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-ink dark:text-white mb-8 leading-tight font-serif">
            {post.title}
          </h1>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-zinc-800 pb-8">
            <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-400 to-indigo-500 mr-3"></div>
                <span className="font-medium text-gray-900 dark:text-white">Author</span>
            </div>
            <span className="mx-4 text-gray-300">|</span>
            <Calendar size={16} className="mr-2" />
            {new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            <span className="mx-4 text-gray-300">|</span>
            <Clock size={16} className="mr-2" />
            <span>{post.readingTime} min read</span>
          </div>
        </header>

        <div className="prose prose-lg dark:prose-invert prose-slate max-w-none">
          {post.content.split('\n').map((paragraph, idx) => {
             // Basic Markdown simulation for headings
             if (paragraph.startsWith('### ')) {
                 return <h3 key={idx} className="text-2xl font-bold mt-8 mb-4 font-serif text-ink dark:text-white">{paragraph.replace('### ', '')}</h3>
             }
             if (paragraph.startsWith('## ')) {
                 return <h2 key={idx} className="text-3xl font-bold mt-10 mb-6 font-serif text-ink dark:text-white">{paragraph.replace('## ', '')}</h2>
             }
             if (paragraph.trim() === '') return <br key={idx} />;
             
             return (
               <p key={idx} className="mb-6 leading-loose text-gray-700 dark:text-gray-300 font-serif text-[1.125rem]">
                 {paragraph}
               </p>
             )
          })}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-zinc-800">
            <p className="text-sm text-gray-400 italic">
                Published on {new Date(post.createdAt).toLocaleDateString()}
            </p>
        </div>
      </motion.div>
    </article>
  );
};