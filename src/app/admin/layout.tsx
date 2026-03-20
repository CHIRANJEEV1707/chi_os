'use client';
import { useEffect, useState, FormEvent } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check session storage on initial load
    if (sessionStorage.getItem('chiru-admin-auth') === 'true') {
      setIsAuthed(true);
    }
  }, []);

  const handleAuth = (e: FormEvent) => {
    e.preventDefault();
    if (password === 'chiruos-admin-2025') {
      sessionStorage.setItem('chiru-admin-auth', 'true');
      setIsAuthed(true);
      setError('');
    } else {
      setError('> ERROR: Access denied');
      setPassword('');
    }
  };
  
  if (isAuthed) {
    return <>{children}</>;
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0a0f0a',
      color: '#00ff41', gap: '24px',
      fontFamily: "'Press Start 2P', monospace"
    }}>
      <h1 style={{ fontSize: '10px' }}>{'>_ ADMIN ACCESS REQUIRED'}</h1>
      
      <form onSubmit={handleAuth} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="password-input" style={{ fontFamily: "'VT323', monospace", fontSize: '16px', color: '#00ff41' }}>chiruos@admin:~$</label>
          <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#00ff41',
                  fontFamily: "'VT323', monospace",
                  fontSize: '16px',
                  outline: 'none',
                  width: '200px'
              }}
          />
      </form>

      <button
        onClick={handleAuth}
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
        [ AUTHENTICATE ]
      </button>

      {error && <p style={{ color: '#ff4141', fontSize: '14px', fontFamily: "'VT323', monospace" }}>{error}</p>}
    </div>
  );
}
