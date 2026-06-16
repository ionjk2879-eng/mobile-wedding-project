import React from 'react';
import { InvitationData } from '../../types';

interface PreviewProps {
  data: InvitationData;
}

const VideoEmbed: React.FC<PreviewProps> = ({ data }) => {
  if (!data.videoUrl) return null;

  const getEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop() || '';
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com')) {
      videoId = url.split('/').pop() || '';
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  return (
    <section className="video-section section">
      <h2>소중한 날의 기록</h2>
      <div className="video-container">
        <iframe
          src={getEmbedUrl(data.videoUrl)}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Wedding Video"
        ></iframe>
      </div>
      <style>{`
        .video-container {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 */
          height: 0;
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid var(--wedding-border);
        }
        .video-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </section>
  );
};

export default VideoEmbed;
