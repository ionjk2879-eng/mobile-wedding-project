import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const Money: React.FC<PreviewProps> = ({ data }) => {
  const isEn = data.language === 'en';
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const handleCopy = (account: string) => {
    navigator.clipboard.writeText(account);
    setCopiedAccount(account);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
    <section className="money section" style={{ fontFamily: data.fontFamily }}>
      <h2>{isEn ? 'REGISTRY' : '마음 전하실 곳'}</h2>
      <p className="money-desc">
        {isEn 
          ? 'Your presence is enough, but if you wish to give,\nwe appreciate your kindness.' 
          : '축하의 마음을 담아 축의금을 전달하실 수 있습니다.'}
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
              <span>{copiedAccount === acc.number ? (isEn ? 'Copied' : '복사됨') : (isEn ? 'Copy' : '복사')}</span>
            </button>
          </div>
        ))}
      </div>

      <div className="personal-messages">
        <div className="message-box groom">
          <span className="message-role">{isEn ? "Groom's Message" : "신랑의 한마디"}</span>
          <p>{data.groomMessage}</p>
        </div>
        <div className="message-box bride">
          <span className="message-role">{isEn ? "Bride's Message" : "신부의 한마디"}</span>
          <p>{data.brideMessage}</p>
        </div>
      </div>

      <style>{`
        .money-desc {
          font-size: 0.9rem;
          color: var(--wedding-text-sub);
          margin-bottom: 30px;
          white-space: pre-line;
        }
        .account-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
          margin-bottom: 50px;
        }
        .account-item {
          background: var(--wedding-card-bg);
          padding: 20px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-align: left;
          border: 1px solid var(--wedding-border);
        }
        .side-label {
          font-size: 0.75rem;
          color: var(--wedding-main);
          display: block;
          margin-bottom: 5px;
        }
        .bank-details strong {
          font-size: 1rem;
          margin-right: 10px;
          color: var(--wedding-text-main);
        }
        .bank-details span {
          font-size: 0.9rem;
          color: var(--wedding-text-body);
        }
        .owner {
          margin-left: 10px;
        }
        .copy-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 8px 12px;
          background: var(--wedding-bg);
          border: 1px solid var(--wedding-border);
          border-radius: 20px;
          font-size: 0.8rem;
          color: var(--wedding-main);
          transition: all 0.2s;
          cursor: pointer;
        }
        .copy-btn.copied {
          background: var(--wedding-card-bg);
          border-color: var(--wedding-main);
          color: var(--wedding-main);
        }
        .personal-messages {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-top: 30px;
          border-top: 1px solid var(--wedding-border);
        }
        .message-box {
          text-align: center;
          padding: 25px;
          background: var(--wedding-card-bg);
          border-radius: 20px;
          border: 1px solid var(--wedding-border);
          position: relative;
        }
        .message-role {
          font-size: 0.7rem;
          letter-spacing: 2px;
          color: var(--wedding-main);
          text-transform: uppercase;
          margin-bottom: 12px;
          display: block;
        }
        .message-box p {
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--wedding-text-body);
          font-style: italic;
        }
      `}</style>
    </section>
  );
};

export default Money;
