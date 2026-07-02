import React, { useEffect, useRef, useState } from 'react';
import { Navigation, Train, Bus, Car } from 'lucide-react';
import { InvitationData } from '../../types';
import { loadKakaoMaps } from '../../utils/loadScript';

interface PreviewProps {
  data: InvitationData;
}

const Location: React.FC<PreviewProps> = React.memo(({ data }) => {
  const isEn = data.language === 'en';
  const isJa = data.language === 'ja';
  const venueName = isEn && data.en.venueName ? data.en.venueName : isJa && data.ja?.venueName ? data.ja.venueName : data.venueName;
  const venueAddress = isEn && data.en.venueAddress ? data.en.venueAddress : isJa && data.ja?.venueAddress ? data.ja.venueAddress : data.venueAddress;

  const mapRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    setCoords(null);
    if (!data.venueAddress || !mapRef.current) return;
    const container = mapRef.current;
    let cancelled = false;

    loadKakaoMaps().then(() => {
      if (cancelled || !container) return;

      const map = new window.kakao.maps.Map(container, {
        center: new window.kakao.maps.LatLng(37.5665, 126.9780),
        level: 3
      });

      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(data.venueAddress, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const lat = parseFloat(result[0].y);
          const lng = parseFloat(result[0].x);
          setCoords({ lat, lng });
          const pos = new window.kakao.maps.LatLng(lat, lng);
          new window.kakao.maps.Marker({ map, position: pos });
          map.setCenter(pos);
        }
      });
    }).catch(() => {});

    return () => { cancelled = true; };
  }, [data.venueAddress]);

  const searchQuery = encodeURIComponent(data.venueAddress || venueName || '');
  const nameQuery = encodeURIComponent(venueName || data.venueAddress || '');

  const navLinks = [
    {
      name: '카카오맵',
      color: '#FEE500',
      textColor: '#3C1E1E',
      url: coords
        ? `https://map.kakao.com/link/to/${nameQuery},${coords.lat},${coords.lng}`
        : `https://map.kakao.com/link/search/${searchQuery}`,
    },
    {
      name: '네이버 지도',
      color: '#03C75A',
      textColor: '#fff',
      url: coords
        ? `https://map.naver.com/v5/directions/-/-/${coords.lng},${coords.lat},${nameQuery}/car`
        : `https://map.naver.com/v5/search/${searchQuery}`,
    },
    {
      name: 'T맵',
      color: '#EF4036',
      textColor: '#fff',
      url: coords
        ? `https://tmap.life/route?goalname=${nameQuery}&goalx=${coords.lng}&goaly=${coords.lat}`
        : `https://tmap.life/search?query=${searchQuery}`,
    },
  ];

  return (
    <section className="location section" aria-label="오시는 길">
      <h2>LOCATION</h2>
      <p className="section-sub">{isEn ? 'Directions' : isJa ? 'アクセス' : '오시는 길'}</p>
      {(venueName || venueAddress) && (
        <div className="location-info">
          {venueName && <h3 className="venue-name">{venueName}</h3>}
          {venueAddress && <p className="address">{venueAddress}</p>}
        </div>
      )}

      {data.venueAddress && <div ref={mapRef} className="map-container"></div>}

      {data.venueAddress && <div className="nav-grid">
        {navLinks.map((nav, index) => (
          <a key={index} href={nav.url} target="_blank" rel="noreferrer" className="nav-item" style={{ background: nav.color, color: nav.textColor, borderColor: nav.color }}>
            <Navigation size={16} />
            <span>{nav.name}</span>
          </a>
        ))}
      </div>}

      <div className="transport-info">
        <div className="transport-item">
          <div className="transport-label"><Train size={18} /> {isEn ? 'Subway' : isJa ? '地下鉄' : '지하철'}</div>
          <div className="transport-detail">{data.transport.subway}</div>
        </div>
        <div className="transport-item">
          <div className="transport-label"><Bus size={18} /> {isEn ? 'Bus' : isJa ? 'バス' : '버스'}</div>
          <div className="transport-detail">{data.transport.bus}</div>
        </div>
        <div className="transport-item">
          <div className="transport-label"><Car size={18} /> {isEn ? 'Parking' : isJa ? '駐車場' : '자가용/주차'}</div>
          <div className="transport-detail">{data.transport.parking}</div>
        </div>
      </div>

    </section>
  );
}, (prev, next) =>
  prev.data.venueAddress === next.data.venueAddress
  && prev.data.venueName === next.data.venueName
  && prev.data.transport === next.data.transport
  && prev.data.language === next.data.language
  && prev.data.fontFamily === next.data.fontFamily
);

export default Location;
