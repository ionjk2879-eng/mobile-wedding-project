import React from 'react';
import { motion } from 'framer-motion';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="hero-content"
      >
        <p className="wedding-label">WEDDING INVITATION</p>
        <h1 className="names">지현 & 민지</h1>
        <div className="main-image-container">
          <img src="/src/assets/hero.png" alt="Wedding Hero" className="main-image" />
        </div>
        <div className="wedding-info">
          <p className="date">2026. 10. 24. SAT PM 12:30</p>
          <p className="venue">서울 웨딩 가든, 그랜드홀</p>
        </div>
      </motion.div>
      <style>{`
        .hero {
          padding: 60px 20px;
          text-align: center;
          background-color: #fff;
        }
        .wedding-label {
          font-size: 0.8rem;
          letter-spacing: 3px;
          color: #888;
          margin-bottom: 20px;
        }
        .names {
          font-size: 2.5rem;
          font-weight: 300;
          margin-bottom: 30px;
          color: #333;
        }
        .main-image-container {
          width: 100%;
          margin-bottom: 30px;
          border-radius: 200px 200px 0 0;
          overflow: hidden;
        }
        .main-image {
          width: 100%;
          display: block;
        }
        .wedding-info {
          font-size: 1.1rem;
          color: #555;
        }
        .date {
          font-weight: 500;
          margin-bottom: 5px;
        }
        .venue {
          font-size: 0.9rem;
          color: #888;
        }
      `}</style>
    </section>
  );
};

export default Hero;
