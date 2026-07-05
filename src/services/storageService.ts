const resizeImage = (file: File, maxSize: number, quality: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      URL.revokeObjectURL(img.src);
      if (width > height) { height = Math.round((height * maxSize) / width); width = maxSize; }
      else { width = Math.round((width * maxSize) / height); height = maxSize; }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => { if (blob) resolve(blob); else reject(new Error('toBlob failed')); }, 'image/jpeg', quality);
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = URL.createObjectURL(file);
  });

// folder: R2 키 접두사 힌트. 서버(handleUpload)가 허용 목록(anniversary/{slug} 등)에 맞는
// 값일 때만 실제로 키에 반영하고, 그 외에는 기존과 동일하게 무시하고 평평한 랜덤 키를 쓴다 —
// 그래서 이 값을 넘기지 않던 기존 호출부들은 동작이 전혀 바뀌지 않는다.
export const uploadImage = async (file: File, folder?: string, maxSize = 800): Promise<string> => {
  const resized = await resizeImage(file, maxSize, maxSize > 800 ? 0.82 : 0.6);
  const resizedFile = new File([resized], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });

  const formData = new FormData();
  formData.append('file', resizedFile);
  if (folder) formData.append('folder', folder);

  const token = localStorage.getItem('sonett_token');
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error || '업로드에 실패했습니다.');
  }

  const { url } = await res.json() as { url: string };
  return url;
};

export const uploadFile = uploadImage;
