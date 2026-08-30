import { describe, it, expect, vi } from 'vitest';
import { extractStoragePathFromUrl, cleanupStorageImage } from '../functions/src/helpers';

describe('Cloud Storage Cleanup Helpers', () => {
  const BUCKET_NAME = 'sabay-bbq-order.firebasestorage.app';

  describe('extractStoragePathFromUrl', () => {
    it('correctly extracts encoded path from Firebase Storage URL', () => {
      const url = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/dishes%2Fdish-1725000000000.webp?alt=media`;
      const result = extractStoragePathFromUrl(url, BUCKET_NAME);
      expect(result).toBe('dishes/dish-1725000000000.webp');
    });

    it('correctly extracts path from Google Cloud Storage standard URL', () => {
      const url = `https://storage.googleapis.com/${BUCKET_NAME}/dishes/dish-sample.webp`;
      const result = extractStoragePathFromUrl(url, BUCKET_NAME);
      expect(result).toBe('dishes/dish-sample.webp');
    });

    it('returns null for external CDN URLs (e.g. Unsplash)', () => {
      const url = 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600';
      const result = extractStoragePathFromUrl(url, BUCKET_NAME);
      expect(result).toBeNull();
    });

    it('returns null for Base64 Data URLs', () => {
      const url = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD...';
      const result = extractStoragePathFromUrl(url, BUCKET_NAME);
      expect(result).toBeNull();
    });

    it('returns null if the bucket name does not match', () => {
      const url = 'https://firebasestorage.googleapis.com/v0/b/other-project.firebasestorage.app/o/dishes%2Fdish.webp?alt=media';
      const result = extractStoragePathFromUrl(url, BUCKET_NAME);
      expect(result).toBeNull();
    });

    it('handles empty or non-string inputs safely', () => {
      expect(extractStoragePathFromUrl(undefined, BUCKET_NAME)).toBeNull();
      expect(extractStoragePathFromUrl('', BUCKET_NAME)).toBeNull();
      expect(extractStoragePathFromUrl(null as any, BUCKET_NAME)).toBeNull();
    });
  });

  describe('cleanupStorageImage', () => {
    it('deletes image when given a valid dishes/ storage URL', async () => {
      const mockDelete = vi.fn().mockResolvedValue([{}]);
      const mockFile = vi.fn().mockReturnValue({ delete: mockDelete });
      const mockBucket = {
        name: BUCKET_NAME,
        file: mockFile
      };

      const url = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/dishes%2Fdish-test-123.webp?alt=media`;
      const success = await cleanupStorageImage(url, mockBucket);

      expect(success).toBe(true);
      expect(mockFile).toHaveBeenCalledWith('dishes/dish-test-123.webp');
      expect(mockDelete).toHaveBeenCalledWith({ ignoreNotFound: true });
    });

    it('safely ignores and skips non-dishes path to prevent unintended file deletion', async () => {
      const mockDelete = vi.fn().mockResolvedValue([{}]);
      const mockFile = vi.fn().mockReturnValue({ delete: mockDelete });
      const mockBucket = {
        name: BUCKET_NAME,
        file: mockFile
      };

      const url = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/system%2Fconfig.json?alt=media`;
      const success = await cleanupStorageImage(url, mockBucket);

      expect(success).toBe(false);
      expect(mockFile).not.toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('safely skips external URLs without invoking storage file delete', async () => {
      const mockDelete = vi.fn();
      const mockFile = vi.fn().mockReturnValue({ delete: mockDelete });
      const mockBucket = {
        name: BUCKET_NAME,
        file: mockFile
      };

      const url = 'https://images.unsplash.com/photo-12345';
      const success = await cleanupStorageImage(url, mockBucket);

      expect(success).toBe(false);
      expect(mockFile).not.toHaveBeenCalled();
      expect(mockDelete).not.toHaveBeenCalled();
    });

    it('handles delete errors gracefully without throwing unhandled exceptions', async () => {
      const mockDelete = vi.fn().mockRejectedValue(new Error('Network error or permission denied'));
      const mockFile = vi.fn().mockReturnValue({ delete: mockDelete });
      const mockBucket = {
        name: BUCKET_NAME,
        file: mockFile
      };

      const url = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/dishes%2Fdish-error-test.webp?alt=media`;
      const success = await cleanupStorageImage(url, mockBucket);

      expect(success).toBe(false);
      expect(mockFile).toHaveBeenCalledWith('dishes/dish-error-test.webp');
      expect(mockDelete).toHaveBeenCalledWith({ ignoreNotFound: true });
    });
  });
});
