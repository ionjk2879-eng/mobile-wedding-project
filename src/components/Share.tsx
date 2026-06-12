import React from 'react';
import { Share2, Link } from 'lucide-react';

const Share: React.FC = () => {
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('링크가 복사되었습니다.');
  };

  const handleKakaoShare = () => {
    // In a real app, you would use Kakao SDK here
    alert('카카오톡 공유 기능은 SDK 설정이 필요합니다.');
  };

  return (
    <section className="share section">
      <div className="share-buttons">
        <button className="share-btn kakao" onClick={handleKakaoShare}>
          <Share2 size={20} />
          <span>카카오톡 공유하기</span>
        </button>
        <button className="share-btn link" onClick={handleCopyLink}>
          <Link size={20} />
          <span>링크 복사하기</span>
        </button>
      </div>

      <footer className="footer">
        <p>Copyright © 2026 지현 & 민지. All rights reserved.</p>
      </footer>

      <style>{`
        .share {
          background: #fff;
          padding-bottom: 40px;
        }
        .share-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 40px;
        }
        .share-btn {
          width: 100%;
          padding: 15px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 500;
          font-size: 0.95rem;
        }
        .kakao {
          background: #fee500;
          color: #3c1e1e;
        }
        .link {
          background: #f0f0f0;
          color: #333;
        }
        .footer {
          margin-top: 40px;
          font-size: 0.75rem;
          color: #bbb;
        }
      `}</style>
    </section>
  );
};

export default Share;
