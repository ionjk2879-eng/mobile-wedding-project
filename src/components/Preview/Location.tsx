import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation, Train, Bus, Car } from 'lucide-react';
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
  const isEn = data.language === 'en';
  const venueName = isEn && data.en.venueName ? data.en.venueName : data.venueName;
  const venueAddress = isEn && data.en.venueAddress ? data.en.venueAddress : data.venueAddress;
  
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
    { name: isEn ? 'Kakao Navi' : '카카오내비', url: `https://map.kakao.com/link/to/${venueName},${data.venueAddress}` },
    { name: isEn ? 'Naver Map' : '네이버 지도', url: `https://map.naver.com/index.nhn?slng=&slat=&stext=&elng=&elat=&etext=${encodeURIComponent(venueName)}&menu=route` },
    { name: 'T-Map', url: `https://apis.openapi.sk.com/tmap/app/routes?appKey=YOUR_TMAP_APP_KEY&name=${encodeURIComponent(venueName)}` },
  ];

  return (
    <section className="location section">
      <h2>{isEn ? 'LOCATION' : '오시는 길'}</h2>
      <div className="location-info">
        <h3 className="venue-name">{venueName}</h3>
        <p className="address">{venueAddress}</p>
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

      <div className="transport-info">
        <div className="transport-item">
          <div className="transport-label"><Train size={18} /> {isEn ? 'Subway' : '지하철'}</div>
          <div className="transport-detail">{data.transport.subway}</div>
        </div>
        <div className="transport-item">
          <div className="transport-label"><Bus size={18} /> {isEn ? 'Bus' : '버스'}</div>
          <div className="transport-detail">{data.transport.bus}</div>
        </div>
        <div className="transport-item">
          <div className="transport-label"><Car size={18} /> {isEn ? 'Parking' : '자가용/주차'}</div>
          <div className="transport-detail">{data.transport.parking}</div>
        </div>
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
          font-size: 1.15em;
          color: var(--wedding-text-main);
          font-weight: 600;
          margin-bottom: 6px;
        }
        .address {
          color: var(--wedding-text-body);
          font-size: 0.9em;
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
          font-size: 0.8em;
          transition: all 0.2s ease;
        }
        .nav-item:hover {
          background: var(--wedding-border);
        }
        .transport-info {
          text-align: left;
          background: var(--wedding-card-bg);
          padding: 24px;
          border-radius: 20px;
          border: 1px solid var(--wedding-border);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .transport-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .transport-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85em;
          font-weight: 700;
          color: var(--wedding-main);
        }
        .transport-detail {
          font-size: 0.9em;
          color: var(--wedding-text-body);
          line-height: 1.5;
          padding-left: 26px;
        }
      `}</style>
    </section>
  );
};

export default Location;
