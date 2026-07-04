import React from 'react';
import { ChevronRight, MoveRight } from 'lucide-react';

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
  sectionRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, expanded, onToggle, onNavigate, sectionRef, children }) => {
  return (
    <div className={`editor-section-card ${expanded ? 'expanded' : ''}`} ref={sectionRef}>
      <div className="section-header">
        <button type="button" className="section-header-main" onClick={onToggle} aria-expanded={expanded}>
          <div className="header-left">
            {icon}
            <h3>{title}</h3>
          </div>
        </button>
        <div className="section-header-actions">
          {onNavigate && (
            <button
              type="button"
              className="section-nav-btn"
              onClick={(e) => { e.stopPropagation(); onNavigate(); }}
              title="카테고리·미리보기 이동"
              aria-label="카테고리·미리보기 이동"
            >
              <MoveRight size={15} />
            </button>
          )}
          <button type="button" className="section-toggle-btn" onClick={onToggle} aria-expanded={expanded} aria-label={expanded ? '섹션 접기' : '섹션 펼치기'}>
            <ChevronRight size={18} className="collapse-icon" />
          </button>
        </div>
      </div>
      {expanded && (
        <div className="section-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default SectionCard;
