import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => (
  <div className="legal-page">
    <header className="legal-header">
      <Link to="/" className="legal-logo">Sonett</Link>
    </header>
    <main className="legal-content">
      <h1>개인정보처리방침</h1>
      <p className="legal-date">시행일: 2026년 1월 1일</p>

      <p>Sonett(이하 "서비스")는 개인정보보호법에 따라 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하게 처리하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.</p>

      <h2>제1조 (수집하는 개인정보 항목)</h2>
      <p>서비스는 다음과 같은 개인정보를 수집합니다.</p>
      <table className="legal-table">
        <thead>
          <tr><th>구분</th><th>수집 항목</th><th>수집 목적</th></tr>
        </thead>
        <tbody>
          <tr><td>회원가입(소셜 로그인)</td><td>이름(닉네임), 이메일, 프로필 사진</td><td>회원 식별 및 서비스 제공</td></tr>
          <tr><td>청첩장 제작</td><td>신랑·신부 이름, 연락처, 예식 일시·장소, 부모님 성함·연락처, 계좌 정보(선택 입력), 사진</td><td>청첩장 콘텐츠 구성 및 표시</td></tr>
          <tr><td>RSVP(참석 의사)</td><td>하객 이름, 참석 여부, 인원 수, 식사 옵션, 메시지</td><td>참석 의사 수집 및 전달</td></tr>
          <tr><td>방명록</td><td>작성자 이름, 메시지 내용, 비밀번호(4자리)</td><td>축하 메시지 등록 및 관리</td></tr>
          <tr><td>결제(유료)</td><td>결제 수단 정보</td><td>유료 서비스 결제 처리</td></tr>
        </tbody>
      </table>

      <h2>제2조 (개인정보의 수집 및 이용 목적)</h2>
      <ol>
        <li>서비스 회원 관리: 소셜 로그인을 통한 회원 식별, 서비스 이용에 따른 본인 확인</li>
        <li>청첩장 서비스 제공: 모바일 청첩장 제작, 편집, 호스팅, 공유</li>
        <li>하객 응답 관리: RSVP 수집, 방명록 관리</li>
        <li>유료 서비스 제공: 결제 처리 및 환불</li>
        <li>서비스 개선: 이용 통계 분석 및 서비스 품질 향상</li>
      </ol>

      <h2>제3조 (개인정보의 보유 및 이용 기간)</h2>
      <ol>
        <li>회원 정보: 회원 탈퇴 시까지 보유하며, 탈퇴 즉시 파기합니다.</li>
        <li>청첩장 데이터: 이용자가 삭제하거나 회원 탈퇴 시 파기합니다.</li>
        <li>
          계좌 정보 및 참석 의사(RSVP) 응답: 예식 예정일로부터 약 3주가 되는 시점까지 하객에게
          공개되는 것을 기본으로 하며, 그 시점이 지나면 하객이 보는 화면에서 자동으로
          비공개 처리됩니다. 비공개 전환 이후에는 신랑·신부 본인만 관리자 페이지에서 계속
          열람할 수 있습니다. 신랑·신부는 관리자 페이지에서 이 시점 이전에 미리 비공개로
          전환하거나, 시점이 지난 뒤에도 계속 공개 상태로 유지하도록 직접 선택할 수 있습니다.
        </li>
        <li>방명록 데이터: 해당 청첩장 삭제 시 함께 파기합니다.</li>
        <li>결제 정보: 관련 법령(전자상거래법 등)에 따라 5년간 보관 후 파기합니다.</li>
      </ol>

      <h2>제4조 (개인정보의 제3자 제공)</h2>
      <p>서비스는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외로 합니다.</p>
      <ol>
        <li>이용자가 사전에 동의한 경우</li>
        <li>법령의 규정에 의하거나, 수사 목적으로 법령에 정해진 절차에 따라 요청이 있는 경우</li>
      </ol>

      <h2>제5조 (개인정보 처리의 위탁)</h2>
      <table className="legal-table">
        <thead>
          <tr><th>수탁업체</th><th>위탁 업무</th></tr>
        </thead>
        <tbody>
          <tr><td>Cloudflare</td><td>데이터 저장, 서비스 운영</td></tr>
          <tr><td>Kakao</td><td>소셜 로그인, 카카오톡 공유</td></tr>
          <tr><td>Naver</td><td>소셜 로그인</td></tr>
        </tbody>
      </table>

      <h2>제6조 (이용자의 권리)</h2>
      <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
      <ol>
        <li>개인정보 열람 요구</li>
        <li>오류 등이 있을 경우 정정 요구</li>
        <li>삭제 요구</li>
        <li>처리 정지 요구</li>
      </ol>
      <p>위 권리 행사는 서비스 내 설정 또는 이메일을 통해 가능합니다.</p>

      <h2>제7조 (개인정보의 파기)</h2>
      <ol>
        <li>서비스는 개인정보 보유 기간의 경과, 처리 목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</li>
        <li>전자적 파일 형태의 정보는 복구할 수 없는 방법으로 파기합니다.</li>
        <li>
          다만 계좌 정보 및 참석 의사(RSVP) 응답은 제3조에서 정한 보유 기간이 지나더라도
          실제로 삭제되지 않고, 하객이 보는 화면에서만 노출되지 않도록 <strong>비공개로
          전환</strong>되는 방식으로 처리됩니다. 신랑·신부 본인은 이 데이터를 이후에도 관리자
          페이지에서 계속 열람할 수 있으며, 완전한 삭제를 원하는 경우 청첩장 삭제 또는
          제10조의 연락처를 통한 별도 요청으로 처리할 수 있습니다.
        </li>
      </ol>

      <h2>제8조 (개인정보의 안전성 확보 조치)</h2>
      <p>서비스는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
      <ol>
        <li>개인정보의 암호화: 비밀번호 등 중요 정보는 암호화하여 저장·관리합니다.</li>
        <li>접근 통제: 개인정보에 대한 접근 권한을 최소한의 인원으로 제한합니다.</li>
        <li>보안 프로그램 설치 및 갱신: 해킹 등에 대비하여 보안 시스템을 유지합니다.</li>
      </ol>

      <h2>제9조 (쿠키의 사용)</h2>
      <p>서비스는 이용자 인증을 위해 쿠키(Cookie)를 사용할 수 있습니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수 있으나, 이 경우 서비스 이용에 제한이 있을 수 있습니다.</p>

      <h2>제10조 (개인정보 보호 책임자)</h2>
      <p>서비스는 개인정보 처리에 관한 업무를 총괄하는 개인정보 보호 책임자를 지정합니다.</p>
      <ul>
        <li>책임자: Sonett 운영팀</li>
        <li>이메일: support@sonett.kr</li>
      </ul>

      <h2>제11조 (개인정보처리방침의 변경)</h2>
      <p>본 개인정보처리방침은 법령, 정책 또는 보안 기술의 변경에 따라 내용이 추가, 삭제 및 수정될 수 있으며, 변경 시 서비스 내 공지사항을 통해 고지합니다.</p>

      <h2>부칙</h2>
      <p>본 개인정보처리방침은 2026년 1월 1일부터 시행합니다.</p>
      <table className="legal-table">
        <thead>
          <tr><th>개정일</th><th>개정 사유</th></tr>
        </thead>
        <tbody>
          <tr><td>2026년 7월 4일</td><td>기념일 모드 관련 개인정보 비공개 전환 조항 추가</td></tr>
        </tbody>
      </table>
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
      .legal-table { width: 100%; border-collapse: collapse; margin: 0 0 16px; font-size: 0.85rem; }
      .legal-table th, .legal-table td { border: 1px solid #E5E7EB; padding: 10px 12px; text-align: left; }
      .legal-table th { background: #F9FAFB; font-weight: 600; color: #1F2937; }
      .legal-table td { color: #374151; }
      @media (max-width: 600px) {
        .legal-content { padding: 24px 16px 60px; font-size: 0.85rem; }
        .legal-content h1 { font-size: 1.3rem; }
        .legal-table { font-size: 0.78rem; }
        .legal-table th, .legal-table td { padding: 8px; }
      }
    `}</style>
  </div>
);

export default PrivacyPage;
