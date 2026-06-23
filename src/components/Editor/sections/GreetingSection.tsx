import React, { useState } from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';

const GREETING_TEMPLATES: { label: string; icon: string; content: string }[] = [
  {
    label: '감사',
    icon: '🙏',
    content: '오늘 이 자리에 함께해 주셔서\n진심으로 감사드립니다.\n\n두 사람이 하나 되는 이 뜻깊은 날,\n따뜻한 축하와 격려를 보내주시는\n모든 분들께 감사의 마음을 전합니다.\n\n여러분의 사랑과 축복 속에서\n아름다운 가정을 이루겠습니다.',
  },
  {
    label: '초대',
    icon: '💌',
    content: '곁에 있을 때 가장 나다운 모습이 되게 하는 사람,\n꿈을 꾸게 하고, 그 꿈을 함께 나누고 싶은 사람을 만났습니다.\n\n서로의 다름을 인정하며,\n서로의 부족함을 채워주는 사랑으로\n행복한 가정을 일구어 나가겠습니다.\n\n저희의 시작을 축복해 주시면 감사하겠습니다.',
  },
  {
    label: '봄',
    icon: '🌸',
    content: '봄꽃이 피어나듯\n서로를 향한 마음이 활짝 피었습니다.\n\n따스한 봄바람처럼 다정한 사람과\n함께 걸어갈 새로운 길 위에\n소중한 분들을 초대합니다.\n\n봄날의 설렘을 가득 안고\n행복한 첫걸음을 내딛겠습니다.',
  },
  {
    label: '여름',
    icon: '🌊',
    content: '여름 햇살처럼 찬란한 사랑이\n저희 두 사람을 하나로 이어주었습니다.\n\n뜨겁지만 시원한 바람처럼\n서로에게 쉼이 되어주는 사이,\n함께하는 인생의 여름을 시작합니다.\n\n푸른 하늘 아래 축복해 주세요.',
  },
  {
    label: '가을',
    icon: '🍂',
    content: '가을 단풍처럼 아름답게 물든\n두 사람의 사랑 이야기를 전합니다.\n\n깊어가는 계절만큼 깊어진 마음으로\n평생을 함께할 약속을 나누려 합니다.\n\n풍요로운 가을날,\n저희의 새 출발을 축복해 주세요.',
  },
  {
    label: '겨울',
    icon: '❄️',
    content: '하얀 눈처럼 순수한 마음으로\n서로를 바라보는 두 사람이\n따뜻한 겨울날, 하나가 됩니다.\n\n추운 날씨에도 마음만은 따뜻한\n이 특별한 날에 함께해 주세요.\n\n서로의 온기가 되어\n평생을 함께 걸어가겠습니다.',
  },
];

const GreetingSection: React.FC = () => {
  const greetingContent = useInvitationStore((s) => s.data.greetingContent);
  const updateField = useInvitationStore((s) => s.updateField);
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <>
      <div className="input-group">
        <label>인사말 템플릿</label>
        <button type="button" className="greeting-template-toggle" onClick={() => setShowTemplates(!showTemplates)}>
          {showTemplates ? '접기' : '템플릿에서 선택하기'}
        </button>
        {showTemplates && (
          <div className="greeting-template-grid">
            {GREETING_TEMPLATES.map((t) => (
              <button key={t.label} type="button" className="greeting-template-btn" onClick={() => { updateField('greetingContent', t.content); setShowTemplates(false); }}>
                <span className="greeting-template-icon">{t.icon}</span>
                <span className="greeting-template-label">{t.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="input-group">
        <label>내용</label>
        <textarea value={greetingContent} onChange={(e) => updateField('greetingContent', e.target.value)} rows={10} className="modern-input" />
      </div>

      <style>{`
        .greeting-template-toggle { width: 100%; padding: 10px; border: 1px dashed #D4A5C6; border-radius: 12px; background: #FFF9FB; color: #D4A5C6; font-size: 0.82em; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .greeting-template-toggle:hover { background: #F8EEF4; }
        .greeting-template-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px; }
        .greeting-template-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 8px; border: 1px solid #E5E7EB; border-radius: 12px; background: white; cursor: pointer; transition: all 0.2s; }
        .greeting-template-btn:hover { border-color: #D4A5C6; background: #FFF9FB; }
        .greeting-template-icon { font-size: 1.3rem; }
        .greeting-template-label { font-size: 0.75rem; font-weight: 600; color: #4B5563; }
      `}</style>
    </>
  );
};

export default GreetingSection;
