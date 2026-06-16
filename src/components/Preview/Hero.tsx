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
        key={`${data.groomName}-${data.brideName}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="hero-content"
      >
        <div className="d-day-badge">{calculateDDay()}</div>
        <p className="wedding-label">WEDDING INVITATION</p>
        <h1 className="names">{groomName} & {brideName}</h1>
        <div className="main-image-container">
          <img src={data.photos[0] || "/src/assets/hero.png"} alt="Wedding Hero" className="main-image" />
        </div>
        <div className="wedding-info">
          <p className="date">{data.date} {data.time}</p>
          <p className="venue">{venueName}</p>
        </div>
      </motion.div>
      <style>{`
        .hero {
          padding: 60px 20px;
          text-align: center;
          background-color: var(--wedding-bg);
          transition: background-color 0.4s ease;
          position: relative;
        }
        .d-day-badge {
          display: inline-block;
          padding: 6px 16px;
          background: var(--wedding-main);
          color: white;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 20px;
          letter-spacing: 1px;
        }
        .wedding-label {
          font-size: 0.8rem;
          letter-spacing: 3px;
          color: var(--wedding-text-sub);
          margin-bottom: 15px;
        }
        .names {
          font-size: 3.8rem;
          font-weight: 300;
          margin-bottom: 30px;
          color: var(--wedding-text-main);
          letter-spacing: 0.1em;
          line-height: 1.2;
          word-break: keep-all;
        }
        .main-image-container {
          width: 100%;
          margin-bottom: 30px;
          border-radius: 200px 200px 0 0;
          overflow: hidden;
          background: var(--wedding-card-bg);
          border: 1px solid var(--wedding-border);
        }
        .main-image {
          width: 100%;
          display: block;
        }
        .wedding-info {
          font-size: 1.1rem;
          color: var(--wedding-text-body);
        }
        .date {
          font-weight: 500;
          margin-bottom: 5px;
        }
        .venue {
          font-size: 0.9rem;
          color: var(--wedding-text-sub);
        }
      `}</style>
    </section>
  );
};

export default Hero;
