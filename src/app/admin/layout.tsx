'use client';

import { useAuth } from '@/lib/auth';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useSoundEffect } from '@/hooks/useSoundEffect';

const LoginScreen = () => {
    const { play } = useSoundEffect();
    const handleLogin = async () => {
        play('click');
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Auth error", error);
        }
    };

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-desktop-bg text-primary font-body">
            <h1 className="font-headline text-lg">&gt; ADMIN ACCESS REQUIRED</h1>
            <p className="text-base mt-2">&gt; AUTHENTICATE TO CONTINUE</p>
            <button onClick={handleLogin} className="font-headline text-[8px] mt-6 p-3 border-2 border-primary bg-black/30 text-primary hover:bg-accent hover:text-accent-foreground">
                [ 🔐 SIGN IN WITH GOOGLE ]
            </button>
        </div>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="w-full h-screen flex items-center justify-center bg-desktop-bg text-primary font-headline animate-pulse">LOADING...</div>;
    }

    if (!user) {
        return <LoginScreen />;
    }
    
    if (user.uid !== process.env.NEXT_PUBLIC_ADMIN_UID) {
        return <div className="w-full h-screen flex flex-col items-center justify-center bg-desktop-bg text-destructive font-headline text-2xl">
            <p>ACCESS DENIED</p>
            <p className="text-sm mt-4 text-primary/50">UID: {user.uid}</p>
        </div>;
    }

    return <>{children}</>;
}
