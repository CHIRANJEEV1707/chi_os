'use client';

import { useState, useEffect, useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

type AdminSection = 'blog' | 'projects' | 'experience' | 'guestbook' | 'thoughts' | 'settings';

// ============================
// Shared Components
// ============================

const AdminToast = ({ message, type }: { message: string, type: 'success' | 'error' }) => (
    <p className={cn('font-body text-sm mt-2', type === 'success' ? 'text-green-400' : 'text-destructive')}>
        &gt; {message}
    </p>
);

// ============================
//  Blog Manager
// ============================
const BlogManager = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPost, setEditingPost] = useState<any | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });
        if (!error) setPosts(data || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async (data: any) => {
        try {
            if (editingPost?.id) {
                await supabase.from('blog_posts').update({
                    ...data,
                    updated_at: new Date().toISOString()
                }).eq('id', editingPost.id);
                showToast('POST UPDATED. [OK]', 'success');
            } else {
                await supabase.from('blog_posts').insert([{
                    ...data,
                    published: false
                }]);
                showToast('POST CREATED. [OK]', 'success');
            }
            setEditingPost(null);
            fetchPosts();
        } catch (err: any) {
            showToast(`ERROR: ${err.message}`, 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            const { error } = await supabase.from('blog_posts').delete().eq('id', id);
            if (!error) showToast('POST DELETED. [OK]', 'success');
            else showToast(`ERROR: ${error.message}`, 'error');
            fetchPosts();
        }
    };

    const handlePublishToggle = async (post: any) => {
        await supabase.from('blog_posts').update({
            published: !post.published,
            updated_at: new Date().toISOString()
        }).eq('id', post.id);
        showToast(post.published ? 'POST UNPUBLISHED. [OK]' : 'POST PUBLISHED. [OK]', 'success');
        fetchPosts();
    };

    if (editingPost) {
        return <BlogPostForm post={editingPost} onSave={handleSave} onCancel={() => setEditingPost(null)} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-headline text-lg">Blog Posts</h2>
                <button onClick={() => setEditingPost({})} className="font-headline text-[7px] px-3 py-1 border-2 border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground">
                    + NEW POST
                </button>
            </div>
            {toast && <AdminToast message={toast.message} type={toast.type} />}
            {loading ? <p className="font-body text-primary animate-pulse">&gt; Loading posts...</p> : (
                <div className="flex flex-col gap-2">
                    {posts.map(post => (
                        <div key={post.id} className="p-2 border border-primary/20 flex justify-between items-center">
                            <div>
                                <p className="font-headline text-sm">{post.title}</p>
                                <p className="text-xs text-primary/60">{format(new Date(post.created_at), 'yyyy-MM-dd')}
                                <span className={cn('ml-4 font-bold', post.published ? 'text-green-400' : 'text-amber-400')}>{post.published ? 'PUBLISHED' : 'DRAFT'}</span></p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handlePublishToggle(post)} className="font-headline text-[7px] p-1 border border-primary/50 hover:bg-green-500/20">{post.published ? 'UNPUBLISH' : 'PUBLISH'}</button>
                                <button onClick={() => setEditingPost(post)} className="font-headline text-[7px] p-1 border border-primary/50 hover:bg-accent/20">EDIT</button>
                                <button onClick={() => handleDelete(post.id)} className="font-headline text-[7px] p-1 border border-destructive/50 text-destructive hover:bg-destructive/20">DELETE</button>
                            </div>
                        </div>
                    ))}
                    {posts.length === 0 && <p className="font-body text-primary/60">&gt; No posts yet. Create one!</p>}
                </div>
            )}
        </div>
    );
};

