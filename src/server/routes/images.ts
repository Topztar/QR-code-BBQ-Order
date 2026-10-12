import express from 'express';
import busboy from 'busboy';
import { processAndSaveImage } from '../../lib/server/imageProcessing';
import { validateImageUploadPayload } from '../../../functions/src/validators';

export interface ImageRouteContext {
  getGcsBucket: () => any;
  getMimeTypeFromExt: (filePath: string) => string;
}

export function registerImagesRoutes(app: express.Express, ctx: ImageRouteContext) {
  // Direct streaming of image files from Google Cloud Storage via File Stream (with HTTP proxying & fallback support)
  app.get(['/api/images/:path(*)', '/api/images'], async (req, res) => {
    const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600';

    try {
      let rawPath = (req.params as any)?.path || (req.query.path as string) || (req.query.file as string) || (req.query.name as string) || '';
      if (!rawPath && req.query.url) {
        const urlStr = String(req.query.url);
        if (urlStr.startsWith('gs://')) {
          const parts = urlStr.replace('gs://', '').split('/');
          parts.shift(); // remove bucket name
          rawPath = parts.join('/');
        } else if (urlStr.includes('firebasestorage.googleapis.com') || urlStr.includes('storage.googleapis.com')) {
          const match = urlStr.match(/\/o\/([^?]+)/) || urlStr.match(/storage\.googleapis\.com\/[^/]+\/(.+)/);
          if (match && match[1]) {
            rawPath = decodeURIComponent(match[1]);
          }
        } else if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
          return res.redirect(302, urlStr);
        }
      }

      if (!rawPath) {
        return res.redirect(302, DEFAULT_FALLBACK_IMAGE);
      }

      // Handle full external URLs directly
      if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
        return res.redirect(302, rawPath);
      }

      let cleanPath = decodeURIComponent(String(rawPath)).replace(/^\/+/, '').replace(/\.\.\//g, '');

      const gcsBucket = ctx.getGcsBucket();
      if (!gcsBucket) {
        console.warn('[Sabay Storage] GCS bucket not initialized. Redirecting to fallback image.');
        return res.redirect(302, DEFAULT_FALLBACK_IMAGE);
      }

      let file = gcsBucket.file(cleanPath);
      let [exists] = await file.exists();

      if (!exists && cleanPath.startsWith('dishes/')) {
        const altPath = cleanPath.replace(/^dishes\//, '');
        const altFile = gcsBucket.file(altPath);
        const [altExists] = await altFile.exists();
        if (altExists) {
          file = altFile;
          exists = true;
          cleanPath = altPath;
        }
      } else if (!exists && !cleanPath.startsWith('dishes/')) {
        const altPath = `dishes/${cleanPath}`;
        const altFile = gcsBucket.file(altPath);
        const [altExists] = await altFile.exists();
        if (altExists) {
          file = altFile;
          exists = true;
          cleanPath = altPath;
        }
      }

      if (!exists) {
        console.warn(`[Sabay Storage] File not found in GCS: ${cleanPath}. Redirecting to authentic food fallback.`);
        return res.redirect(302, DEFAULT_FALLBACK_IMAGE);
      }

      const mimeType = ctx.getMimeTypeFromExt(cleanPath);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');

      const stream = file.createReadStream();
      stream.on('error', (streamErr: any) => {
        console.error('[Sabay Storage Stream Error]:', streamErr);
        if (!res.headersSent) {
          res.redirect(302, DEFAULT_FALLBACK_IMAGE);
        }
      });
      stream.pipe(res);
    } catch (error: any) {
      console.error('[Sabay Storage General Error]:', error);
      if (!res.headersSent) {
        res.redirect(302, DEFAULT_FALLBACK_IMAGE);
      }
    }
  });

  // Upload image to Google Cloud Storage (雙模式：支援 multipart/form-data 二進位串流 與 JSON Base64 向下相容)
  app.post('/api/images/upload', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未授權存取：缺少有效安全憑證 (Unauthorized)' });
    }
    const token = authHeader.split('Bearer ')[1]?.trim();
    if (!token || !token.startsWith('st_')) {
      return res.status(401).json({ error: '安全憑證無效或已過期' });
    }

    try {
      const contentType = req.headers['content-type'] || '';
      const gcsBucket = ctx.getGcsBucket();

      // 模式 A：multipart/form-data (支援 busboy 二進位串流)
      if (contentType.includes('multipart/form-data')) {
        const bb = busboy({
          headers: req.headers,
          limits: { fileSize: 10 * 1024 * 1024, files: 1 }
        });

        let fileBuffer: Buffer | null = null;
        let rawFilename = `dish-${Date.now()}.jpg`;
        let targetFolder = 'dishes';
        let fileExceededLimit = false;
        let uploadStreamPromise: Promise<any> | null = null;

        bb.on('file', (_name, fileStream, info) => {
          rawFilename = info.filename || rawFilename;
          
          const { Transform } = require('stream');
          const magicByteChecker = new Transform({
            transform(chunk: Buffer, _encoding: any, callback: any) {
              if (!(this as any).checked) {
                (this as any).checked = true;
                const hex = chunk.toString('hex', 0, 12).toUpperCase();
                const isValid = hex.startsWith('FFD8') || hex.startsWith('89504E47') || 
                                hex.includes('57454250') || hex.includes('66747970') || hex.includes('61766966');
                if (!isValid) {
                  return callback(new Error('INVALID_MAGIC_BYTES'));
                }
              }
              callback(null, chunk);
            }
          });

          const chunks: Buffer[] = [];
          fileStream.on('limit', () => {
            fileExceededLimit = true;
          });

          uploadStreamPromise = new Promise((resolve, reject) => {
            fileStream
              .pipe(magicByteChecker)
              .on('data', (d: Buffer) => chunks.push(d))
              .on('error', (streamErr: any) => reject(streamErr))
              .on('end', () => {
                if (fileExceededLimit) {
                  return reject(new Error('FILE_TOO_LARGE'));
                }
                fileBuffer = Buffer.concat(chunks);
                resolve(fileBuffer);
              });
          });
        });

        bb.on('field', (name, val) => {
          if (name === 'folder' && typeof val === 'string') {
            targetFolder = val.replace(/[^a-zA-Z0-9_-]/g, '') || 'dishes';
          }
        });

        bb.on('finish', async () => {
          try {
            if (uploadStreamPromise) {
              await uploadStreamPromise;
            }

            if (!fileBuffer) {
              return res.status(400).json({ error: '未檢測到上傳檔案或檔案為空' });
            }

            const cleanFilename = rawFilename.replace(/[^a-zA-Z0-9._-]/g, '') || `dish-${Date.now()}.jpg`;
            const result = await processAndSaveImage(fileBuffer, targetFolder, cleanFilename, gcsBucket, true);
            return res.json(result);
          } catch (uploadErr: any) {
            if (uploadErr.message === 'FILE_TOO_LARGE') {
              return res.status(413).json({ error: '檔案過大：上傳圖片不得超過 10MB' });
            }
            if (uploadErr.message === 'INVALID_MAGIC_BYTES') {
              return res.status(400).json({ error: '檔案格式無效：僅支援 JPEG、PNG、WebP、AVIF 或 HEIC 格式圖片' });
            }
            console.error('[Sabay Busboy Stream Upload Error]:', uploadErr);
            return res.status(500).json({ error: '圖片串流解析處理失敗', details: uploadErr?.message });
          }
        });

        bb.on('error', (err: any) => {
          console.error('[Sabay Busboy Init Error]:', err);
          return res.status(500).json({ error: 'Failed to parse multipart upload', details: err?.message });
        });

        req.pipe(bb);
        return;
      }

      // 模式 B：JSON Base64 (向下相容備援)
      const validation = validateImageUploadPayload(req.body);
      if (!validation.isValid || !validation.sanitizedData) {
        return res.status(400).json({ error: validation.error || 'Missing or invalid image data' });
      }

      const { base64Clean, targetFolder, targetFilename: rawFilename } = validation.sanitizedData;
      const buffer = Buffer.from(base64Clean, 'base64');
      const result = await processAndSaveImage(buffer, targetFolder, rawFilename, gcsBucket, true);
      return res.json(result);
    } catch (error: any) {
      console.error('[Sabay Storage Upload Error]:', error);
      res.status(500).json({ error: 'Failed to upload image to storage', details: error?.message });
    }
  });
}
