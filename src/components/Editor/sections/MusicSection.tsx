import React from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';

const MUSIC_PRESETS = [
  { name: '없음', url: '' },
  { name: 'Romantic Piano', url: '/music/paulyudin-romantic-romantic-music-493488.mp3' },
  { name: 'Romantic', url: '/music/nastelbom-romantic-436840.mp3' },
  { name: 'Wedding Romantic', url: '/music/leberch-wedding-romantic-375196.mp3' },
  { name: 'Wedding Ceremony', url: '/music/the_mountain-wedding-522480.mp3' },
  { name: 'Wedding March', url: '/music/the_mountain-wedding-487025.mp3' },
  { name: 'Life Happy', url: '/music/the_mountain-life-happy-131387.mp3' },
  { name: 'Life Story', url: '/music/the_mountain-life-story-149913.mp3' },
  { name: 'Smile Life', url: '/music/the_mountain-smile-life-133108.mp3' },
];

const MusicSection: React.FC = () => {
  const bgMusicUrl = useInvitationStore((s) => s.data.bgMusicUrl);
  const updateField = useInvitationStore((s) => s.updateField);

  return (
    <>
      <div className="input-group">
        <label>음악 선택</label>
        <div className="music-select-list">
          {MUSIC_PRESETS.map(m => (
            <button key={m.name} type="button" className={`music-select-btn ${bgMusicUrl === m.url ? 'active' : ''}`} onClick={() => updateField('bgMusicUrl', m.url)}>
              <span className="music-select-name">{m.name}</span>
              {m.url && bgMusicUrl === m.url && <span className="music-playing-badge">선택됨</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="input-group">
        <label>또는 파일 업로드</label>
        <label className="music-upload-btn">
          <span>{bgMusicUrl && bgMusicUrl.startsWith('data:') ? '업로드됨' : 'mp3 파일 선택'}</span>
          <input type="file" accept="audio/mpeg,audio/mp3" hidden onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => updateField('bgMusicUrl', ev.target?.result as string);
            reader.readAsDataURL(file);
          }} />
        </label>
      </div>
    </>
  );
};

export default MusicSection;
