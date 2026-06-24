export function getFirebaseErrorMessage(err: unknown): string {
  const code = (err as { code?: string }).code;
  const message = (err as { message?: string }).message;

  if (!navigator.onLine || code === 'unavailable') {
    return '인터넷 연결을 확인해주세요.';
  }

  switch (code) {
    case 'permission-denied':
    case 'unauthenticated':
      return '접근 권한이 없습니다. 주소를 확인해주세요.';
    case 'not-found':
      return '데이터를 찾을 수 없습니다.';
    case 'resource-exhausted':
      return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
    case 'storage/unauthorized':
      return '파일 업로드 권한이 없습니다.';
    case 'storage/canceled':
      return '업로드가 취소되었습니다.';
    case 'storage/unknown':
      return '파일 업로드 중 오류가 발생했습니다.';
    default:
      break;
  }

  if (message?.includes('timeout')) {
    return '서버 응답이 없습니다. 잠시 후 다시 시도해주세요.';
  }

  if (message?.includes('exceeds the maximum') || message?.includes('INVALID_ARGUMENT') || message?.includes('too large')) {
    return '데이터가 너무 큽니다. 사진 용량을 줄여주세요.';
  }

  return '오류가 발생했습니다. 다시 시도해주세요.';
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const code = (err as { code?: string }).code;
      const retryable =
        !navigator.onLine ||
        code === 'unavailable' ||
        code === 'resource-exhausted' ||
        (err as Error).message?.includes('timeout');
      if (!retryable || attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}
