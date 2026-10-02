import sharp from 'sharp';

export interface ProcessImageResult {
  success: boolean;
  url: string;
  thumbnailUrl: string;
  avifUrl: string;
  avifThumbnailUrl: string;
  path: string;
  thumbPath: string;
  avifPath: string;
  thumbAvifPath: string;
  filename: string;
  size: number;
  thumbSize: number;
  avifSize: number;
  thumbAvifSize: number;
  contentType: string;
}

export async function processAndSaveImage(
  buffer: Buffer,
  targetFolder: string,
  rawFilename: string,
  storageBucket: any | null = null,
  useLocalUrlPattern: boolean = false
): Promise<ProcessImageResult> {
  if (buffer.length > 10 * 1024 * 1024) {
    throw new Error('圖片大小超出 10MB 上限 (Max 10MB)');
  }

  // Format probe for magic-byte parity (QA-31 / QA-32)
  try {
    const metadata = await sharp(buffer).metadata();
    const allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'avif', 'heif', 'gif', 'tiff'];
    if (!metadata.format || !allowedFormats.includes(metadata.format)) {
      throw new Error(`不支援的圖片格式: ${metadata.format || 'unknown'}`);
    }
  } catch (error: any) {
    throw new Error(`圖片解析失敗或格式不支援: ${error.message}`);
  }

  const timestamp = Date.now();
  const nameWithoutExt = rawFilename.replace(/[^a-zA-Z0-9._-]/g, '').replace(/\.[^/.]+$/, '') || `img-${timestamp}`;
  const cleanFolder = targetFolder.replace(/[^a-zA-Z0-9_-]/g, '') || 'dishes';

  const versionedFilename = `${nameWithoutExt}-${timestamp}.webp`;
  const thumbFilename = `${nameWithoutExt}-${timestamp}-thumb.webp`;
  const avifFilename = `${nameWithoutExt}-${timestamp}.avif`;
  const thumbAvifFilename = `${nameWithoutExt}-${timestamp}-thumb.avif`;

  const targetPath = `${cleanFolder}/${versionedFilename}`;
  const thumbTargetPath = `${cleanFolder}/${thumbFilename}`;
  const avifTargetPath = `${cleanFolder}/${avifFilename}`;
  const thumbAvifTargetPath = `${cleanFolder}/${thumbAvifFilename}`;

  const [webpBuffer, thumbWebpBuffer, avifBuffer, thumbAvifBuffer] = await Promise.all([
    sharp(buffer).resize(800, null, { withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(),
    sharp(buffer).resize(200, 200, { fit: 'cover' }).webp({ quality: 70 }).toBuffer(),
    sharp(buffer).resize(800, null, { withoutEnlargement: true }).avif({ quality: 75, effort: 4 }).toBuffer(),
    sharp(buffer).resize(200, 200, { fit: 'cover' }).avif({ quality: 65, effort: 4 }).toBuffer()
  ]);

  if (storageBucket) {
    const webpMetadata = { contentType: 'image/webp', cacheControl: 'public, max-age=31536000, immutable' };
    const avifMetadata = { contentType: 'image/avif', cacheControl: 'public, max-age=31536000, immutable' };

    await Promise.all([
      storageBucket.file(targetPath).save(webpBuffer, { metadata: webpMetadata, resumable: false }),
      storageBucket.file(thumbTargetPath).save(thumbWebpBuffer, { metadata: webpMetadata, resumable: false }),
      storageBucket.file(avifTargetPath).save(avifBuffer, { metadata: avifMetadata, resumable: false }),
      storageBucket.file(thumbAvifTargetPath).save(thumbAvifBuffer, { metadata: avifMetadata, resumable: false })
    ]);

    const publicUrl = storageBucket.name ? `https://firebasestorage.googleapis.com/v0/b/${storageBucket.name}/o/${encodeURIComponent(targetPath)}?alt=media` : '';
    const publicThumbUrl = storageBucket.name ? `https://firebasestorage.googleapis.com/v0/b/${storageBucket.name}/o/${encodeURIComponent(thumbTargetPath)}?alt=media` : '';
    const publicAvifUrl = storageBucket.name ? `https://firebasestorage.googleapis.com/v0/b/${storageBucket.name}/o/${encodeURIComponent(avifTargetPath)}?alt=media` : '';
    const publicThumbAvifUrl = storageBucket.name ? `https://firebasestorage.googleapis.com/v0/b/${storageBucket.name}/o/${encodeURIComponent(thumbAvifTargetPath)}?alt=media` : '';

    return {
      success: true,
      url: useLocalUrlPattern ? `/api/images/${targetPath}` : publicUrl,
      thumbnailUrl: useLocalUrlPattern ? `/api/images/${thumbTargetPath}` : publicThumbUrl,
      avifUrl: useLocalUrlPattern ? `/api/images/${avifTargetPath}` : publicAvifUrl,
      avifThumbnailUrl: useLocalUrlPattern ? `/api/images/${thumbAvifTargetPath}` : publicThumbAvifUrl,
      path: targetPath,
      thumbPath: thumbTargetPath,
      avifPath: avifTargetPath,
      thumbAvifPath: thumbAvifTargetPath,
      filename: versionedFilename,
      size: webpBuffer.length,
      thumbSize: thumbWebpBuffer.length,
      avifSize: avifBuffer.length,
      thumbAvifSize: thumbAvifBuffer.length,
      contentType: 'image/webp'
    };
  } else {
    // Local fallback when GCS is not configured
    return {
      success: true,
      url: `data:image/webp;base64,${webpBuffer.toString('base64')}`,
      thumbnailUrl: `data:image/webp;base64,${thumbWebpBuffer.toString('base64')}`,
      avifUrl: `data:image/avif;base64,${avifBuffer.toString('base64')}`,
      avifThumbnailUrl: `data:image/avif;base64,${thumbAvifBuffer.toString('base64')}`,
      path: targetPath,
      thumbPath: thumbTargetPath,
      avifPath: avifTargetPath,
      thumbAvifPath: thumbAvifTargetPath,
      filename: versionedFilename,
      size: webpBuffer.length,
      thumbSize: thumbWebpBuffer.length,
      avifSize: avifBuffer.length,
      thumbAvifSize: thumbAvifBuffer.length,
      contentType: 'image/webp'
    };
  }
}
