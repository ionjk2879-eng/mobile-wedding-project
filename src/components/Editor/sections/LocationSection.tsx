import React from 'react';
import { Search } from 'lucide-react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { loadDaumPostcode, loadKakaoMaps } from '../../../utils/loadScript';

const LocationSection: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const updateField = useInvitationStore((s) => s.updateField);
  const updateTransport = useInvitationStore((s) => s.updateTransport);
  const setData = useInvitationStore((s) => s.setData);

  const handleAddressSearch = async () => {
    await loadDaumPostcode();
    await loadKakaoMaps().catch(() => {});
    new window.daum.Postcode({
      oncomplete: (searchData: DaumPostcodeData) => {
        let fullAddress = searchData.address;
        let extraAddress = '';
        if (searchData.addressType === 'R') {
          if (searchData.bname !== '') extraAddress += searchData.bname;
          if (searchData.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${searchData.buildingName}` : searchData.buildingName);
          fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }
        const venueNameFinal = searchData.buildingName || data.venueName;
        const bname = searchData.bname || '';
        const sigungu = searchData.sigungu || '';

        const updatedData = {
          ...data,
          venueAddress: fullAddress,
          venueName: venueNameFinal,
          transport: { subway: `${sigungu} ${bname} 인근 지하철역 이용`, bus: `${bname || sigungu} 정류장 하차`, parking: `${venueNameFinal || '건물'} 내 지하 주차장 이용 가능` }
        };
        setData(updatedData);

        if (window.kakao?.maps?.services) {
          const geocoder = new window.kakao.maps.services.Geocoder();
          geocoder.addressSearch(fullAddress, (result, status) => {
            if (status !== window.kakao.maps.services.Status.OK || !result[0]) return;
            const lat = parseFloat(result[0].y);
            const lng = parseFloat(result[0].x);
            const location = new window.kakao.maps.LatLng(lat, lng);
            let subwayText = '', busText = '', parkingText = '';
            let completed = 0;
            const calcDist = (r: kakao.maps.services.PlaceResult) => Math.round(Math.sqrt(Math.pow((parseFloat(r.y) - lat) * 111000, 2) + Math.pow((parseFloat(r.x) - lng) * 88000, 2)));
            const places = new window.kakao.maps.services.Places();
            const tryUpdate = () => {
              completed++;
              if (completed < 3) return;
              setData({ ...updatedData, transport: { subway: subwayText || updatedData.transport.subway, bus: busText || updatedData.transport.bus, parking: parkingText || updatedData.transport.parking } });
            };
            places.keywordSearch('지하철역', (results, s) => {
              if (s === window.kakao.maps.services.Status.OK && results.length > 0)
                subwayText = results.slice(0, 2).map((r) => { const dist = calcDist(r); return `${r.place_name.replace(' ', '')} 도보 약 ${Math.ceil(dist / 80)}분 (${dist}m)`; }).join('\n');
              tryUpdate();
            }, { location, radius: 2000, sort: window.kakao.maps.services.SortBy.DISTANCE });
            places.keywordSearch('버스 정류장', (results, s) => {
              if (s === window.kakao.maps.services.Status.OK && results.length > 0)
                busText = results.slice(0, 2).map((r) => { const dist = calcDist(r); return `${r.place_name} 도보 약 ${Math.ceil(dist / 80)}분 (${dist}m)`; }).join('\n');
              tryUpdate();
            }, { location, radius: 2000, sort: window.kakao.maps.services.SortBy.DISTANCE });
            parkingText = `${venueNameFinal || '예식장'} 주차장 이용 가능 (직접 확인 권장)`;
            tryUpdate();
          });
        }
      }
    }).open();
  };

  return (
    <>
      <div className="opt-inline-group">
        <label className="opt-inline-label">예식장 주소</label>
        <div className="opt-inline-content">
          <div className="modern-search-box">
            <input type="text" value={data.venueAddress} readOnly className="modern-input" />
            <button onClick={handleAddressSearch} className="search-btn"><Search size={16} /> 주소 검색</button>
          </div>
        </div>
      </div>
      <div className="opt-inline-group">
        <label className="opt-inline-label">예식장 이름</label>
        <div className="opt-inline-content">
          <input type="text" value={data.venueName} onChange={(e) => updateField('venueName', e.target.value)} className="modern-input" />
        </div>
      </div>
      <div className="opt-inline-group">
        <label className="opt-inline-label">지하철</label>
        <div className="opt-inline-content">
          <textarea value={data.transport.subway} onChange={(e) => updateTransport('subway', e.target.value)} rows={2} className="modern-input" />
        </div>
      </div>
      <div className="opt-inline-group">
        <label className="opt-inline-label">버스</label>
        <div className="opt-inline-content">
          <textarea value={data.transport.bus} onChange={(e) => updateTransport('bus', e.target.value)} rows={2} className="modern-input" />
        </div>
      </div>
      <div className="opt-inline-group">
        <label className="opt-inline-label">주차</label>
        <div className="opt-inline-content">
          <textarea value={data.transport.parking} onChange={(e) => updateTransport('parking', e.target.value)} rows={2} className="modern-input" />
        </div>
      </div>
      <div className="opt-inline-group">
        <label className="opt-inline-label">장소 표시 스타일</label>
        <div className="account-style-grid">
          <button type="button" className={`account-style-btn ${(data.locationStyle || 'card') === 'card' ? 'active' : ''}`} onClick={() => updateField('locationStyle', 'card')}>
            <strong>카드형</strong>
          </button>
          <button type="button" className={`account-style-btn ${data.locationStyle === 'plain' ? 'active' : ''}`} onClick={() => updateField('locationStyle', 'plain')}>
            <strong>배경 일체형</strong>
          </button>
        </div>
      </div>
    </>
  );
};

export default LocationSection;