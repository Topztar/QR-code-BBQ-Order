// functions/src/middleware/validateVersion.ts
import { Request, Response, NextFunction } from 'express';

/**
 * Validate that req.body.version is a non‑empty string matching semver (e.g. "1.2.3" or "v1.2.3").
 */
export const validateVersion = (req: Request, res: Response, next: NextFunction) => {
  const { version } = req.body as { version?: unknown };
  if (typeof version !== 'string' || !version.trim()) {
    return res.status(400).json({ error: '版本號必須為非空字串' });
  }
  const semver = /^v?\d+\.\d+\.\d+$/;
  if (!semver.test(version.trim())) {
    return res.status(400).json({ error: '版本號格式不正確，應為 X.Y.Z 或 vX.Y.Z' });
  }
  next();
};
