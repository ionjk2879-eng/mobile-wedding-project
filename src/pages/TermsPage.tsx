import React from 'react';
import { Link } from 'react-router-dom';

const TermsPage: React.FC = () => (
  <div className="legal-page">
    <header className="legal-header">
      <Link to="/" className="legal-logo">Sonett</Link>
    </header>
    <main className="legal-content">
      <h1>이용약관</h1>
      <p className="legal-date">시행일: 2026년 1월 1일</p>

      <h2>제1조 (목적)</h2>
      <p>본 약관은 Sonett(이하 "서비스")가 제공하는 모바일 청첩장 제작 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>

      <h2>제2조 (용어의 정의)</h2>
      <ol>
        <li>"서비스"란 Sonett이 제공하는 모바일 청첩장 제작, 편집, 공유, 관리 등 관련 제반 서비스를 의미합니다.</li>
        <li>"이용자"란 본 약관에 동의하고 서비스를 이용하는 자를 말합니다.</li>
        <li>"청첩장"이란 이용자가 서비스를 통해 제작한 모바일 청첩장 콘텐츠를 말합니다.</li>
        <li>"프리미엄 서비스"란 유료 결제를 통해 이용할 수 있는 부가 기능을 말합니다.</li>
      </ol>

      <h2>제3조 (약관의 효력 및 변경)</h2>
      <ol>
        <li>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</li>
        <li>서비스는 관련 법령을 위배하지 않는 범위에서 본 약관을 변경할 수 있으며, 변경된 약관은 제1항과 같은 방법으로 공지합니다.</li>
      </ol>

      <h2>제4조 (서비스의 제공)</h2>
      <ol>
        <li>서비스는 다음의 서비스를 제공합니다.
          <ul>
            <li>모바일 청첩장 제작 및 편집</li>
            <li>청첩장 호스팅 및 공유</li>
            <li>RSVP(참석 의사) 수집 및 관리</li>
            <li>방명록 기능</li>
            <li>기타 서비스가 정하는 서비스</li>
          </ul>
        </li>
        <li>서비스는 운영상, 기술상의 필요에 따라 제공하고 있는 서비스를 변경할 수 있습니다.</li>
      </ol>

      <h2>제5조 (무료 및 유료 서비스)</h2>
      <ol>
        <li>무료 서비스에는 워터마크가 표시되며, 일부 기능(공유 등)이 제한될 수 있습니다.</li>
        <li>프리미엄 서비스 결제 시 워터마크 제거, 공유 기능 활성화 등 추가 기능을 이용할 수 있습니다.</li>
        <li>유료 서비스의 이용 요금 및 결제 방식은 서비스 내 안내 페이지에 별도로 게시합니다.</li>
      </ol>

      <h2>제6조 (이용자의 의무)</h2>
      <ol>
        <li>이용자는 서비스 이용 시 다음 행위를 하여서는 안 됩니다.
          <ul>
            <li>타인의 개인정보를 무단으로 수집, 이용하는 행위</li>
            <li>서비스를 부정한 목적으로 이용하는 행위</li>
            <li>서비스의 안정적 운영을 방해하는 행위</li>
            <li>기타 관련 법령에 위배되는 행위</li>
          </ul>
        </li>
      </ol>

      <h2>제7조 (콘텐츠의 권리 및 책임)</h2>
      <ol>
        <li>이용자가 서비스에 등록한 콘텐츠(사진, 텍스트 등)의 저작권은 이용자에게 귀속됩니다.</li>
        <li>이용자는 자신이 등록한 콘텐츠에 대해 적법한 권리를 보유하고 있어야 하며, 타인의 권리를 침해하지 않아야 합니다.</li>
        <li>서비스는 이용자가 등록한 콘텐츠를 서비스 제공 목적 범위 내에서만 이용합니다.</li>
      </ol>

      <h2>제8조 (서비스 이용의 제한 및 중단)</h2>
      <ol>
        <li>서비스는 다음의 경우 서비스 이용을 제한하거나 중단할 수 있습니다.
          <ul>
            <li>서비스 설비의 보수 등 공사로 인한 부득이한 경우</li>
            <li>이용자가 본 약관의 의무를 위반한 경우</li>
            <li>기타 천재지변, 국가비상사태 등 불가항력적 사유가 있는 경우</li>
          </ul>
        </li>
      </ol>

      <h2>제9조 (면책)</h2>
      <ol>
        <li>서비스는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
        <li>서비스는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</li>
      </ol>

      <h2>제10조 (분쟁 해결)</h2>
      <p>서비스와 이용자 간에 발생한 분쟁에 관한 소송은 대한민국 법을 적용하며, 관할법원은 민사소송법에 따릅니다.</p>

      <h2>부칙</h2>
      <p>본 약관은 2026년 1월 1일부터 시행합니다.</p>
    </main>

    <style>{`
      .legal-page { min-height: 100vh; background: #fff; font-family: 'Pretendard', sans-serif; }
      .legal-header { padding: 20px 24px; border-bottom: 1px solid #F0F0F0; }
      .legal-logo { font-size: 1.2rem; font-weight: 700; color: #B07A8E; text-decoration: none; letter-spacing: 1px; }
      .legal-content { max-width: 700px; margin: 0 auto; padding: 40px 24px 80px; color: #374151; line-height: 1.8; font-size: 0.92rem; }
      .legal-content h1 { font-size: 1.6rem; font-weight: 700; color: #1F2937; margin: 0 0 8px; }
      .legal-date { font-size: 0.82rem; color: #9CA3AF; margin: 0 0 40px; }
      .legal-content h2 { font-size: 1.05rem; font-weight: 700; color: #1F2937; margin: 36px 0 12px; }
      .legal-content p { margin: 0 0 16px; }
      .legal-content ol, .legal-content ul { padding-left: 20px; margin: 0 0 16px; }
      .legal-content li { margin-bottom: 8px; }
      @media (max-width: 600px) {
        .legal-content { padding: 24px 16px 60px; font-size: 0.85rem; }
        .legal-content h1 { font-size: 1.3rem; }
      }
    `}</style>
  </div>
);

export default TermsPage;
