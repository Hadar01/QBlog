import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { savePost, deletePost, getPosts, getSettings, saveSettings, isAuthenticated } from '../services/storage';
import { enhanceContent, generateTags } from '../services/geminiService';
import { BlogPost, AdminSettings } from '../types';
import { Save, Trash2, Sparkles, Settings, Plus, X, Tag as TagIcon, LayoutDashboard, LogOut, Cloud } from 'lucide-react';
import { logout } from '../services/storage';

interface AdminLayoutProps {
  children: React.ReactNode;
  view: 'list' | 'edit' | 'settings';
  setView: (view: 'list' | 'edit' | 'settings') => void;
  onLogout: () => void;
}

// Distinct Admin Layout Wrapper
const AdminLayout: React.FC<AdminLayoutProps> = ({ children, view, setView, onLogout }) => (
  <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 flex font-sans text-slate-800 dark:text-slate-200">
    <aside className="w-20 md:w-64 bg-slate-900 text-white flex flex-col items-center md:items-start py-8 md:px-6 fixed h-full z-10">
      <div className="font-bold text-xl mb-10 tracking-wider flex items-center gap-2">
         <LayoutDashboard className="text-blue-400" />
         <span className="hidden md:inline">CONSOLE</span>
      </div>
      <nav className="flex flex-col w-full gap-2">
        <button 
          onClick={() => setView('list')} 
          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${view === 'list' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
        >
          <LayoutDashboard size={20} />
          <span className="hidden md:inline">Posts</span>
        </button>
        <button 
          onClick={() => setView('settings')}
          className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${view === 'settings' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}
        >
          <Settings size={20} />
          <span className="hidden md:inline">Settings</span>
        </button>
      </nav>
      <div className="mt-auto w-full">
          <button onClick={onLogout} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-900/50 text-red-400 w-full transition-colors">
              <LogOut size={20} />
              <span className="hidden md:inline">Logout</span>
          </button>
      </div>
    </aside>
    <main className="flex-1 ml-20 md:ml-64 p-6 md:p-10">
      {children}
    </main>
  </div>
);

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [view, setView] = useState<'list' | 'edit' | 'settings'>('list');
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({});
  const [settings, setLocalSettings] = useState<AdminSettings>({});
  
  // Auto-save & State
  const [isNewPost, setIsNewPost] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Refs for auto-save interval
  const currentPostRef = useRef(currentPost);
  const viewRef = useRef(view);
  const isNewPostRef = useRef(isNewPost);

  useEffect(() => {
    currentPostRef.current = currentPost;
    viewRef.current = view;
    isNewPostRef.current = isNewPost;
  }, [currentPost, view, isNewPost]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    refreshPosts();
    setLocalSettings(getSettings());
  }, [navigate]);

  // Auto-save Interval (30s)
  useEffect(() => {
    const interval = setInterval(() => {
      const activeView = viewRef.current;
      const post = currentPostRef.current;
      const isNew = isNewPostRef.current;

      if (activeView === 'edit' && (post.title || post.content)) {
        const key = isNew ? 'mindstream_draft_new' : `mindstream_draft_${post.id}`;
        localStorage.setItem(key, JSON.stringify(post));
        setLastAutoSave(new Date());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const refreshPosts = async () => {
    const data = await getPosts();
    setPosts(data);
  };

  const handleEdit = (post?: BlogPost) => {
    setLastAutoSave(null);
    if (post) {
      setIsNewPost(false);
      // Check for draft
      const draft = localStorage.getItem(`mindstream_draft_${post.id}`);
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setCurrentPost(parsed);
          setLastAutoSave(new Date()); // Indicating loaded from somewhere
        } catch (e) {
          setCurrentPost(post);
        }
      } else {
        setCurrentPost(post);
      }
    } else {
      setIsNewPost(true);
      // Check for new draft
      const draft = localStorage.getItem('mindstream_draft_new');
      if (draft) {
        try {
          const parsed = JSON.parse(draft);
          setCurrentPost(parsed);
          setLastAutoSave(new Date());
        } catch (e) {
          setupNewPost();
        }
      } else {
        setupNewPost();
      }
    }
    setView('edit');
  };

  const setupNewPost = () => {
    setCurrentPost({
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      tags: [],
      content: '',
      title: '',
      summary: ''
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this post?')) {
      await deletePost(id);
      localStorage.removeItem(`mindstream_draft_${id}`);
      refreshPosts();
    }
  };

  const handleSave = async () => {
    if (!currentPost.title || !currentPost.content) return alert('Title and Content required');
    
    const words = currentPost.content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(words / 200);

    const postToSave: BlogPost = {
      id: currentPost.id!,
      title: currentPost.title,
      content: currentPost.content,
      summary: currentPost.summary || currentPost.content.substring(0, 100) + '...',
      tags: currentPost.tags || [],
      createdAt: currentPost.createdAt || new Date().toISOString(),
      readingTime
    };

    await savePost(postToSave);
    
    // Clear draft
    const key = isNewPost ? 'mindstream_draft_new' : `mindstream_draft_${currentPost.id}`;
    localStorage.removeItem(key);
    setLastAutoSave(null);

    await refreshPosts();
    setView('list');
  };

  const handleAiAssist = async (mode: 'summarize' | 'improve' | 'tags') => {
    if (!currentPost.content) return alert("Write some content first!");
    
    setIsEnhancing(true);
    try {
      if (mode === 'summarize') {
        const summary = await enhanceContent(currentPost.content, 'summarize');
        setCurrentPost({ ...currentPost, summary });
      } else if (mode === 'improve') {
        const improved = await enhanceContent(currentPost.content, 'improve');
        setCurrentPost({ ...currentPost, content: improved });
      } else if (mode === 'tags') {
        const tags = await generateTags(currentPost.content);
        setCurrentPost({ ...currentPost, tags });
      }
    } catch (e) {
      alert("AI Error. Check API Key or Console.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const saveAdminSettings = () => {
    saveSettings(settings);
    alert('Settings saved!');
    setView('list');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    window.location.reload();
  };

  if (view === 'settings') {
    return (
      <AdminLayout view={view} setView={setView} onLogout={handleLogout}>
        <h2 className="text-3xl font-bold mb-8 text-slate-800 dark:text-white">Settings</h2>
        <div className="max-w-2xl space-y-6 bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm">
           <div>
             <label className="block text-sm font-bold mb-2 uppercase tracking-wide text-slate-500">n8n Webhook URL</label>
             <input 
                type="text" 
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800"
                value={settings.webhookUrl || ''}
                onChange={e => setLocalSettings({...settings, webhookUrl: e.target.value})}
                placeholder="https://..."
             />
             <p className="text-xs text-slate-500 mt-2">New posts payload will be sent here.</p>
           </div>
           <div className="flex justify-end pt-4">
             <button onClick={saveAdminSettings} className="px-6 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold">Save Changes</button>
           </div>
        </div>
      </AdminLayout>
    );
  }

  if (view === 'edit') {
    return (
      <AdminLayout view={view} setView={setView} onLogout={handleLogout}>
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {currentPost.id ? (isNewPost ? 'New Entry' : 'Edit Post') : 'New Entry'}
              </h2>
              {lastAutoSave && (
                <span className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <Cloud size={12} /> Auto-saved {lastAutoSave.toLocaleTimeString()}
                </span>
              )}
            </div>
            <button onClick={() => setView('list')} className="p-2 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-full">
              <X />
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-sm p-8 space-y-6">
            <input
              type="text"
              placeholder="Title"
              className="text-4xl font-bold font-serif bg-transparent border-none focus:ring-0 placeholder-slate-300 dark:placeholder-zinc-700 w-full p-0"
              value={currentPost.title || ''}
              onChange={e => setCurrentPost({...currentPost, title: e.target.value})}
            />
            
            {/* Tag Section */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800 p-2 rounded-xl">
              <TagIcon size={16} className="text-slate-400 ml-2" />
              <input 
                type="text"
                placeholder="Tags..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
                value={currentPost.tags?.join(', ') || ''}
                onChange={e => setCurrentPost({...currentPost, tags: e.target.value.split(',').map(t => t.trim())})}
              />
              <button 
                 onClick={() => handleAiAssist('tags')}
                 disabled={isEnhancing}
                 className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center gap-1"
              >
                <Sparkles size={12} /> Auto Tags
              </button>
            </div>

            {/* Toolbar */}
            <div className="flex gap-2 border-b border-slate-100 dark:border-zinc-800 pb-4">
               <button 
                 onClick={() => handleAiAssist('improve')}
                 disabled={isEnhancing}
                 className="flex items-center gap-2 text-xs font-medium px-3 py-2 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 rounded-lg hover:bg-purple-100 transition-colors"
               >
                 <Sparkles size={14} /> Improve Writing
               </button>
            </div>

            <textarea
              placeholder="Write your story..."
              className="w-full h-[50vh] bg-transparent border-none focus:ring-0 resize-none leading-relaxed text-lg text-slate-700 dark:text-slate-300"
              value={currentPost.content || ''}
              onChange={e => setCurrentPost({...currentPost, content: e.target.value})}
            />

            <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-xl flex gap-4 items-start">
               <div className="flex-1">
                 <label className="text-xs font-bold uppercase text-slate-400 mb-2 block">Summary</label>
                 <textarea 
                    className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 resize-none"
                    rows={2}
                    placeholder="Short description..."
                    value={currentPost.summary || ''}
                    onChange={e => setCurrentPost({...currentPost, summary: e.target.value})}
                 />
               </div>
               <button 
                  onClick={() => handleAiAssist('summarize')}
                  disabled={isEnhancing}
                  className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                  title="Generate Summary"
               >
                 <Sparkles size={18} />
               </button>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-8 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-slate-200 dark:shadow-none hover:translate-y-[-2px] transition-all"
              >
                <Save size={18} /> Publish
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout view={view} setView={setView} onLogout={handleLogout}>
      <div className="flex justify-between items-center mb-10">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Content Overview</h1>
           <p className="text-slate-500">Manage your digital garden</p>
        </div>
        <button 
          onClick={() => handleEdit()}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
        >
          <Plus size={20} /> Create New
        </button>
      </div>

      <div className="grid gap-4">
        {posts.map(post => (
          <div key={post.id} className="group flex justify-between items-center p-6 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-zinc-600 transition-all">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-1">{post.title}</h3>
              <div className="flex gap-2 text-sm text-slate-400">
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span className="flex gap-1">{post.tags.map(t => <span key={t} className="bg-slate-100 dark:bg-zinc-800 px-1.5 rounded">{t}</span>)}</span>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleEdit(post)}
                className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-blue-50 hover:text-blue-600 font-medium transition-colors"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(post.id)}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};