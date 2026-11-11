import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTaskSnapshot,
} from 'firebase/storage';
import { firebaseStorage } from './config.ts';

export const storage = firebaseStorage;

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  percentage: number;
  state: UploadTaskSnapshot['state'];
}

/**
 * Upload a file to Firebase Storage with progress tracking.
 */
export function uploadFile(
  storagePath: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const storageRef = ref(firebaseStorage, storagePath);
    const task = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    });

    task.on(
      'state_changed',
      (snapshot) => {
        if (onProgress) {
          onProgress({
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes,
            percentage: Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
            state: snapshot.state,
          });
        }
      },
      (error) => reject(error),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      },
    );
  });
}

/**
 * Upload a user avatar.
 */
export async function uploadUserAvatar(
  userId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `users/${userId}/avatar/avatar.${ext}`;
  return uploadFile(path, file, onProgress);
}

/**
 * Upload a product image.
 */
export async function uploadProductImage(
  productId: string,
  file: File,
  index: number,
  onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `products/${productId}/${index}-${Date.now()}.${ext}`;
  return uploadFile(path, file, onProgress);
}

/**
 * Upload a vendor logo or banner.
 */
export async function uploadVendorAsset(
  vendorId: string,
  assetType: 'logo' | 'banner',
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `vendors/${vendorId}/${assetType}.${ext}`;
  return uploadFile(path, file, onProgress);
}

/**
 * Delete a file from storage.
 */
export async function deleteFile(storagePath: string): Promise<void> {
  const storageRef = ref(firebaseStorage, storagePath);
  await deleteObject(storageRef);
}

/**
 * Get the download URL of an existing file.
 */
export async function getFileURL(storagePath: string): Promise<string> {
  const storageRef = ref(firebaseStorage, storagePath);
  return getDownloadURL(storageRef);
}
