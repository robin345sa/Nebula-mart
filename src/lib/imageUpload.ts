/**
 * Client-side image processor & server uploader
 * Resizes large hard-drive photos into web-optimized WebP/JPEG,
 * posts to /api/upload to write permanently to public/uploads/ on disk,
 * and falls back safely to high-efficiency data URLs.
 */

export async function processAndUploadImage(file: File, maxWidth = 1200, quality = 0.85): Promise<string> {
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

          // Upload to /api/upload to write to public/uploads/ on disk
          try {
            const cleanName = file.name
              .replace(/\.[^/.]+$/, '')
              .replace(/[^a-zA-Z0-9_-]/g, '_')
              .slice(0, 40);

            const response = await fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                filename: cleanName || 'product-image',
                base64: base64
              })
            });

            if (response.ok) {
              const data = await response.json();
              if (data && data.url) {
                resolve(data.url);
                return;
              }
            }
          } catch (uploadErr) {
            console.warn('Direct disk upload fallback to data URL:', uploadErr);
          }

          // Fallback to base64 if server upload wasn't available
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
