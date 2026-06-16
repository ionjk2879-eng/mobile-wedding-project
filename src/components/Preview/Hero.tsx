import React from 'react';
import { motion } from 'framer-motion';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const Hero: React.FC<PreviewProps> = ({ data }) => {
  const isEn = data.language === 'en';
  const groomName = isEn && data.en.groomName ? data.en.groomName : data.groomName;
  const brideName = isEn && data.en.brideName ? data.en.brideName : data.brideName;
  const venueName = isEn && data.en.venueName ? data.en.venueName : data.venueName;
  const dateStr = isEn && data.en.date ? data.en.date : data.date;
  const timeStr = isEn && data.en.time ? data.en.time : data.time;

  const calculateDDay = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weddingDate = new Date(data.weddingDateISO);
    weddingDate.setHours(0, 0, 0, 0);
    
    const diffTime = weddingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'D-Day';
    if (diffDays < 0) return `D+${Math.abs(diffDays)}`;
    return `D-${diffDays}`;
  };

  return (
    <section className="hero" style={{ fontFamily: data.fontFamily }}>
      <motion.div 
        key={`${groomName}-${brideName}-${data.language}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="hero-content"
      >
        <div className="main-image-container">
          <img src={data.heroPhoto} alt="Wedding Hero" className="main-image" />
        </div>

        <div className="hero-footer">
          <div className="d-day-badge">{calculateDDay()}</div>
          <p className="wedding-label">{isEn ? 'WEDDING INVITATION' : '결혼식에 초대합니다'}</p>
          <h1 className="names">
            <span className="name">{groomName}</span>
            <span className="ampersand">&</span>
            <span className="name">{brideName}</span>
          </h1>
          <div className="wedding-info">
            <p className="date">{dateStr}</p>
            <p className="time">{timeStr}</p>
            <p className="venue">{venueName}</p>
          </div>
        </div>
      </motion.div>
      <style>{`
        .hero {
          padding: 40px 0 60px;
          text-align: center;
          background-color: var(--wedding-bg);
          transition: background-color 0.4s ease;
          position: relative;
        }
        .hero-content {
          padding: 0 20px;
        }
        .d-day-badge {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(212, 165, 198, 0.1);
          color: var(--wedding-accent);
          border: 1px solid var(--wedding-accent);
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 15px;
          letter-spacing: 1px;
        }
        .wedding-label {
          font-size: 0.7rem;
          letter-spacing: 3px;
          color: var(--wedding-text-sub);
          margin-bottom: 25px;
          opacity: 0.8;
        }
        .main-image-container {
          width: 100%;
          margin-bottom: 35px;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          line-height: 0;
        }
        .main-image {
          width: 100%;
          height: auto;
          display: block;
        }
        .hero-footer {
          padding: 0 10px;
        }
        .names {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          font-size: 1.8rem;
          font-weight: 400;
          margin: 0 0 20px;
          color: var(--wedding-text-main);
          letter-spacing: 0.05em;
        }
        .ampersand {
          font-size: 1.2rem;
          color: var(--wedding-accent);
          opacity: 0.6;
          font-family: serif;
          font-style: italic;
        }
        .name {
          word-break: keep-all;
        }
        .wedding-info {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .date {
          font-size: 1rem;
          font-weight: 500;
          color: var(--wedding-text-main);
          margin: 0;
          letter-spacing: 1px;
        }
        .time {
          font-size: 0.9rem;
          color: var(--wedding-text-sub);
          margin: 0;
        }
        .venue {
          font-size: 0.9rem;
          color: var(--wedding-text-sub);
          margin-top: 5px;
          position: relative;
          padding-top: 10px;
        }
        .venue::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 20px;
          height: 1px;
          background: var(--wedding-border);
        }
      `}</style>
    </section>
  );
};

export default Hero;
