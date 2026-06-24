import React from 'react';
import { InvitationData, Contact } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const Greeting: React.FC<PreviewProps> = React.memo(({ data }) => {
  const isEn = data.language === 'en';
  const content = isEn && data.en.greetingContent ? data.en.greetingContent : data.greetingContent;

  const groomFather = data.parents.groomParents.find(p => p.role === '아버지');
  const groomMother = data.parents.groomParents.find(p => p.role === '어머니');
  const brideFather = data.parents.brideParents.find(p => p.role === '아버지');
  const brideMother = data.parents.brideParents.find(p => p.role === '어머니');

  const formatParent = (parent: Contact | undefined) => {
    if (!parent || !parent.name) return null;
    if (!parent.isDeceased) return <>{parent.name}</>;
    const style = parent.deceasedStyle || 'text';
    if (style === 'chrysanthemum') return <><span className="deceased-icon" title="고인">🏵️</span> {parent.name}</>;
    if (style === 'ribbon') return <><span className="deceased-icon" title="고인">🎀</span> {parent.name}</>;
    return <>故 {parent.name}</>;
  };

  return (
    <section className="greeting section" style={{ fontFamily: data.fontFamily }} aria-label="인사말">
      <div className="greeting-text">
        <h2>INVITATION</h2>
        <p className="section-sub">소중한 분들을 초대합니다</p>
        <p style={{ whiteSpace: 'pre-wrap' }}>
          {content}
        </p>
      </div>

      <div className="family-info">
        <div className="family-block">
          <span className="parent-names">
            {formatParent(groomFather)}{groomFather?.name && groomMother?.name ? <> · </> : null}{formatParent(groomMother)}
            <span className="child-label">{isEn ? 'Son' : '의 아들'}</span>
          </span>
          <span className="child-name">{data.groomName || '신랑'}</span>
        </div>
        <div className="family-block">
          <span className="parent-names">
            {formatParent(brideFather)}{brideFather?.name && brideMother?.name ? <> · </> : null}{formatParent(brideMother)}
            <span className="child-label">{isEn ? 'Daughter' : '의 딸'}</span>
          </span>
          <span className="child-name">{data.brideName || '신부'}</span>
        </div>
      </div>

      <style>{`
        .greeting-text p {
          line-height: 2;
          color: var(--wedding-text-body);
          font-size: 0.95em;
          margin-bottom: 0;
        }
        .family-info {
          margin-top: 50px;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        .family-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }
        .parent-names {
          font-size: 0.95em;
          color: var(--wedding-text-sub);
          letter-spacing: 1px;
        }
        .deceased-icon {
          font-size: 0.85em;
          vertical-align: middle;
        }
        .child-label {
          font-size: 0.85em;
          color: var(--wedding-text-sub);
          margin-left: 4px;
        }
        .child-name {
          font-size: 1.4em;
          font-weight: 600;
          color: var(--wedding-text-main);
          letter-spacing: 3px;
        }
      `}</style>
    </section>
  );
}, (prev, next) => {
  return prev.data.greetingTitle === next.data.greetingTitle
    && prev.data.greetingContent === next.data.greetingContent
    && prev.data.language === next.data.language
    && prev.data.groomName === next.data.groomName
    && prev.data.brideName === next.data.brideName
    && prev.data.fontFamily === next.data.fontFamily
    && prev.data.parents === next.data.parents;
});

export default Greeting;
