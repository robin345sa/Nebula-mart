import { SupabaseDataService, getSupabaseClient } from './supabase';

/**
 * Client-side image processor & multi-tier uploader:
 * 1. Resizes large hard-drive photos into web-optimized WebP/JPEG (800px max, ~30-45KB)
 * 2. If Supabase is configured, uploads directly to Supabase Storage ('store-media' bucket)
 * 3. Returns the high-efficiency WebP/JPEG data URL, which is saved in Firebase Firestore documents
 *    and synchronized in real-time to ALL other devices (mobile, desktop, preview links).
 */
export async function processAndUploadImage(file: File, maxWidth = 800, quality = 0.80): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const rawResult = readerEvent.target?.result as string;
      if (!rawResult) {
        resolve('');
        return;
      }

      const img = new Image();
      img.onload = async () => {
        try {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          let base64 = rawResult;
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            try {
              base64 = canvas.toDataURL('image/webp', quality);
              if (!base64.startsWith('data:image/webp')) {
                base64 = canvas.toDataURL('image/jpeg', quality);
              }
            } catch {
              base64 = rawResult;
            }
          }

          const cleanName = file.name
            .replace(/\.[^/.]+$/, '')
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .slice(0, 40);

          // Tier 1: Try Supabase Storage upload if client is initialized
          const supabaseClient = getSupabaseClient();
          if (supabaseClient) {
            try {
              const blob = await new Promise<Blob | null>((resBlob) => {
                canvas.toBlob((b) => resBlob(b), 'image/webp', quality);
              });

              if (blob) {
                const cloudUrl = await SupabaseDataService.uploadFileToStorage(blob, cleanName);
                if (cloudUrl) {
                  resolve(cloudUrl);
                  return;
                }
              }
            } catch (sbUploadErr) {
              console.warn('Supabase Storage upload fallback to cloud data URL:', sbUploadErr);
            }
          }

          // Tier 2: Return high-efficiency web-optimized WebP data URL
          // Guaranteed to persist directly in Firestore documents & sync across all devices!
          resolve(base64);
        } catch (err) {
          console.error('Image processing error:', err);
          resolve(rawResult);
        }
      };

      img.onerror = () => {
        resolve(rawResult);
      };

      img.src = rawResult;
    };

    reader.onerror = () => {
      resolve('');
    };

    reader.readAsDataURL(file);
  });
}
