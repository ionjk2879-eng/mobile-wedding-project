export function getApiErrorMessage(err: unknown): string {
  const message = (err as { message?: string }).message || '';

  if (!navigator.onLine) return '인터넷 연결을 확인해주세요.';
  if (message.includes('timeout')) return '서버 응답이 없습니다. 잠시 후 다시 시도해주세요.';
  if (message.includes('너무 큽니다') || message.includes('2MB')) return '데이터가 너무 큽니다. 사진 용량을 줄여주세요.';
  if (message.includes('로그인')) return message;
  if (message.includes('권한')) return message;
  if (message.includes('주소')) return message;
  if (message) return message;

  return '오류가 발생했습니다. 다시 시도해주세요.';
}

export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const retryable = !navigator.onLine || (err as Error).message?.includes('timeout');
      if (!retryable || attempt === maxRetries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
  throw lastError;
}
