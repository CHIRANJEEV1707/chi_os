'use client';
import { useState, useEffect } from 'react';
import { getBlogPosts } from '@/lib/firestore';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { useSoundEffect } from '@/hooks/useSoundEffect';

const LoadingState = () => (
    <div className="p-4 font-body h-full flex items-center justify-center">
        <p className="text-primary text-lg animate-pulse">&gt; LOADING BLOG.log...</p>
    </div>
);

const EmptyState = () => (
    <div className="p-4 font-body h-full flex flex-col items-center justify-center">
        <p className="text-primary/70 text-lg">&gt; NO ENTRIES FOUND.</p>
        <p className="text-primary/70 text-lg">&gt; CHECK BACK SOON.</p>
    </div>
);

const PostListView = ({ posts, onSelectPost }: { posts: any[], onSelectPost: (post: any) => void }) => {
    const { play } = useSoundEffect();
    return (
        <div className="p-4 font-body h-full overflow-y-auto">
            <header className="mb-4">
                <p className="font-headline text-[7px] text-muted-foreground">&gt; CAT blog.log</p>
                <p className="font-body text-base text-primary/80">&gt; {posts.length} ENTRIES FOUND</p>
            </header>
            <div className="flex flex-col gap-2">
                {posts.map(post => (
                    <button 
                        key={post.id}
                        onClick={() => { play('click'); onSelectPost(post); }}
                        className="text-left p-2 hover:bg-accent/10 w-full"
                    >
                        <p className="font-headline text-[8px] text-primary">
                            <span className="text-primary/60">{format(post.createdAt.toDate(), 'yyyy-MM-dd')}</span>
                            <span className="mx-2 text-primary/40">|</span>
                            {(post.tags || []).map((tag: string) => (
                                <span key={tag} className="mr-2 text-green-400">#{tag.toUpperCase()}</span>
                            ))}
                        </p>
                        <p className="font-headline text-[10px] text-primary mt-1">&gt; {post.title}</p>
                    </button>
                ))}
            </div>
        </div>
    );
};

const PostDetailView = ({ post, onBack }: { post: any, onBack: () => void }) => {
    const { play } = useSoundEffect();
    return (
        <div className="p-4 font-body h-full flex flex-col overflow-hidden">
            <header className="flex-shrink-0">
                <button onClick={() => { play('click'); onBack(); }} className="font-headline text-[8px] text-primary/70 hover:text-primary mb-4">&lt; BACK TO LOG</button>
                <h1 className="font-headline text-[10px] text-primary">{post.title}</h1>
                <div className="flex items-center gap-4 font-body text-sm text-primary/60 my-2">
                    <span>{format(post.createdAt.toDate(), 'MMMM dd, yyyy')}</span>
                    <span>{post.readTime || 5} min read</span>
                    <div className="flex gap-2">
                        {(post.tags || []).map((tag: string) => <span key={tag} className="text-green-400">#{tag}</span>)}
                    </div>
                </div>
                <div className="w-full h-px bg-primary/30 my-4"></div>
            </header>
            <article className="flex-grow overflow-y-auto prose-invert prose-headings:font-headline prose-p:font-body prose-p:text-lg prose-a:text-cyan-400 prose-blockquote:border-l-amber-400 prose-blockquote:text-amber-400 prose-code:bg-[#001a00] prose-code:p-1 prose-code:border prose-code:border-[#003300] prose-code:rounded-sm">
                <ReactMarkdown
                    components={{
                        h1: ({node, ...props}) => <h1 className="text-lg" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm" {...props} />,
                        pre: ({node, ...props}) => <pre className="bg-[#000a00] border border-[#003300] p-3 overflow-x-auto" {...props} />,
                        li: ({node, ...props}) => <li className="pl-2 before:content-['>_'] before:mr-2 before:text-primary/50" {...props} />,
                    }}
                >
                    {post.content}
                </ReactMarkdown>
            </article>
        </div>
    );
}

export default function Blog() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<any | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const fetchedPosts = await getBlogPosts();
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Failed to fetch blog posts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    if (loading) return <LoadingState />;

    if (selectedPost) {
        return <PostDetailView post={selectedPost} onBack={() => setSelectedPost(null)} />;
    }

    if (posts.length === 0) return <EmptyState />;

    return <PostListView posts={posts} onSelectPost={setSelectedPost} />;
}
