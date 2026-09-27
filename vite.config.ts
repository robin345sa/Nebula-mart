import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig, Plugin} from 'vite';

function uploadPlugin(): Plugin {
  return {
    name: 'file-upload-handler',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Direct static serving of dynamically uploaded images
        if (req.url && req.url.startsWith('/uploads/')) {
          const cleanUrl = req.url.split('?')[0];
          const filePath = path.resolve(process.cwd(), 'public', cleanUrl.replace(/^\//, ''));
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase();
            const mimeTypes: Record<string, string> = {
              '.png': 'image/png',
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.webp': 'image/webp',
              '.gif': 'image/gif',
              '.svg': 'image/svg+xml',
              '.avif': 'image/avif',
              '.ico': 'image/x-icon'
            };
            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        }

        if (req.url === '/api/upload' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { filename, base64 } = JSON.parse(body);
              if (!base64) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'No image data provided' }));
                return;
              }

              const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
              let buffer: Buffer;
              let ext = 'webp';

              if (matches && matches.length === 3) {
                const mime = matches[1];
                if (mime.includes('png')) ext = 'png';
                else if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
                else if (mime.includes('svg')) ext = 'svg';
                else if (mime.includes('webp')) ext = 'webp';
                buffer = Buffer.from(matches[2], 'base64');
              } else {
                buffer = Buffer.from(base64, 'base64');
              }

              const uploadsDir = path.resolve(process.cwd(), 'public/uploads');
              if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
              }

              const safeName = (filename || `image-${Date.now()}`)
                .replace(/[^a-zA-Z0-9.-]/g, '_')
                .replace(/\.[^/.]+$/, '');
              const targetFileName = `${safeName}-${Date.now()}.${ext}`;
              const targetPath = path.join(uploadsDir, targetFileName);

              fs.writeFileSync(targetPath, buffer);

              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  url: `/uploads/${targetFileName}`
                })
              );
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err?.message || 'Upload failed' }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), uploadPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
