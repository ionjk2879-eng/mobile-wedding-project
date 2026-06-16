import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { InvitationData } from '../../types';

declare global {
  interface Window {
    kakao: any;
  }
}

interface PreviewProps {
  data: InvitationData;
}

const Location: React.FC<PreviewProps> = ({ data }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.kakao || !window.kakao.maps) return;

    const container = mapRef.current;
    if (!container) return;

    const options = {
      center: new window.kakao.maps.LatLng(33.450701, 126.570667),
      level: 3
    };

    const map = new window.kakao.maps.Map(container, options);
    const geocoder = new window.kakao.maps.services.Geocoder();

    geocoder.addressSearch(data.venueAddress, (result: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);

        const marker = new window.kakao.maps.Marker({
          map: map,
          position: coords
        });

        map.setCenter(coords);
      }
    });
  }, [data.venueAddress]);

  const navLinks = [
    { name: '카카오내비', url: `https://map.kakao.com/link/to/${data.venueName},${data.venueAddress}` },
    { name: '네이버 지도', url: `https://map.naver.com/index.nhn?slng=&slat=&stext=&elng=&elat=&etext=${encodeURIComponent(data.venueName)}&menu=route` },
    { name: 'T맵', url: `https://apis.openapi.sk.com/tmap/app/routes?appKey=YOUR_TMAP_APP_KEY&name=${encodeURIComponent(data.venueName)}` },
  ];

  return (
    <section className="location section">
      <h2>오시는 길</h2>
      <div className="location-info">
        <h3 className="venue-name">{data.venueName}</h3>
        <p className="address">{data.venueAddress}</p>
      </div>

      <div ref={mapRef} className="map-container"></div>

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
        .map-container {
          width: 100%;
          height: 300px;
          background: #eee;
          border: 1px solid var(--wedding-border);
          border-radius: 16px;
          margin-bottom: 20px;
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
