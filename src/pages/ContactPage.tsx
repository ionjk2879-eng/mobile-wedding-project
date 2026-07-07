import React from 'react';
import SiteHeader from '../components/SiteHeader';

const ContactPage: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Pretendard', sans-serif" }}>
      <SiteHeader />
      <section style={{ textAlign: 'center', padding: '120px 24px' }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '5px', color: '#B07A8E', margin: '0 0 12px', fontWeight: 600 }}>CONTACT</p>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1F2937', margin: '0 0 16px' }}>문의/건의</h1>
        <p style={{ fontSize: '1rem', color: '#9CA3AF' }}>준비 중입니다.</p>
      </section>
    </div>
  );
};

export default ContactPage;
