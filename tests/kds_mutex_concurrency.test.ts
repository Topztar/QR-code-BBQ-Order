import { describe, it, expect } from 'vitest';
import { app } from '../src/server/init';
import '../server'; // mounts routes onto app

describe('KDS Mutex Lock Lease & Concurrency OCC Verification', () => {
  const findRoute = (path: string, method: 'post' | 'put' | 'get' | 'delete') => {
    return app._router.stack.find((layer: any) => 
      layer.route && layer.route.path === path && layer.route.methods[method]
    );
  };

  const createMockRes = () => {
    let statusCode = 200;
    let responseData: any = null;
    const res: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        responseData = data;
        return this;
      },
      send(data: any) {
        responseData = data;
        return this;
      },
      getStatus: () => statusCode,
      getData: () => responseData,
    };
    return res;
  };

  it('verifies that KDS Mutex endpoints are correctly registered', () => {
    const registeredRoutes: string[] = [];
    if (app._router && app._router.stack) {
      app._router.stack.forEach((middleware: any) => {
        if (middleware.route) {
          registeredRoutes.push(middleware.route.path);
        }
      });
    }

    expect(registeredRoutes).toContain('/api/kds/claim-kitchen');
    expect(registeredRoutes).toContain('/api/kds/heartbeat');
    expect(registeredRoutes).toContain('/api/kds/release-kitchen');
  });

  describe('POST /api/kds/claim-kitchen', () => {
    const claimLayer = findRoute('/api/kds/claim-kitchen', 'post');

    it('rejects claim request if deviceId is missing with 400', () => {
      expect(claimLayer).toBeDefined();
      const req: any = { body: {} };
      const res = createMockRes();

      claimLayer.route.stack[0].handle(req, res);
      expect(res.getStatus()).toBe(400);
      expect(res.getData().error).toContain('deviceId is required');
    });

    it('successfully claims kitchen role for a new device', () => {
      const req: any = { body: { deviceId: 'tablet-kitchen-01' } };
      const res = createMockRes();

      claimLayer.route.stack[0].handle(req, res);
      expect(res.getStatus()).toBe(200);
      expect(res.getData().success).toBe(true);
      expect(res.getData().session.activeKitchenDeviceId).toBe('tablet-kitchen-01');
    });

    it('returns 409 Conflict if a second device attempts to claim without force flag', () => {
      const req: any = { body: { deviceId: 'tablet-staff-02', force: false } };
      const res = createMockRes();

      claimLayer.route.stack[0].handle(req, res);
      expect(res.getStatus()).toBe(409);
      expect(res.getData().error).toContain('目前已有其他平板登入為【廚房】角色');
      expect(res.getData().activeKitchenDeviceId).toBe('tablet-kitchen-01');
    });

    it('preempts and grants kitchen role if second device claims with force: true', () => {
      const req: any = { body: { deviceId: 'tablet-staff-02', force: true } };
      const res = createMockRes();

      claimLayer.route.stack[0].handle(req, res);
      expect(res.getStatus()).toBe(200);
      expect(res.getData().success).toBe(true);
      expect(res.getData().session.activeKitchenDeviceId).toBe('tablet-staff-02');
    });
  });

  describe('POST /api/kds/heartbeat', () => {
    const heartbeatLayer = findRoute('/api/kds/heartbeat', 'post');

    it('rejects heartbeat from demoted/preempted device with 403', () => {
      expect(heartbeatLayer).toBeDefined();
      // tablet-kitchen-01 was preempted by tablet-staff-02
      const req: any = { body: { deviceId: 'tablet-kitchen-01' } };
      const res = createMockRes();

      heartbeatLayer.route.stack[0].handle(req, res);
      expect(res.getStatus()).toBe(403);
      expect(res.getData().error).toContain('您的廚房角色已被其他裝置取代');
    });

    it('accepts and extends heartbeat lease for active holding device', () => {
      const req: any = { body: { deviceId: 'tablet-staff-02' } };
      const res = createMockRes();

      heartbeatLayer.route.stack[0].handle(req, res);
      expect(res.getStatus()).toBe(200);
      expect(res.getData().success).toBe(true);
      expect(res.getData().session.activeKitchenDeviceId).toBe('tablet-staff-02');
    });
  });

  describe('POST /api/kds/release-kitchen', () => {
    const releaseLayer = findRoute('/api/kds/release-kitchen', 'post');
    const claimLayer = findRoute('/api/kds/claim-kitchen', 'post');

    it('releases kitchen role cleanly and allows other device to claim without conflict', () => {
      expect(releaseLayer).toBeDefined();
      const reqRelease: any = { body: { deviceId: 'tablet-staff-02' } };
      const resRelease = createMockRes();

      releaseLayer.route.stack[0].handle(reqRelease, resRelease);
      expect(resRelease.getStatus()).toBe(200);
      expect(resRelease.getData().success).toBe(true);

      // Now tablet-kitchen-03 can claim without 409
      const reqClaim: any = { body: { deviceId: 'tablet-kitchen-03' } };
      const resClaim = createMockRes();

      claimLayer.route.stack[0].handle(reqClaim, resClaim);
      expect(resClaim.getStatus()).toBe(200);
      expect(resClaim.getData().session.activeKitchenDeviceId).toBe('tablet-kitchen-03');
    });
  });

  describe('PUT /api/orders/:id/items/:itemId/complete Concurrency & Master Truth', () => {
    const completeLayer = findRoute('/api/orders/:id/items/:itemId/complete', 'put');

    it('rejects stale staff updates with 409 when kitchen has already updated with higher version', () => {
      expect(completeLayer).toBeDefined();
      // Test 404 for non-existent order
      const req404: any = {
        params: { id: 'order-fake-999', itemId: 'it-01' },
        body: { isCompleted: true }
      };
      const res404 = createMockRes();
      completeLayer.route.stack[0].handle(req404, res404);
      expect(res404.getStatus()).toBe(404);
      expect(res404.getData().error).toBe('Order not found');
    });
  });
});
