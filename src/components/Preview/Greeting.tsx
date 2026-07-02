import React from 'react';
import { InvitationData, Contact } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const Greeting: React.FC<PreviewProps> = React.memo(({ data }) => {
  const isEn = data.language === 'en';
  const isJa = data.language === 'ja';
  const content = isEn && data.en.greetingContent ? data.en.greetingContent : isJa && data.ja?.greetingContent ? data.ja.greetingContent : data.greetingContent;

  const groomFather = data.parents.groomParents.find(p => p.role === '아버지');
  const groomMother = data.parents.groomParents.find(p => p.role === '어머니');
  const brideFather = data.parents.brideParents.find(p => p.role === '아버지');
  const brideMother = data.parents.brideParents.find(p => p.role === '어머니');

  const formatParent = (parent: Contact | undefined) => {
    if (!parent || !parent.name) return null;
    if (!parent.isDeceased) return <>{parent.name}</>;
    const style = parent.deceasedStyle || 'text';
    if (style === 'chrysanthemum') return <><span className="deceased-icon" title="고인">❁</span> {parent.name}</>;
    if (style === 'ribbon') return <><span className="deceased-icon" title="고인">🎗</span> {parent.name}</>;
    return <>故 {parent.name}</>;
  };

  return (
    <section className="greeting section" style={{ fontFamily: data.fontFamily }} aria-label="인사말">
      <div className="greeting-text">
        <h2>INVITATION</h2>
        <p className="greeting-title">{data.greetingTitle || '소중한 분들을 초대합니다'}</p>
        <p style={{ whiteSpace: 'pre-wrap' }}>
          {content}
        </p>
      </div>

      <div className="family-info">
        <div className="family-block">
          <span className="parent-names">
            {formatParent(groomFather)}{groomFather?.name && groomMother?.name ? <> · </> : null}{formatParent(groomMother)}
            <span className="child-label">{isEn ? 'Son' : isJa ? 'の息子' : '의 아들'}</span>
          </span>
          <span className="child-name">{data.groomName || (isJa ? '新郎' : '신랑')}</span>
        </div>
        <div className="family-block">
          <span className="parent-names">
            {formatParent(brideFather)}{brideFather?.name && brideMother?.name ? <> · </> : null}{formatParent(brideMother)}
            <span className="child-label">{isEn ? 'Daughter' : isJa ? 'の娘' : '의 딸'}</span>
          </span>
          <span className="child-name">{data.brideName || (isJa ? '新婦' : '신부')}</span>
        </div>
      </div>

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
