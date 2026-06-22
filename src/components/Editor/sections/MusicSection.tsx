import React, { useState } from 'react';
import useInvitationStore from '../../../stores/useInvitationStore';
import { uploadFile } from '../../../firebase';
import { toast } from '../../../stores/useToastStore';
import { getFirebaseErrorMessage } from '../../../utils/firebaseError';

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
  const slug = useInvitationStore((s) => s.data.slug);
  const updateField = useInvitationStore((s) => s.updateField);
  const [uploading, setUploading] = useState(false);

  const handleMusicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file, `music/${slug || 'temp'}/${Date.now()}_${file.name}`);
      updateField('bgMusicUrl', url);
    } catch (err) {
      toast.error(getFirebaseErrorMessage(err));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

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
        <label className={`music-upload-btn ${uploading ? 'uploading' : ''}`}>
          <span>{uploading ? '업로드 중...' : bgMusicUrl && !bgMusicUrl.startsWith('/music/') ? '업로드됨' : 'mp3 파일 선택'}</span>
          <input type="file" accept="audio/mpeg,audio/mp3" hidden onChange={handleMusicUpload} disabled={uploading} />
        </label>
      </div>
    </>
  );
};

export default MusicSection;