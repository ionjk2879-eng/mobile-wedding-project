import React from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { InvitationData } from '../../../types';

const AccountsSection: React.FC = () => {
  const data = useInvitationStore((s) => s.data);
  const updateField = useInvitationStore((s) => s.updateField);
  const updateAccount = useInvitationStore((s) => s.updateAccount);

  return (
    <>
      <div className="input-group">
        <label>연출 방식</label>
        <div className="account-style-grid">
          {([
            { key: 'style1', name: '신랑·신부 구분형', desc: '신랑측과 신부측을 나누어 표시' },
            { key: 'style2', name: '탭 전환 + 카드 슬라이드', desc: '신랑/신부 탭으로 전환, 좌우 스크롤 카드' },
            { key: 'style3', name: '아코디언 펼치기', desc: '신랑/신부측을 각각 열고 닫기' },
            { key: 'style4', name: '팝업', desc: '"계좌 정보 보기" 버튼을 누르면 팝업으로 표시' },
          ] as { key: InvitationData['accountStyle']; name: string; desc: string }[]).map(s => (
            <button key={s.key} type="button" className={`account-style-btn ${data.accountStyle === s.key ? 'active' : ''}`} onClick={() => updateField('accountStyle', s.key)}>
              <strong>{s.name}</strong><span>{s.desc}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="modern-list">
        {data.accounts.map((account, index) => (
          <div key={index} className="modern-list-item col">
            <div className="item-row">
              <span className="role-tag">{account.side}</span>
              <input type="text" placeholder="예금주" value={account.owner} onChange={(e) => updateAccount(index, 'owner', e.target.value)} className="modern-input transparent" />
            </div>
            <input type="text" placeholder="계좌번호" value={account.number} onChange={(e) => updateAccount(index, 'number', e.target.value.replace(/[^0-9-]/g, ''))} className="modern-input transparent full" inputMode="numeric" />
            <input type="text" placeholder="은행명" value={account.bank} onChange={(e) => updateAccount(index, 'bank', e.target.value)} className="modern-input transparent full" />
          </div>
        ))}
      </div>
    </>
  );
};

export default AccountsSection;
