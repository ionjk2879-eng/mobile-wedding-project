import React, { useState, useRef, useEffect } from 'react';
import { Music2 } from 'lucide-react';

const EqBars: React.FC = () => (
  <div className="music-eq" aria-hidden="true">
    <span /><span /><span /><span />
  </div>
);

interface MusicPlayerProps {
  url: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ url }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopEnabled, setLoopEnabled] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const userPaused = useRef(false);
  const autoPlayed = useRef(false);

  // mount 후 컨텍스트 감지: 샘플 템플릿이면 loop 비활성화
  useEffect(() => {
    if (btnRef.current?.closest('.tmpl-preview-scroll')) {
      setLoopEnabled(false);
    }
  }, []);

  useEffect(() => {
    setIsPlaying(false);
    userPaused.current = false;
    autoPlayed.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [url]);

  useEffect(() => {
    if (!url) return;

    const previewArea =
      btnRef.current?.closest('.tmpl-preview-scroll') ||
      btnRef.current?.closest('.preview-content-scroll') ||
      btnRef.current?.closest('.full-preview-container') ||
      btnRef.current?.closest('.view-container');

    if (!previewArea) return;

    const tryAutoPlay = () => {
      if (autoPlayed.current || userPaused.current || !audioRef.current) return;
      audioRef.current.play().then(() => {
        autoPlayed.current = true;
        setIsPlaying(true);
      }).catch(() => {});
    };

    const events = ['click', 'touchstart', 'scroll'] as const;
    events.forEach(e => previewArea.addEventListener(e, tryAutoPlay, { capture: true }));
    return () => {
      events.forEach(e => previewArea.removeEventListener(e, tryAutoPlay, { capture: true }));
    };
  }, [url]);

  // 재생 종료 시 상태 동기화
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  const toggle = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      userPaused.current = true;
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        userPaused.current = false;
      }).catch(() => {});
    }
  };

  if (!url) return null;

  return (
    <>
      <audio ref={audioRef} src={url} loop={loopEnabled} preload="auto" />
      <div className="music-float-wrap">
        <button className="music-float-btn" onClick={toggle} ref={btnRef}>
          {isPlaying ? <EqBars /> : <Music2 size={15} />}
        </button>
      </div>
    </>
  );
};

export default MusicPlayer;
