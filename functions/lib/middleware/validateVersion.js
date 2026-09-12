"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateVersion = void 0;
const validateVersion = (req, res, next) => {
    const { version } = req.body;
    if (typeof version !== 'string' || !version.trim()) {
        return res.status(400).json({ error: '版本號必須為非空字串' });
    }
    const semver = /^v?\d+\.\d+\.\d+$/;
    if (!semver.test(version.trim())) {
        return res.status(400).json({ error: '版本號格式不正確，應為 X.Y.Z 或 vX.Y.Z' });
    }
    next();
};
exports.validateVersion = validateVersion;
//# sourceMappingURL=validateVersion.js.map