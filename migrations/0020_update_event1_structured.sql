UPDATE posts
SET
  content = '{"structured":true,"target":"소네트 모바일 청첩장 구매자","benefit":"청첩장 1+1 쿠폰 제공 (영구소장권 1개 추가 증정)","howTo":"네이버 스마트스토어에서 포토리뷰 작성\n또는 소네트 사이트(sonett.kr)에서 후기 작성","notes":"1인 1회 참여 가능하며, 구매 개수와 관계없이 한 번만 참여할 수 있습니다.\n쿠폰은 타인에게 양도 또는 판매될 수 없습니다.\n이벤트는 별도의 종료 안내 없이 조기 마감될 수 있습니다.\n다른 이벤트와 중복 참여 가능합니다.","naverReviewUrl":""}',
  updated_at = datetime('now')
WHERE id = 1 AND type = 'event';
