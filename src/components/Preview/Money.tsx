import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const Money: React.FC<PreviewProps> = ({ data }) => {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const handleCopy = (account: string) => {
    navigator.clipboard.writeText(account);
    setCopiedAccount(account);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
    <section className="money section" style={{ fontFamily: data.fontFamily }}>
      <h2>마음 전하실 곳</h2>
      <p className="money-desc">
        축하의 마음을 담아 축의금을 전달하실 수 있습니다.
      </p>

      <div className="account-list">
        {data.accounts.map((acc, index) => (
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

      <div className="personal-messages">
        <div className="message-box groom">
          <span className="message-role">Groom's Message</span>
          <p>{data.groomMessage}</p>
        </div>
        <div className="message-box bride">
          <span className="message-role">Bride's Message</span>
          <p>{data.brideMessage}</p>
        </div>
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
          margin-bottom: 50px;
        }
        .account-item {
          background: #fdfbf9;
          padding: 20px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-align: left;
          border: 1px solid #f0eae5;
        }
        .side-label {
          font-size: 0.75rem;
          color: #b89c8e;
          display: block;
          margin-bottom: 5px;
        }
        .bank-details strong {
          font-size: 1rem;
          margin-right: 10px;
          color: #4a4543;
        }
        .bank-details span {
          font-size: 0.9rem;
          color: #8c8581;
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
          border: 1px solid #f0eae5;
          border-radius: 20px;
          font-size: 0.8rem;
          color: #b89c8e;
          transition: all 0.2s;
        }
        .copy-btn.copied {
          background: #fdfbf9;
          border-color: #b89c8e;
          color: #b89c8e;
        }
        .personal-messages {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-top: 30px;
          border-top: 1px solid #f0eae5;
        }
        .message-box {
          text-align: center;
          padding: 25px;
          background: #fff;
          border-radius: 20px;
          border: 1px solid #f0eae5;
          position: relative;
        }
        .message-role {
          font-size: 0.7rem;
          letter-spacing: 2px;
          color: #b89c8e;
          text-transform: uppercase;
          margin-bottom: 12px;
          display: block;
        }
        .message-box p {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #4a4543;
          font-style: italic;
        }
      `}</style>
    </section>
  );
};

export default Money;
