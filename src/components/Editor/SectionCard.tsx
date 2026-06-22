import React from 'react';
import { ChevronRight } from 'lucide-react';

interface SectionCardProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  sectionRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon, expanded, onToggle, sectionRef, children }) => {
  return (
    <div className={`editor-section-card ${expanded ? 'expanded' : ''}`} ref={sectionRef}>
      <div className="section-header" onClick={onToggle}>
        <div className="header-left">
          {icon}
          <h3>{title}</h3>
        </div>
        <ChevronRight size={18} className="collapse-icon" />
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
