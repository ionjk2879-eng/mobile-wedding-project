import React from 'react';
import useAuthStore from '../stores/useAuthStore';
import { signInWithGoogle } from '../services/auth';
import { LogIn } from 'lucide-react';

const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  if (loading) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pretendard', sans-serif", color: '#9CA3AF' }}>
        <p>인증 확인 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Pretendard', sans-serif", gap: '20px', textAlign: 'center' }}>
        <h1 style={{ color: '#D4A5C6', letterSpacing: '3px', margin: 0, fontSize: '2rem' }}>Sonett</h1>
        <p style={{ color: '#6B7280', margin: 0 }}>소네트 모바일 청첩장</p>
        <button
          onClick={() => signInWithGoogle()}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#4285F4', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}
        >
          <LogIn size={20} /> Google로 로그인
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGate;