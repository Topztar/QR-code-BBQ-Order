import { describe, it, expect } from 'vitest';
import '../server';
import { app } from '../src/server/init';
import { validateImageUploadPayload } from '../functions/src/validators';

describe('Image Upload Guardrail & Server Route Parity', () => {
  it('should have /api/images/upload route registered in local Express server', () => {
    const registeredRoutes: string[] = [];
    if (app._router && app._router.stack) {
      app._router.stack.forEach((middleware: any) => {
        if (middleware.route) {
          registeredRoutes.push(middleware.route.path);
        }
      });
    }

    expect(registeredRoutes).toContain('/api/images/upload');
  });

  it('Cloud Functions validateImageUploadPayload should properly reject invalid or empty payload', () => {
    const emptyResult = validateImageUploadPayload({});
    expect(emptyResult.isValid).toBe(false);
    expect(emptyResult.error).toContain('缺少圖片 base64 資料');

    const nullResult = validateImageUploadPayload(null);
    expect(nullResult.isValid).toBe(false);
  });

  it('Cloud Functions validateImageUploadPayload should sanitize valid base64 payload', () => {
    const mockPayload = {
      base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      filename: 'my-dish.png',
      folder: 'dishes'
    };
    const result = validateImageUploadPayload(mockPayload);
    expect(result.isValid).toBe(true);
    expect(result.sanitizedData?.cleanExt).toBe('png');
    expect(result.sanitizedData?.targetFolder).toBe('dishes');
    expect(result.sanitizedData?.targetFilename).toContain('my-dish');
  });

  it('should detect massive base64 image strings intended for guardrail interception', () => {
    const isBase64GuardrailTriggered = (image: string, isLocalPreviewOnly: boolean) => {
      if (isLocalPreviewOnly) return true;
      if (image && image.startsWith('data:image/') && image.length > 2048) return true;
      return false;
    };

    // Case 1: Normal Cloud Storage URL - should pass
    expect(isBase64GuardrailTriggered('https://firebasestorage.googleapis.com/v0/b/.../dish-123.webp', false)).toBe(false);

    // Case 2: External HTTP URL - should pass
    expect(isBase64GuardrailTriggered('https://images.unsplash.com/photo-123', false)).toBe(false);

    // Case 3: Local storage proxy URL - should pass
    expect(isBase64GuardrailTriggered('/api/images/dishes/dish-123.webp', false)).toBe(false);

    // Case 4: Massive Base64 String (ex: 10KB DataURL) - should be blocked by guardrail
    const fakeMassiveBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(5000);
    expect(isBase64GuardrailTriggered(fakeMassiveBase64, false)).toBe(true);

    // Case 5: Explicit local preview flag set - should be blocked by guardrail
    expect(isBase64GuardrailTriggered('data:image/jpeg;base64,short', true)).toBe(true);
  });
});
