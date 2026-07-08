import { InvitationData } from '../types';
import { initialData } from '../stores/useInvitationStore';

export interface AIPreset {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: string;
  previewColors: string[];
  tags?: string[];
  sampleSlug?: string;
  accentOnText?: boolean;
  settings: Partial<InvitationData>;
}

export const AI_PRESETS: AIPreset[] = [
  // ─── 1. 아이보리 네이비 ─────────────────────────────────────────
  {
    id: 'ivory-navy-classic',
    name: '아이보리 네이비',
    category: '클래식',
    description: '은은한 크림 배경에 네이비와 블랙으로 포인트를 준 차분한 클래식 스타일',
    emoji: '🤍',
    previewColors: ['#EFEDE7', '#163A5F', '#000000'],
    settings: {
      theme: 'ivorynavy',
    },
  },
];

export function applyPreset(preset: AIPreset): InvitationData {
  const { settings } = preset;
  const merged: InvitationData = {
    ...initialData,
    ...settings,
    opening: {
      ...initialData.opening,
      ...(settings.opening || {}),
    },
  };
  if (settings.sectionOrder) {
    merged.templateSectionOrder = [...settings.sectionOrder];
  }
  return merged;
}
