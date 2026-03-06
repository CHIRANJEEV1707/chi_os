'use client';
import { useEffect, useState } from 'react';
import { 
  onAuthStateChanged,
  getRedirectResult,
  signInWithRedirect,
  signOut,
  GoogleAuthProvider,
  User
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

const provider = new GoogleAuthProvider();

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // STEP 1: Handle redirect result first
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log('=== YOUR UID ===', result.user.uid);
          console.log('=== YOUR EMAIL ===', result.user.email);
          // Copy the UID from browser console
        }
      })
      .catch((error) => {
        console.error('Redirect error:', error.code, error.message);
      });

    // STEP 2: Listen for auth state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state:', currentUser?.uid || 'not logged in');
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = () => {
    signInWithRedirect(auth, provider);
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  // Show loading
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', 
        justifyContent: 'center', height: '100vh',
        background: '#0a0f0a', color: '#00ff41',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '10px'
      }}>
        {'> AUTHENTICATING...'}
      </div>
    );
  }

  // Show UID debug info if logged in but no admin UID set
  const adminUid = process.env.NEXT_PUBLIC_ADMIN_UID;
  
  if (user && !adminUid) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', 
        height: '100vh', background: '#0a0f0a', 
        color: '#00ff41', gap: '16px',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '8px', textAlign: 'center',
        padding: '32px'
      }}>
        <div>{'> SIGN IN SUCCESSFUL!'}</div>
        <div style={{ color: '#ffb300' }}>
          {'> YOUR UID:'}
        </div>
        <div style={{ 
          background: '#001a00', 
          border: '2px solid #ffb300',
          padding: '12px 24px',
          color: '#ffb300',
          fontSize: '10px',
          wordBreak: 'break-all'
        }}>
          {user.uid}
        </div>
        <div style={{ color: '#00b32c', fontSize: '7px' }}>
          {'> Copy this UID and add to .env:'}
        </div>
        <div style={{ 
          background: '#001a00',
          border: '1px solid #003300',
          padding: '8px 16px',
          color: '#00b32c',
          fontSize: '7px'
        }}>
          {`NEXT_PUBLIC_ADMIN_UID=${user.uid}`}
        </div>
        <button 
          onClick={handleSignOut}
          style={{
            marginTop: '16px',
            background: 'transparent',
            border: '2px solid #ff4141',
            color: '#ff4141',
            padding: '8px 16px',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '7px',
            cursor: 'pointer'
          }}
        >
          SIGN OUT
        </button>
      </div>
    );
  }

  // Not logged in — show login screen
  if (!user) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0a0f0a',
        color: '#00ff41', gap: '24px',
        fontFamily: "'Press Start 2P', monospace"
      }}>
        <div style={{ fontSize: '10px' }}>
          {'> ADMIN ACCESS REQUIRED'}
        </div>
        <div style={{ 
          fontSize: '7px', color: '#00b32c' 
        }}>
          {'> AUTHENTICATE TO CONTINUE'}
        </div>
        <button
          onClick={handleSignIn}
          style={{
            background: 'transparent',
            border: '2px solid #00ff41',
            color: '#00ff41',
            padding: '12px 24px',
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '8px',
            cursor: 'pointer'
          }}
        >
          {'[ 🔐 SIGN IN WITH GOOGLE ]'}
        </button>
      </div>
    );
  }

  // Logged in but wrong UID
  if (user.uid !== adminUid) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#0a0f0a',
        color: '#ff4141', gap: '16px',
        fontFamily: "'Press Start 2P', monospace",
        fontSize: '8px'
      }}>
        <div>{'> ACCESS DENIED'}</div>
        <div style={{ fontSize: '7px', color: '#00b32c' }}>
          {'> This is a private admin area'}
        </div>
        <button onClick={handleSignOut} style={{
          background: 'transparent',
          border: '2px solid #ff4141',
          color: '#ff4141', padding: '8px 16px',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '7px',
          cursor: 'pointer'
        }}>
          SIGN OUT
        </button>
      </div>
    );
  }

  // Authorized admin — show dashboard
  return <>{children}</>;
}
