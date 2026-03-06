'use client';

import { useState, useEffect, useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { useForm } from 'react-hook-form';
import ReactMarkdown from 'react-markdown';
import {
  getBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from '@/lib/firestore';
import { format } from 'date-fns';

type AdminSection = 'blog' | 'projects' | 'experience' | 'guestbook' | 'settings';

// --- Blog Manager ---

const BlogManager = () => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPost, setEditingPost] = useState<any | null>(null);

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        const allPosts = await getBlogPosts(false); // fetch drafts too
        setPosts(allPosts);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleEdit = (post: any) => {
        setEditingPost(post);
    };

    const handleCreateNew = () => {
        setEditingPost({}); // Empty object signifies a new post
    };

    const handleSave = async (data: any) => {
        if (editingPost?.id) {
            await updateBlogPost(editingPost.id, data);
        } else {
            await createBlogPost(data);
        }
        setEditingPost(null);
        fetchPosts();
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            await deleteBlogPost(id);
            fetchPosts();
        }
    };
    
    const handlePublishToggle = async (post: any) => {
        await updateBlogPost(post.id, { published: !post.published });
        fetchPosts();
    };


    if (editingPost) {
        return <BlogPostForm post={editingPost} onSave={handleSave} onCancel={() => setEditingPost(null)} />;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="font-headline text-lg">Blog Posts</h2>
                <button onClick={handleCreateNew} className="font-headline text-[7px] px-3 py-1 border-2 border-primary/50 text-primary hover:bg-accent hover:text-accent-foreground">
                    + NEW POST
                </button>
            </div>
            {loading ? <p>Loading posts...</p> : (
                <div className="flex flex-col gap-2">
                    {posts.map(post => (
                        <div key={post.id} className="p-2 border border-primary/20 flex justify-between items-center">
                            <div>
                                <p className="font-headline text-sm">{post.title}</p>
                                <p className="text-xs text-primary/60">{format(post.createdAt.toDate(), 'yyyy-MM-dd')}
                                <span className={cn('ml-4 font-bold', post.published ? 'text-green-400' : 'text-amber-400')}>{post.published ? 'PUBLISHED' : 'DRAFT'}</span></p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handlePublishToggle(post)} className="font-headline text-[7px] p-1 border border-primary/50 hover:bg-green-500/20">{post.published ? 'UNPUBLISH' : 'PUBLISH'}</button>
                                <button onClick={() => handleEdit(post)} className="font-headline text-[7px] p-1 border border-primary/50 hover:bg-accent/20">EDIT</button>
                                <button onClick={() => handleDelete(post.id)} className="font-headline text-[7px] p-1 border border-destructive/50 text-destructive hover:bg-destructive/20">DELETE</button>
                            </div>
                        </div>
                    ))}
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
    }});
    const content = watch('content');
    const [showPreview, setShowPreview] = useState(false);

    const onSubmit = (data: any) => {
        const tags = data.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
        onSave({ ...data, tags });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
             <h2 className="font-headline text-lg">{post.id ? 'Edit Post' : 'Create Post'}</h2>
             <div>
                <label className="font-headline text-[8px]">TITLE</label>
                <input {...register('title')} className="w-full bg-input border border-primary/50 p-2 text-primary outline-none" />
             </div>
             <div>
                <label className="font-headline text-[8px]">TAGS (comma-separated)</label>
                <input {...register('tags')} className="w-full bg-input border border-primary/50 p-2 text-primary outline-none" />
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

// --- Other Managers (Placeholders) ---
const ProjectsManager = () => <div className="font-headline text-lg">Projects Manager (WIP)</div>;
const ExperienceManager = () => <div className="font-headline text-lg">Experience Manager (WIP)</div>;
const GuestbookManager = () => <div className="font-headline text-lg">Guestbook Moderator (WIP)</div>;
const SettingsManager = () => <div className="font-headline text-lg">Settings (WIP)</div>;


// --- Main Admin Component ---

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
            case 'guestbook': return <GuestbookManager />;
            case 'settings': return <SettingsManager />;
            default: return <BlogManager />;
        }
    };

    const menuItems = [
        { id: 'blog', label: 'BLOG POSTS', icon: '📝' },
        { id: 'projects', label: 'PROJECTS', icon: '🗂️' },
        { id: 'experience', label: 'EXPERIENCE', icon: '💼' },
        { id: 'guestbook', label: 'GUESTBOOK', icon: '📖' },
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
