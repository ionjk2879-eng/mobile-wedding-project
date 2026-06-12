import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const Money: React.FC = () => {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const accounts = [
    { side: '신랑측', bank: '국민은행', number: '123456-78-901234', owner: '김지현' },
    { side: '신부측', bank: '신한은행', number: '110-123-456789', owner: '이민지' },
  ];

  const handleCopy = (account: string) => {
    navigator.clipboard.writeText(account);
    setCopiedAccount(account);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
    <section className="money section">
      <h2>마음 전하실 곳</h2>
      <p className="money-desc">
        축하의 마음을 담아 축의금을 전달하실 수 있습니다.
      </p>

      <div className="account-list">
        {accounts.map((acc, index) => (
          <div key={index} className="account-item">
            <div className="account-info">
              <span className="side-label">{acc.side}</span>
              <div className="bank-details">
                <strong>{acc.bank}</strong>
                <span>{acc.number}</span>
                <span className="owner">{acc.owner}</span>
              </div>
            </div>
            <button 
              className={`copy-btn ${copiedAccount === acc.number ? 'copied' : ''}`}
              onClick={() => handleCopy(acc.number)}
            >
              {copiedAccount === acc.number ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedAccount === acc.number ? '복사됨' : '복사'}</span>
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .money-desc {
          font-size: 0.9rem;
          color: #888;
          margin-bottom: 30px;
        }
        .account-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .account-item {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-align: left;
        }
        .side-label {
          font-size: 0.75rem;
          color: #999;
          display: block;
          margin-bottom: 5px;
        }
        .bank-details strong {
          font-size: 1rem;
          margin-right: 10px;
        }
        .bank-details span {
          font-size: 0.9rem;
          color: #555;
        }
        .owner {
          margin-left: 10px;
        }
        .copy-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 12px;
          background: #fff;
          border: 1px solid #eee;
          border-radius: 20px;
          font-size: 0.8rem;
          color: #666;
          transition: all 0.2s;
        }
        .copy-btn.copied {
          background: #f0fff0;
          border-color: #90ee90;
          color: #2e8b57;
        }
      `}</style>
    </section>
  );
};

export default Money;