const BlogPostForm = ({ post, onSave, onCancel }: { post: any, onSave: (data: any) => void, onCancel: () => void }) => {
    const { register, handleSubmit, watch } = useForm({ defaultValues: { 
        title: post?.title || '',
        tags: post?.tags?.join(', ') || '',
        content: post?.content || '',
        read_time: post?.read_time || 5,
    }});
    const content = watch('content');
    const [showPreview, setShowPreview] = useState(false);

    const onSubmit = (data: any) => {
        const tags = data.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
        onSave({ ...data, tags, read_time: Number(data.read_time) });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
             <h2 className="font-headline text-lg">{post.id ? 'Edit Post' : 'Create Post'}</h2>
             <div>
                <label className="font-headline text-[8px]">TITLE</label>
                <input {...register('title')} className="w-full bg-input border border-primary/50 p-2 text-primary outline-none" />
             </div>
             <div className="flex gap-4">
                <div className="flex-1">
                    <label className="font-headline text-[8px]">TAGS (comma-separated)</label>
                    <input {...register('tags')} className="w-full bg-input border border-primary/50 p-2 text-primary outline-none" />
                </div>
                <div className="w-24">
                    <label className="font-headline text-[8px]">READ TIME</label>
                    <input {...register('read_time')} type="number" className="w-full bg-input border border-primary/50 p-2 text-primary outline-none" />
                </div>
             </div>
             <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="font-headline text-[8px]">CONTENT (Markdown)</label>
                    <button type="button" onClick={() => setShowPreview(p => !p)} className="font-headline text-[7px] p-1 border border-primary/50">{showPreview ? 'EDIT' : 'PREVIEW'}</button>
                </div>
                {showPreview ? (
                     <div className="p-4 border border-primary/30 h-96 overflow-y-auto prose-invert prose-p:font-body prose-p:text-lg">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </div>
                ) : (
                    <textarea {...register('content')} rows={15} className="w-full bg-input border border-primary/50 p-2 text-primary outline-none font-mono" />
                )}
             </div>
             <div className="flex gap-4">
                <button type="submit" className="font-headline text-[7px] px-3 py-1 border-2 border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground">SAVE</button>
                <button type="button" onClick={onCancel} className="font-headline text-[7px] px-3 py-1 border-2 border-destructive/50 text-destructive hover:bg-destructive/20">CANCEL</button>
             </div>
        </form>
    )
}

