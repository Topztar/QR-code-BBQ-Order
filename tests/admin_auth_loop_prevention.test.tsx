/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import { apiFetch } from '../src/lib/api';
import { sessionAuth } from '../src/lib/sessionAuth';
import { StaffLoginGate } from '../src/components/StaffLoginGate';

describe('Admin Auth Infinite Loop Prevention Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('apiFetch 401 vs 403 Status Differentiation', () => {
    it('dispatches sabay_auth_expired and purges tokens on 401 Unauthorized', async () => {
      sessionAuth.setToken('expired-staff-token');
      expect(sessionAuth.isAuthenticated()).toBe(true);

      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }));

      const res = await apiFetch('/api/menu/reorder', { method: 'PUT', body: JSON.stringify({ order: [] }) });
      expect(res.status).toBe(401);

      // Verify token purge
      expect(localStorage.getItem('sabay_jwt_token')).toBeNull();
      expect(localStorage.getItem('sabay-staff-auth')).toBeNull();
      expect(sessionStorage.getItem('staff_token')).toBeNull();
      expect(sessionAuth.isAuthenticated()).toBe(false);

      // Verify sabay_auth_expired dispatched
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'sabay_auth_expired',
          detail: { url: '/api/menu/reorder', status: 401 }
        })
      );
    });

    it('does NOT purge tokens and does NOT dispatch sabay_auth_expired on 403 Forbidden', async () => {
      sessionAuth.setToken('valid-staff-token');
      expect(sessionAuth.isAuthenticated()).toBe(true);

      const dispatchSpy = vi.spyOn(window, 'dispatchEvent');
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }));

      const res = await apiFetch('/api/menu/dish-1', { method: 'DELETE' });
      expect(res.status).toBe(403);

      // Verify token is PRESERVED to prevent infinite loop
      expect(localStorage.getItem('sabay_jwt_token')).toBe('valid-staff-token');
      expect(sessionAuth.isAuthenticated()).toBe(true);

      // Verify sabay_auth_expired was NOT emitted
      const authExpiredCalls = dispatchSpy.mock.calls.filter(call => call[0]?.type === 'sabay_auth_expired');
      expect(authExpiredCalls.length).toBe(0);
    });

    it('skips Authorization header on public GET endpoints by default', async () => {
      sessionAuth.setToken('stale-token');
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));

      await apiFetch('/api/bootstrap');
      expect(fetchSpy).toHaveBeenCalled();
      const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers['Authorization']).toBeUndefined();
    });
  });

  describe('sessionAuth Storage Synchronization & Purging', () => {
    it('purges credentials across both localStorage and sessionStorage on clear()', () => {
      sessionAuth.setToken('test-token-xyz');
      expect(sessionAuth.isAuthenticated()).toBe(true);
      expect(sessionStorage.getItem('staff_token')).toBe('test-token-xyz');

      sessionAuth.clear();
      expect(localStorage.getItem('sabay_jwt_token')).toBeNull();
      expect(localStorage.getItem('sabay-staff-auth')).toBeNull();
      expect(sessionStorage.getItem('staff_token')).toBeNull();
      expect(sessionStorage.getItem('sabay-staff-auth')).toBeNull();
      expect(sessionAuth.isAuthenticated()).toBe(false);
    });
  });

  describe('StaffLoginGate Protection & Loop Severing', () => {
    it('clears residual tokens on mount to block silent auto-reauthentication', () => {
      sessionAuth.setToken('lingering-stale-token');
      expect(sessionAuth.isAuthenticated()).toBe(true);

      render(<StaffLoginGate onLoginSuccess={vi.fn()} onCancel={vi.fn()} />);

      // On mount, any residual tokens should be completely purged
      expect(sessionAuth.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('sabay_jwt_token')).toBeNull();
      expect(sessionStorage.getItem('staff_token')).toBeNull();
    });

    it('blocks submission until physical manual interaction occurs on pinpad', () => {
      const onLoginSuccess = vi.fn();
      render(<StaffLoginGate onLoginSuccess={onLoginSuccess} onCancel={vi.fn()} />);

      const submitButton = document.getElementById('pin-submit-button') as HTMLButtonElement;
      expect(submitButton.disabled).toBe(true);

      // Enter 6 digits by clicking buttons
      for (let i = 1; i <= 6; i++) {
        const numBtn = document.getElementById(`pinpad-${i}`) as HTMLButtonElement;
        fireEvent.click(numBtn);
      }

      // Now button should become enabled
      expect(submitButton.disabled).toBe(false);
    });

    it('navigates back using replaceState to avoid browser history overflow', () => {
      const onCancel = vi.fn();
      const replaceSpy = vi.spyOn(window.history, 'replaceState');

      render(<StaffLoginGate onLoginSuccess={vi.fn()} onCancel={onCancel} />);

      const returnBtn = document.getElementById('staff-gate-return-btn') as HTMLButtonElement;
      fireEvent.click(returnBtn);

      expect(replaceSpy).toHaveBeenCalledWith({}, '', '/');
      expect(onCancel).toHaveBeenCalled();
    });

    it('activates cooldown circuit breaker when rapid auth expiry events occur', () => {
      render(<StaffLoginGate onLoginSuccess={vi.fn()} onCancel={vi.fn()} />);

      // Dispatch 3 rapid auth expired events
      act(() => {
        window.dispatchEvent(new CustomEvent('sabay_auth_expired', { detail: { status: 401 } }));
        window.dispatchEvent(new CustomEvent('sabay_auth_expired', { detail: { status: 401 } }));
        window.dispatchEvent(new CustomEvent('sabay_auth_expired', { detail: { status: 401 } }));
      });

      expect(screen.getByText(/驗證重試過於頻繁，系統保護中/i)).toBeTruthy();
      const submitButton = document.getElementById('pin-submit-button') as HTMLButtonElement;
      expect(submitButton.disabled).toBe(true);
    });
  });
});
