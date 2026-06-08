import { supabase } from '../supabase';

const MAX_WIDTH = 800;
const WEBP_QUALITY = 0.8;

/**
 * Compresses an image to WebP with max width 800px.
 * Returns a Blob.
 */
export const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File is not an image'));
    }

    const img = new Image();
    const objUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objUrl);

      let width = img.width;
      let height = img.height;

      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        },
        'image/webp',
        WEBP_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objUrl);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = objUrl;
  });
};

/**
 * Uploads a file (compressing if image) to Supabase Storage.
 * Returns the public URL.
 */
export const processAndUploadMedia = async (file, bucketName = 'site_content') => {
  let fileToUpload = file;
  let fileExt = file.name.split('.').pop().toLowerCase();
  let fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  if (file.type.startsWith('image/')) {
    const webpBlob = await compressImage(file);
    fileToUpload = new File([webpBlob], `${fileName}.webp`, { type: 'image/webp' });
    fileName = `${fileName}.webp`;
  } else {
    // Note: User explicitly stated product media is ALWAYS an image. 
    // We leave this for site_content legacy support, but for products, it should be an image.
    fileName = `${fileName}.${fileExt}`;
  }

  // ENFORCE 3MB LIMIT
  const MAX_BYTES = 3 * 1024 * 1024;
  if (fileToUpload.size > MAX_BYTES) {
    throw new Error(`File is too large (${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB). Maximum allowed size is 3MB.`);
  }

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, fileToUpload, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
};

/**
 * Extracts path from a Supabase public URL and deletes it from the bucket.
 */
export const deleteOldMedia = async (url, bucketName = 'site_content') => {
  if (!url || !url.includes(`supabase.co/storage/v1/object/public/${bucketName}/`)) return;
  
  try {
    const parts = url.split(`${bucketName}/`);
    if (parts.length > 1) {
      const path = parts[1];
      await supabase.storage.from(bucketName).remove([path]);
    }
  } catch (err) {
    console.error(`Failed to delete old media from ${bucketName}:`, err);
  }
};
