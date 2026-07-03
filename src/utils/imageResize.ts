// 갤러리 업로드 전 클라이언트에서 리사이즈+압축: 긴 변 기준 maxDim, JPEG quality로 재인코딩.
// EXIF 회전 정보를 반영해 모바일 사진이 옆으로 눕거나 뒤집혀 저장되지 않도록 한다.
export async function resizeImageForUpload(file: File, maxDim = 1920, quality = 0.8): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  let { width, height } = bitmap;

  if (width > maxDim || height > maxDim) {
    if (width >= height) {
      height = Math.round(height * (maxDim / width));
      width = maxDim;
    } else {
      width = Math.round(width * (maxDim / height));
      height = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('이미지를 처리할 수 없습니다.');
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('이미지 압축에 실패했습니다.'))), 'image/jpeg', quality);
  });
}