// ============================
//  Projects Manager
// ============================
const ProjectsManager = () => {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<any | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('order', { ascending: true });
        if (!error) setProjects(data || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async (data: any) => {
        try {
            if (editing?.id) {
                const { error } = await supabase.from('projects').update(data).eq('id', editing.id);
                if (error) throw error;
                showToast('PROJECT UPDATED. [OK]', 'success');
            } else {
                const { error } = await supabase.from('projects').insert([data]);
                if (error) throw error;
                showToast('PROJECT CREATED. [OK]', 'success');
            }
            setEditing(null);
            fetchProjects();
        } catch (err: any) {
            showToast(`ERROR: ${err.message}`, 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this project?')) {
            const { error } = await supabase.from('projects').delete().eq('id', id);
            if (!error) showToast('PROJECT DELETED. [OK]', 'success');
            else showToast(`ERROR: ${error.message}`, 'error');
            fetchProjects();
        }
    };

    if (editing) {
        return <ProjectForm project={editing} onSave={handleSave} onCancel={() => setEditing(null)} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-headline text-lg">Projects</h2>
                <button onClick={() => setEditing({})} className="font-headline text-[7px] px-3 py-1 border-2 border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground">
                    + NEW PROJECT
                </button>
            </div>
            {toast && <AdminToast message={toast.message} type={toast.type} />}
            {loading ? <p className="font-body text-primary animate-pulse">&gt; Loading projects...</p> : (
                <div className="flex flex-col gap-2">
                    {projects.map(p => (
                        <div key={p.id} className="p-2 border border-primary/20 flex justify-between items-center">
                            <div>
                                <p className="font-headline text-sm">{p.title}</p>
                                <p className="text-xs text-primary/60">
                                    {p.category?.toUpperCase()} • {p.status?.toUpperCase()}
                                    {p.featured && <span className="ml-2 text-amber-400">★ FEATURED</span>}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditing(p)} className="font-headline text-[7px] p-1 border border-primary/50 hover:bg-accent/20">EDIT</button>
                                <button onClick={() => handleDelete(p.id)} className="font-headline text-[7px] p-1 border border-destructive/50 text-destructive hover:bg-destructive/20">DELETE</button>
                            </div>
                        </div>
                    ))}
                    {projects.length === 0 && <p className="font-body text-primary/60">&gt; No projects yet. Create one!</p>}
                </div>
            )}
        </div>
    );
};

const ProjectForm = ({ project, onSave, onCancel }: { project: any, onSave: (data: any) => void, onCancel: () => void }) => {
    const { register, handleSubmit } = useForm({ defaultValues: {
        title: project?.title || '',
        description: project?.description || '',
        tech_stack: project?.tech_stack?.join(', ') || '',
        github_url: project?.github_url || '',
        live_url: project?.live_url || '',
        status: project?.status || 'wip',
        category: project?.category || 'web',
        featured: project?.featured || false,
        order: project?.order || 0,
    }});

    const onSubmit = (data: any) => {
        const tech_stack = data.tech_stack.split(',').map((t: string) => t.trim()).filter(Boolean);
        onSave({ ...data, tech_stack, order: Number(data.order), featured: Boolean(data.featured) });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <h2 className="font-headline text-lg">{project.id ? 'Edit Project' : 'Create Project'}</h2>
            <div>
                <label className="font-headline text-[8px]">TITLE</label>
                <input {...register('title')} className="w-full bg-input border border-primary/50 p-2 text-primary outline-none" />
            </div>
            <div>
                <label className="font-headline text-[8px]">DESCRIPTION</label>
                <textarea {...register('description')} rows={3} className="w-full bg-input border border-primary/50 p-2 text-primary outline-none" />
            </div>
            <div>
                <label className="font-headline text-[8px]">TECH STACK (comma-separated)</label>
                <input {...register('tech_stack')} className="w-full bg-input border border-primary/50 p-2 text-primary outline-none" />
            </div>
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="font-headline text-[8px]">GITHUB URL</label>
                    <input {...register('github_url')} className="w-full bg-input border border-primary/50 p-2 text-primary outline-none" />
                </div>
                <div className="flex-1">
                    <label className="font-headline text-[8px]">LIVE URL</label>
                    <input {...register('live_url')} className="w-full bg-input border border-primary/50 p-2 text-primary outline-none" />
                </div>
            </div>
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="font-headline text-[8px]">STATUS</label>
                    <select {...register('status')} className="w-full bg-input border border-primary/50 p-2 text-primary outline-none">
                        <option value="live">LIVE</option>
                        <option value="wip">WIP</option>
                        <option value="archived">ARCHIVED</option>
                    </select>
                </div>
                <div className="flex-1">
                    <label className="font-headline text-[8px]">CATEGORY</label>
                    <select {...register('category')} className="w-full bg-input border border-primary/50 p-2 text-primary outline-none">
                        <option value="web">Web</option>
                        <option value="mobile">Mobile</option>
                        <option value="ai-ml">AI/ML</option>
                        <option value="open-source">Open Source</option>
                    </select>
                </div>
                <div className="w-20">
                    <label className="font-headline text-[8px]">ORDER</label>
                    <input {...register('order')} type="number" className="w-full bg-input border border-primary/50 p-2 text-primary outline-none" />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <input {...register('featured')} type="checkbox" id="featured" className="accent-primary" />
                <label htmlFor="featured" className="font-headline text-[8px]">FEATURED</label>
            </div>
            <div className="flex gap-4">
                <button type="submit" className="font-headline text-[7px] px-3 py-1 border-2 border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground">SAVE</button>
                <button type="button" onClick={onCancel} className="font-headline text-[7px] px-3 py-1 border-2 border-destructive/50 text-destructive hover:bg-destructive/20">CANCEL</button>
            </div>
        </form>
    );
};

// ============================
//  Experience Manager
// ============================
const ExperienceManager = () => {
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<any | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const fetchEntries = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('experience')
            .select('*')
            .order('order', { ascending: true });
        if (!error) setEntries(data || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchEntries(); }, [fetchEntries]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async (data: any) => {
        try {
            if (editing?.id) {
                const { error } = await supabase.from('experience').update(data).eq('id', editing.id);
                if (error) throw error;
                showToast('ENTRY UPDATED. [OK]', 'success');
            } else {
                const { error } = await supabase.from('experience').insert([data]);
                if (error) throw error;
                showToast('ENTRY CREATED. [OK]', 'success');
            }
            setEditing(null);
            fetchEntries();
        } catch (err: any) {
            showToast(`ERROR: ${err.message}`, 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this entry?')) {
            const { error } = await supabase.from('experience').delete().eq('id', id);
            if (!error) showToast('ENTRY DELETED. [OK]', 'success');
            else showToast(`ERROR: ${error.message}`, 'error');
            fetchEntries();
        }
    };

    if (editing) {
        return <ExperienceForm entry={editing} onSave={handleSave} onCancel={() => setEditing(null)} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-headline text-lg">Experience</h2>
                <button onClick={() => setEditing({})} className="font-headline text-[7px] px-3 py-1 border-2 border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground">
                    + NEW ENTRY
                </button>
            </div>
            {toast && <AdminToast message={toast.message} type={toast.type} />}
            {loading ? <p className="font-body text-primary animate-pulse">&gt; Loading experience...</p> : (
                <div className="flex flex-col gap-2">
                    {entries.map(e => (
                        <div key={e.id} className="p-2 border border-primary/20 flex justify-between items-center">
                            <div>
                                <p className="font-headline text-sm">{e.company}</p>
                                <p className="text-xs text-primary/60">{e.role} • {e.start_date} → {e.end_date || 'Present'}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setEditing(e)} className="font-headline text-[7px] p-1 border border-primary/50 hover:bg-accent/20">EDIT</button>
                                <button onClick={() => handleDelete(e.id)} className="font-headline text-[7px] p-1 border border-destructive/50 text-destructive hover:bg-destructive/20">DELETE</button>
                            </div>
                        </div>
                    ))}
                    {entries.length === 0 && <p className="font-body text-primary/60">&gt; No entries yet. Create one!</p>}
                </div>
            )}
        </div>
    );
};

const ExperienceForm = ({ entry, onSave, onCancel }: { entry: any, onSave: (data: any) => void, onCancel: () => void }) => {
    const { register, handleSubmit } = useForm({ defaultValues: {
        company: entry?.company || '',
        role: entry?.role || '',
        start_date: entry?.start_date || '',
        end_date: entry?.end_date || '',
        description_bullets: entry?.description_bullets?.join('\n') || '',
        tech_stack: entry?.tech_stack?.join(', ') || '',
        order: entry?.order || 0,
    }});

    const onSubmit = (data: any) => {
        const description_bullets = data.description_bullets.split('\n').map((b: string) => b.trim()).filter(Boolean);
        const tech_stack = data.tech_stack.split(',').map((t: string) => t.trim()).filter(Boolean);
        onSave({ ...data, description_bullets, tech_stack, order: Number(data.order) });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <h2 className="font-headline text-lg">{entry.id ? 'Edit Entry' : 'Create Entry'}</h2>
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="font-headline text-[8px]">COMPANY</label>
                    <input {...register('company')} className="w-full bg-input border border-primary/50 p-2 text-primary outline-none" />
                </div>
                <div className="flex-1">
                    <label className="font-headline text-[8px]">ROLE</label>
                    <input {...register('role')} className="w-full bg-input border border-primary/50 p-2 text-primary outline-none" />
                </div>
            </div>
            <div className="flex gap-4">
                <div className="flex-1">
                    <label className="font-headline text-[8px]">START DATE</label>
                    <input {...register('start_date')} placeholder="e.g., Jun 2023" className="w-full bg-input border border-primary/50 p-2 text-primary outline-none" />
                </div>
                <div className="flex-1">
                    <label className="font-headline text-[8px]">END DATE</label>
                    <input {...register('end_date')} placeholder="e.g., Aug 2023 (leave empty for Present)" className="w-full bg-input border border-primary/50 p-2 text-primary outline-none" />
                </div>
                <div className="w-20">
                    <label className="font-headline text-[8px]">ORDER</label>
                    <input {...register('order')} type="number" className="w-full bg-input border border-primary/50 p-2 text-primary outline-none" />
                </div>
            </div>
            <div>
                <label className="font-headline text-[8px]">DESCRIPTION BULLETS (one per line)</label>
                <textarea {...register('description_bullets')} rows={5} className="w-full bg-input border border-primary/50 p-2 text-primary outline-none font-mono" />
            </div>
            <div>
                <label className="font-headline text-[8px]">TECH STACK (comma-separated)</label>
                <input {...register('tech_stack')} className="w-full bg-input border border-primary/50 p-2 text-primary outline-none" />
            </div>
            <div className="flex gap-4">
                <button type="submit" className="font-headline text-[7px] px-3 py-1 border-2 border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground">SAVE</button>
                <button type="button" onClick={onCancel} className="font-headline text-[7px] px-3 py-1 border-2 border-destructive/50 text-destructive hover:bg-destructive/20">CANCEL</button>
            </div>
        </form>
    );
};

// ============================
//  Guestbook Moderator
// ============================
const GuestbookModerator = () => {
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const fetchEntries = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('guestbook')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200);
        if (!error) setEntries(data || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchEntries(); }, [fetchEntries]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this guestbook entry?')) {
            const { error } = await supabase.from('guestbook').delete().eq('id', id);
            if (!error) {
                showToast('ENTRY DELETED. [OK]', 'success');
                setEntries(prev => prev.filter(e => e.id !== id));
            } else {
                showToast(`ERROR: ${error.message}`, 'error');
            }
        }
    };

    return (
        <div>
            <h2 className="font-headline text-lg mb-4">Guestbook Moderator</h2>
            <p className="font-body text-sm text-primary/60 mb-3">&gt; {entries.length} entries total</p>
            {toast && <AdminToast message={toast.message} type={toast.type} />}
            {loading ? <p className="font-body text-primary animate-pulse">&gt; Loading entries...</p> : (
                <div className="flex flex-col gap-2">
                    {entries.map(e => (
                        <div key={e.id} className="p-2 border border-primary/20 flex justify-between items-start">
                            <div>
                                <p className="font-headline text-[8px]">
                                    <span className="text-amber-400">#{String(e.visitor_num || 0).padStart(3, '0')}</span> {e.name}
                                    {e.location && <span className="text-primary/50"> from {e.location}</span>}
                                </p>
                                <p className="font-body text-sm text-primary/80 mt-1">"{e.message}"</p>
                                <p className="text-xs text-primary/40 mt-1">{e.created_at ? format(new Date(e.created_at), 'yyyy-MM-dd HH:mm') : 'unknown'}</p>
                            </div>
                            <button onClick={() => handleDelete(e.id)} className="font-headline text-[7px] p-1 border border-destructive/50 text-destructive hover:bg-destructive/20 flex-shrink-0">DELETE</button>
                        </div>
                    ))}
                    {entries.length === 0 && <p className="font-body text-primary/60">&gt; No entries yet.</p>}
                </div>
            )}
        </div>
    );
};

