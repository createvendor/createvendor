'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, query, where, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Pencil, 
  Calendar, 
  Loader2, 
  Search, 
  Eye, 
  ChevronRight,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  shortDescription?: string;
  coverImage: string;
  isPublished: boolean;
  tags: any;
  storeId: string;
  createdAt: any;
}

export default function BlogPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = params?.storeId as string;
  const { showToast } = useToast();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!storeId) return;

    const q = query(collection(db, 'blogPosts'), where('storeId', '==', storeId));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost));
      data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setPosts(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await deleteDoc(doc(db, 'blogPosts', id));
      showToast('Blog post deleted', 'success');
    } catch (err) {
      showToast('Failed to delete post', 'error');
    }
  };

  const filtered = posts.filter(p => {
    const s = searchQuery.toLowerCase();
    const titleMatch = p.title?.toLowerCase().includes(s);
    const tagsString = Array.isArray(p.tags) ? p.tags.join(' ') : (typeof p.tags === 'string' ? p.tags : '');
    const tagMatch = tagsString.toLowerCase().includes(s);
    
    const matchesSearch = titleMatch || tagMatch;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && p.isPublished) ||
      (statusFilter === 'draft' && !p.isPublished);
    return matchesSearch && matchesStatus;
  });

  const formatDate = (ts: any) => {
    if (!ts) return 'just now';
    const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white md:bg-[#fafafa] p-6 md:p-12 font-sans pb-32">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 leading-tight">Blog Posts</h1>
            <p className="text-[14px] text-gray-500 mt-1">Manage your shop's blog articles and updates</p>
          </div>
          <button 
            onClick={() => router.push(`/dashboard/${storeId}/website/blog/create`)}
            className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-blue-700 shadow-sm transition-all flex items-center justify-center gap-2 text-[13px] active:scale-95 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> Create Blog
          </button>
        </div>

        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search blogs..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-[14px] outline-none focus:border-blue-500 transition-all font-medium"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-[14px] font-bold text-gray-700 outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.length === 0 ? (
            <div className="col-span-full py-24 bg-white rounded-xl border border-gray-200 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 mx-auto">
                <BookOpen className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-[16px] font-bold text-gray-900">No blogs found</h3>
              <p className="text-[13px] text-gray-500 mt-1 px-8 max-w-sm mx-auto">Create your first blog post to start engaging with your customers.</p>
              <button 
                onClick={() => router.push(`/dashboard/${storeId}/website/blog/create`)}
                className="mt-6 text-blue-600 font-bold text-[13px] hover:underline flex items-center gap-1.5 mx-auto"
              >
                Create your first blog <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            filtered.map((post) => (
              <div 
                key={post.id}
                className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full"
              >
                <div className="relative aspect-[16/9] bg-gray-50 overflow-hidden">
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                      <BookOpen className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`text-[9px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider ${post.isPublished ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'}`}>
                      {post.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{formatDate(post.createdAt)}</span>
                  </div>
                  <h3 className="text-[17px] font-bold text-gray-900 leading-tight mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-[13px] text-gray-500 font-medium leading-relaxed line-clamp-2 mb-6">
                    {post.shortDescription || post.excerpt}
                  </p>
                  
                  <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                    <button 
                      onClick={() => router.push(`/dashboard/${storeId}/website/blog/${post.id}`)}
                      className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                      title="Edit Post"
                    >
                      <Pencil className="h-4.5 w-4.5" />
                    </button>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => window.open(`/store/${storeId}/blog/${post.id}`, '_blank')}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all"
                        title="View Post"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Delete Post"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
