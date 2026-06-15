import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const Location: React.FC<PreviewProps> = ({ data }) => {
  const navLinks = [
    { name: '카카오내비', url: 'https://map.kakao.com/' },
    { name: '네이버 지도', url: 'https://map.naver.com/' },
    { name: 'T맵', url: 'https://www.tmap.co.kr/' },
  ];

  return (
    <section className="location section">
      <h2>오시는 길</h2>
      <div className="location-info">
        <h3 className="venue-name">{data.venueName}</h3>
        <p className="address">{data.venueAddress}</p>
      </div>

      <div className="map-placeholder">
        <MapPin size={40} color="#ddd" />
        <p>지도 영역 (API 연결 필요)</p>
      </div>

      <div className="nav-grid">
        {navLinks.map((nav, index) => (
          <a key={index} href={nav.url} target="_blank" rel="noreferrer" className="nav-item">
            <Navigation size={18} />
            <span>{nav.name}</span>
          </a>
        ))}
      </div>

      <style>{`
        .location-info {
          margin-bottom: 20px;
          background: var(--wedding-card-bg);
          border-left: 3px solid var(--wedding-main);
          border-radius: 0 16px 16px 0;
          padding: 18px 20px;
          text-align: left;
          border-top: 1px solid var(--wedding-border);
          border-right: 1px solid var(--wedding-border);
          border-bottom: 1px solid var(--wedding-border);
        }
        .venue-name {
          font-size: 1.15rem;
          color: var(--wedding-text-main);
          font-weight: 600;
          margin-bottom: 6px;
        }
        .address {
          color: var(--wedding-text-body);
          font-size: 0.9rem;
          margin: 0;
        }
        .map-placeholder {
          width: 100%;
          height: 200px;
          background: var(--wedding-card-bg);
          border: 1px dashed var(--wedding-border);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          color: var(--wedding-text-sub);
          font-size: 0.8rem;
          gap: 10px;
        }
        .nav-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 30px;
        }
        .nav-item {
          padding: 12px 10px;
          border: 1px solid var(--wedding-border);
          background: var(--wedding-card-bg);
          color: var(--wedding-text-body);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          font-size: 0.8rem;
          transition: all 0.2s ease;
        }
        .nav-item:hover {
          background: var(--wedding-border);
        }
      `}</style>
    </section>
  );
};

export default Location;
