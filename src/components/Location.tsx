import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

const Location: React.FC = () => {
  const address = "서울 강남구 테헤란로 123";
  const venueName = "서울 웨딩 가든";

  const navLinks = [
    { name: '카카오내비', url: 'https://map.kakao.com/' },
    { name: '네이버 지도', url: 'https://map.naver.com/' },
    { name: 'T맵', url: 'https://www.tmap.co.kr/' },
  ];

  return (
    <section className="location section">
      <h2>오시는 길</h2>
      <div className="location-info">
        <h3 className="venue-name">{venueName}</h3>
        <p className="address">{address}</p>
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

      <div className="transport">
        <div className="transport-item">
          <strong>지하철</strong>
          <p>2호선 강남역 12번 출구 도보 5분</p>
        </div>
        <div className="transport-item">
          <strong>버스</strong>
          <p>서초03, 402, 441 강남역 사거리 하차</p>
        </div>
      </div>

      <style>{`
        .location-info {
          margin-bottom: 20px;
        }
        .venue-name {
          font-size: 1.1rem;
          margin-bottom: 5px;
        }
        .address {
          color: #888;
          font-size: 0.9rem;
        }
        .map-placeholder {
          width: 100%;
          height: 200px;
          background: #f5f5f5;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          color: #aaa;
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
          padding: 10px;
          border: 1px solid #eee;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          font-size: 0.8rem;
        }
        .transport {
          text-align: left;
          background: #f9f9f9;
          padding: 20px;
          border-radius: 8px;
        }
        .transport-item {
          margin-bottom: 15px;
        }
        .transport-item:last-child {
          margin-bottom: 0;
        }
        .transport-item strong {
          display: block;
          font-size: 0.9rem;
          margin-bottom: 5px;
          color: #333;
        }
        .transport-item p {
          font-size: 0.85rem;
          color: #666;
        }
      `}</style>
    </section>
  );
};

export default Location;
