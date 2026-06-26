import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface MusicPlayerProps {
  url: string;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ url }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const userPaused = useRef(false);
  const autoPlayed = useRef(false);

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
      <audio ref={audioRef} src={url} loop preload="auto" />
      <div className="music-float-wrap">
        <button className="music-float-btn" onClick={toggle} ref={btnRef}>
          {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: 2 }} />}
        </button>
      </div>
    </>
  );
};

export default MusicPlayer;
