"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAndSaveImage = processAndSaveImage;
const sharp_1 = __importDefault(require("sharp"));
async function processAndSaveImage(buffer, targetFolder, rawFilename, storageBucket = null, useLocalUrlPattern = false) {
    if (buffer.length > 10 * 1024 * 1024) {
        throw new Error('圖片大小超出 10MB 上限 (Max 10MB)');
    }
    try {
        const metadata = await (0, sharp_1.default)(buffer).metadata();
        const allowedFormats = ['jpeg', 'jpg', 'png', 'webp', 'avif', 'heif', 'gif', 'tiff'];
        if (!metadata.format || !allowedFormats.includes(metadata.format)) {
            throw new Error(`不支援的圖片格式: ${metadata.format || 'unknown'}`);
        }
    }
    catch (error) {
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
        (0, sharp_1.default)(buffer).resize(800, null, { withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(),
        (0, sharp_1.default)(buffer).resize(200, 200, { fit: 'cover' }).webp({ quality: 70 }).toBuffer(),
        (0, sharp_1.default)(buffer).resize(800, null, { withoutEnlargement: true }).avif({ quality: 75, effort: 4 }).toBuffer(),
        (0, sharp_1.default)(buffer).resize(200, 200, { fit: 'cover' }).avif({ quality: 65, effort: 4 }).toBuffer()
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
    }
    else {
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
//# sourceMappingURL=imageProcessing.js.map