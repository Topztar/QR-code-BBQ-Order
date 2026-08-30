import { describe, it, expect, vi } from 'vitest';
import { processAndSaveImage } from '../functions/src/routes/menu';
import { validateImageUploadPayload } from '../functions/src/validators';
import sharp from 'sharp';

describe('Image Upload & Processing Logic', () => {
  const BUCKET_NAME = 'sabay-bbq-order.firebasestorage.app';

  describe('processAndSaveImage', () => {
    it('throws an error if buffer exceeds 10MB', async () => {
      const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024);
      const mockBucket: any = { name: BUCKET_NAME };

      await expect(
        processAndSaveImage(oversizedBuffer, 'dishes', 'test.jpg', mockBucket)
      ).rejects.toThrow('圖片大小超出 10MB 上限 (Max 10MB)');
    });

    it('processes image buffer with sharp and saves to Cloud Storage bucket', async () => {
      // Create a 100x100 test PNG image buffer using sharp
      const testBuffer = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 4,
          background: { r: 255, g: 0, b: 0, alpha: 1 }
        }
      }).png().toBuffer();

      const mockSave = vi.fn().mockResolvedValue([{}]);
      const mockFile = vi.fn().mockReturnValue({ save: mockSave });
      const mockBucket: any = {
        name: BUCKET_NAME,
        file: mockFile
      };

      const result = await processAndSaveImage(testBuffer, 'dishes', 'dish-beef.png', mockBucket);

      expect(result.success).toBe(true);
      expect(result.contentType).toBe('image/webp');
      expect(result.filename).toMatch(/^dish-beef-\d+\.webp$/);
      expect(result.path).toMatch(/^dishes\/dish-beef-\d+\.webp$/);
      expect(result.thumbPath).toMatch(/^dishes\/dish-beef-\d+-thumb\.webp$/);
      expect(result.avifPath).toMatch(/^dishes\/dish-beef-\d+\.avif$/);
      expect(result.thumbAvifPath).toMatch(/^dishes\/dish-beef-\d+-thumb\.avif$/);

      expect(result.url).toContain(`https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/dishes%2F`);
      expect(result.thumbnailUrl).toContain(`https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/dishes%2F`);
      expect(result.thumbnailUrl).toContain('-thumb.webp');
      expect(result.avifUrl).toContain('.avif');
      expect(result.avifThumbnailUrl).toContain('-thumb.avif');

      expect(result.size).toBeGreaterThan(0);
      expect(result.thumbSize).toBeGreaterThan(0);
      expect(result.avifSize).toBeGreaterThan(0);
      expect(result.thumbAvifSize).toBeGreaterThan(0);

      expect(mockFile).toHaveBeenCalledWith(result.path);
      expect(mockFile).toHaveBeenCalledWith(result.thumbPath);
      expect(mockFile).toHaveBeenCalledWith(result.avifPath);
      expect(mockFile).toHaveBeenCalledWith(result.thumbAvifPath);
      expect(mockSave).toHaveBeenCalledTimes(4);
    });

    it('sanitizes target folder and removes special characters', async () => {
      const testBuffer = await sharp({
        create: {
          width: 50,
          height: 50,
          channels: 3,
          background: { r: 0, g: 255, b: 0 }
        }
      }).jpeg().toBuffer();

      const mockSave = vi.fn().mockResolvedValue([{}]);
      const mockFile = vi.fn().mockReturnValue({ save: mockSave });
      const mockBucket: any = {
        name: BUCKET_NAME,
        file: mockFile
      };

      const result = await processAndSaveImage(testBuffer, '../unsafe/folder!@#', 'sample.jpg', mockBucket);

      expect(result.path).not.toContain('..');
      expect(result.path).toMatch(/^unsafefolder\/sample-\d+\.webp$/);
    });
  });

  describe('validateImageUploadPayload (Base64 Mode)', () => {
    it('validates a valid Base64 payload', () => {
      const payload = {
        base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        filename: 'test-dish.png',
        folder: 'dishes'
      };

      const result = validateImageUploadPayload(payload);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedData?.targetFolder).toBe('dishes');
      expect(result.sanitizedData?.cleanExt).toBe('png');
    });

    it('rejects invalid or unsupported MIME types', () => {
      const payload = {
        base64: 'data:text/plain;base64,SGVsbG8gV29ybGQ=',
        filename: 'test.txt'
      };

      const result = validateImageUploadPayload(payload);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('不支援的圖片格式');
    });

    it('rejects missing image data', () => {
      const result = validateImageUploadPayload({});
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('缺少圖片 base64 資料');
    });
  });
});
