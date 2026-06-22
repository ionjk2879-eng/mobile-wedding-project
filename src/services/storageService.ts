import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './index';

let storageAvailable: boolean | null = null;

const checkStorageAvailable = async (): Promise<boolean> => {
  if (storageAvailable !== null) return storageAvailable;
  try {
    const testRef = storageRef(storage, '__ping__');
    const result = await Promise.race([
      getDownloadURL(testRef).then(() => true),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1500)),
    ]);
    storageAvailable = result || true;
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    storageAvailable = code === 'storage/object-not-found';
  }
  return storageAvailable;
};

const resizeImage = (file: File, maxSize: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      URL.revokeObjectURL(img.src);
      if (width <= maxSize && height <= maxSize) { resolve(file); return; }
      if (width > height) { height = Math.round((height * maxSize) / width); width = maxSize; }
      else { width = Math.round((width * maxSize) / height); height = maxSize; }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => { if (blob) resolve(blob); else reject(new Error('toBlob failed')); }, 'image/jpeg', 0.82);
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = URL.createObjectURL(file);
  });

const toBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsDataURL(blob);
  });

export const uploadImage = async (file: File, path: string): Promise<string> => {
  const resized = await resizeImage(file, 1200);
  if (await checkStorageAvailable()) {
    const fileRef = storageRef(storage, path);
    const snap = await uploadBytes(fileRef, resized);
    return getDownloadURL(snap.ref);
  }
  return toBase64(resized);
};

export const uploadFile = async (file: File, path: string): Promise<string> => {
  if (await checkStorageAvailable()) {
    const fileRef = storageRef(storage, path);
    const snap = await uploadBytes(fileRef, file);
    return getDownloadURL(snap.ref);
  }
  return toBase64(file);
};