// ============================
//  Thoughts Manager
// ============================
const ThoughtsManager = () => {
    const [thoughts, setThoughts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<any | null>(null);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    const fetchThoughts = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('thoughts')
            .select('*')
            .order('created_at', { ascending: false });
        if (!error) setThoughts(data || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchThoughts(); }, [fetchThoughts]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async (data: any) => {
        try {
            if (editing?.id) {
                const { error } = await supabase.from('thoughts').update(data).eq('id', editing.id);
                if (error) throw error;
                showToast('THOUGHT UPDATED. [OK]', 'success');
            } else {
                const { error } = await supabase.from('thoughts').insert([data]);
                if (error) throw error;
                showToast('THOUGHT CREATED. [OK]', 'success');
            }
            setEditing(null);
            fetchThoughts();
        } catch (err: any) {
            showToast(`ERROR: ${err.message}`, 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this thought?')) {
            const { error } = await supabase.from('thoughts').delete().eq('id', id);
            if (!error) showToast('THOUGHT DELETED. [OK]', 'success');
            else showToast(`ERROR: ${error.message}`, 'error');
            fetchThoughts();
        }
    };

    if (editing) {
        return <ThoughtForm thought={editing} onSave={handleSave} onCancel={() => setEditing(null)} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-headline text-lg">Thoughts</h2>
                <button onClick={() => setEditing({})} className="font-headline text-[7px] px-3 py-1 border-2 border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground">
                    + NEW THOUGHT
                </button>
            </div>
            {toast && <AdminToast message={toast.message} type={toast.type} />}
            {loading ? <p className="font-body text-primary animate-pulse">&gt; Loading thoughts...</p> : (
                <div className="flex flex-col gap-2">
                    {thoughts.map(t => (
                        <div key={t.id} className="p-2 border border-primary/20 flex justify-between items-start">
                            <div className="flex-1 mr-2">
                                <p className="font-headline text-[7px] text-amber-400">{t.category?.toUpperCase()}</p>
                                <p className="font-body text-sm text-primary/80 mt-1">{t.content}</p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <button onClick={() => setEditing(t)} className="font-headline text-[7px] p-1 border border-primary/50 hover:bg-accent/20">EDIT</button>
                                <button onClick={() => handleDelete(t.id)} className="font-headline text-[7px] p-1 border border-destructive/50 text-destructive hover:bg-destructive/20">DELETE</button>
                            </div>
                        </div>
                    ))}
                    {thoughts.length === 0 && <p className="font-body text-primary/60">&gt; No thoughts yet. Create one!</p>}
                </div>
            )}
        </div>
    );
};

const ThoughtForm = ({ thought, onSave, onCancel }: { thought: any, onSave: (data: any) => void, onCancel: () => void }) => {
    const { register, handleSubmit } = useForm({ defaultValues: {
        content: thought?.content || '',
        category: thought?.category || 'product',
    }});

    return (
        <form onSubmit={handleSubmit(onSave)} className="space-y-3">
            <h2 className="font-headline text-lg">{thought.id ? 'Edit Thought' : 'New Thought'}</h2>
            <div>
                <label className="font-headline text-[8px]">CATEGORY</label>
                <select {...register('category')} className="w-full bg-input border border-primary/50 p-2 text-primary outline-none">
                    <option value="product">Product</option>
                    <option value="startups">Startups</option>
                    <option value="tech">Tech</option>
                    <option value="random">Random</option>
                </select>
            </div>
            <div>
                <label className="font-headline text-[8px]">CONTENT (max 280 chars)</label>
                <textarea {...register('content')} rows={4} maxLength={280} className="w-full bg-input border border-primary/50 p-2 text-primary outline-none" />
            </div>
            <div className="flex gap-4">
                <button type="submit" className="font-headline text-[7px] px-3 py-1 border-2 border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground">SAVE</button>
                <button type="button" onClick={onCancel} className="font-headline text-[7px] px-3 py-1 border-2 border-destructive/50 text-destructive hover:bg-destructive/20">CANCEL</button>
            </div>
        </form>
    );
};

// ============================
//  Settings Manager
// ============================
const SettingsManager = () => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('settings').select('*');
            if (data) {
                const settingsObj: Record<string, string> = {};
                data.forEach((s: any) => settingsObj[s.key] = s.value);
                setSettings(settingsObj);
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleSave = async (key: string, value: string) => {
        const { error } = await supabase.from('settings').upsert({
            key,
            value,
            updated_at: new Date().toISOString()
        }, { onConflict: 'key' });
        if (!error) {
            setSettings(prev => ({ ...prev, [key]: value }));
            showToast(`SETTING "${key}" SAVED. [OK]`, 'success');
        } else {
            showToast(`ERROR: ${error.message}`, 'error');
        }
    };

    const settingKeys = [
        { key: 'site_title', label: 'Site Title', placeholder: 'CHIRU-OS' },
        { key: 'owner_name', label: 'Owner Name', placeholder: 'Chiranjeev Agarwal' },
        { key: 'owner_email', label: 'Owner Email', placeholder: 'chiranjeev@email.com' },
        { key: 'github_url', label: 'GitHub URL', placeholder: 'https://github.com/chiranjeev-agarwal' },
        { key: 'linkedin_url', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/chiranjeev-agarwal' },
        { key: 'resume_url', label: 'Resume URL', placeholder: 'https://...' },
    ];

    if (loading) return <p className="font-body text-primary animate-pulse">&gt; Loading settings...</p>;

    return (
        <div>
            <h2 className="font-headline text-lg mb-4">Settings</h2>
            {toast && <AdminToast message={toast.message} type={toast.type} />}
            <div className="flex flex-col gap-3">
                {settingKeys.map(s => (
                    <SettingRow
                        key={s.key}
                        label={s.label}
                        value={settings[s.key] || ''}
                        placeholder={s.placeholder}
                        onSave={(val) => handleSave(s.key, val)}
                    />
                ))}
            </div>
        </div>
    );
};

const SettingRow = ({ label, value, placeholder, onSave }: { label: string, value: string, placeholder: string, onSave: (val: string) => void }) => {
    const [val, setVal] = useState(value);
    const isDirty = val !== value;

    return (
        <div className="flex items-center gap-3">
            <label className="font-headline text-[8px] w-32 flex-shrink-0">{label}</label>
            <input
                value={val}
                onChange={(e) => setVal(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-input border border-primary/50 p-2 text-primary outline-none text-sm"
            />
            {isDirty && (
                <button onClick={() => onSave(val)} className="font-headline text-[7px] px-2 py-1 border border-green-400 text-green-400 hover:bg-green-400/20">
                    SAVE
                </button>
            )}
        </div>
    );
};


// ============================
//  Navigation
// ============================

const NavItem = ({ label, icon, isActive, onClick }: { label: string, icon: string, isActive: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={cn(
            'w-full text-left font-headline text-[7px] p-2 border-2 flex items-center gap-2',
            isActive ? 'bg-primary text-primary-foreground border-primary' : 'border-primary/30 text-primary hover:bg-accent/20'
        )}
    >
        <span>{icon}</span>
        <span>{label}</span>
    </button>
);

// ============================
//  Main Admin Component
// ============================

export default function AdminPage() {
    const [activeSection, setActiveSection] = useState<AdminSection>('blog');
    const { play } = useSoundEffect();
    
    const handleSignOut = async () => {
        play('windowClose');
        await signOut(auth);
        window.location.href = '/';
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'blog': return <BlogManager />;
            case 'projects': return <ProjectsManager />;
            case 'experience': return <ExperienceManager />;
            case 'guestbook': return <GuestbookModerator />;
            case 'thoughts': return <ThoughtsManager />;
            case 'settings': return <SettingsManager />;
            default: return <BlogManager />;
        }
    };

    const menuItems = [
        { id: 'blog', label: 'BLOG POSTS', icon: '📝' },
        { id: 'projects', label: 'PROJECTS', icon: '🗂️' },
        { id: 'experience', label: 'EXPERIENCE', icon: '💼' },
        { id: 'guestbook', label: 'GUESTBOOK', icon: '📖' },
        { id: 'thoughts', label: 'THOUGHTS', icon: '💭' },
        { id: 'settings', label: 'SETTINGS', icon: '⚙️' },
    ];

    return (
        <div className="h-screen w-full flex bg-desktop-bg text-primary font-body">
            <aside className="w-52 flex-shrink-0 bg-window-bg border-r-2 border-primary/30 p-2 flex flex-col">
                <h1 className="font-headline text-sm p-2 text-center">ADMIN PANEL</h1>
                <div className="flex flex-col gap-2 mt-4 flex-grow">
                    {menuItems.map(item => (
                        <NavItem
                            key={item.id}
                            label={item.label}
                            icon={item.icon}
                            isActive={activeSection === item.id}
                            onClick={() => { play('click'); setActiveSection(item.id as AdminSection); }}
                        />
                    ))}
                </div>
                <NavItem
                    label="SIGN OUT"
                    icon="🚪"
                    isActive={false}
                    onClick={handleSignOut}
                />
            </aside>
            <main className="flex-grow p-4 overflow-y-auto">
                {renderSection()}
            </main>
        </div>
    );
}
