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

export const uploadImage = async (file: File, _path: string): Promise<string> => {
  const resized = await resizeImage(file, 800, 0.6);
  const resizedFile = new File([resized], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });

  const formData = new FormData();
  formData.append('file', resizedFile);

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
