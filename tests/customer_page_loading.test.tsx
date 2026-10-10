/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import App from '../src/App';

describe('Customer Mode Main Page Load', () => {
  it('renders CustomerOrderView on path / without throwing', async () => {
    window.history.pushState({}, '', '/');
    
    // Test with real fetch to localhost:3000
    const originalFetch = global.fetch;
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      let url = typeof input === 'string' ? input : input.toString();
      if (url.startsWith('/')) {
        url = `http://localhost:3000${url}`;
      }
      return originalFetch(url, init);
    };

    const { container } = render(<App />);
    
    // Wait for Suspense of CustomerOrderView to resolve
    await waitFor(() => {
      const mainEl = container.querySelector('main');
      const text = mainEl?.textContent || '';
      expect(text).not.toContain('載入中 Loading System...');
    }, { timeout: 4000 });
  });

  it('renders CustomerOrderView on /reserve path without throwing', async () => {
    window.history.pushState({}, '', '/reserve');
    const { container } = render(<App />);
    await waitFor(() => {
      const mainEl = container.querySelector('main');
      expect(mainEl?.textContent).not.toContain('載入中 Loading System...');
    }, { timeout: 4000 });
  });

  it('renders CustomerOrderView on /order path without throwing', async () => {
    window.history.pushState({}, '', '/order');
    const { container } = render(<App />);
    await waitFor(() => {
      const mainEl = container.querySelector('main');
      expect(mainEl?.textContent).not.toContain('載入中 Loading System...');
    }, { timeout: 4000 });
  });

  it('renders CustomerOrderView gracefully even when backend API returns 500', async () => {
    window.history.pushState({}, '', '/');
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));
    const { container } = render(<App />);
    await waitFor(() => {
      const mainEl = container.querySelector('main');
      expect(mainEl?.textContent).not.toContain('載入中 Loading System...');
    }, { timeout: 10000 });
  });
});
