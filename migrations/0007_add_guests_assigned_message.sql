-- 하객별로 뽑힌 오프닝 문구 배리에이션의 인덱스 (NULL = 아직 안 뽑힘)
-- relation 카테고리 내에서 몇 번째 문구인지를 저장하며, 실제 문구 텍스트는
-- src/utils/guestOpeningTemplates.ts에서 관리한다 (언어별 렌더링을 위해 텍스트 자체는 저장하지 않음)
ALTER TABLE guests ADD COLUMN assigned_message_index INTEGER;
