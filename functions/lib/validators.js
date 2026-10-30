"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateReservationCapacityAndHoarding = exports.findOptimalTableCombination = exports.getTableCapacity = void 0;
exports.sanitizeString = sanitizeString;
exports.validateOrderPayload = validateOrderPayload;
exports.validateReservationPayload = validateReservationPayload;
exports.validateImageUploadPayload = validateImageUploadPayload;
exports.validateRatingPayload = validateRatingPayload;
exports.validateCheckoutPayload = validateCheckoutPayload;
exports.validateMenuItemPayload = validateMenuItemPayload;
exports.applyInventoryLinkage = applyInventoryLinkage;
var shared_1 = require("@sabay/shared");
Object.defineProperty(exports, "getTableCapacity", { enumerable: true, get: function () { return shared_1.getTableCapacity; } });
Object.defineProperty(exports, "findOptimalTableCombination", { enumerable: true, get: function () { return shared_1.findOptimalTableCombination; } });
Object.defineProperty(exports, "validateReservationCapacityAndHoarding", { enumerable: true, get: function () { return shared_1.validateReservationCapacityAndHoarding; } });
function sanitizeString(input, maxLength = 255) {
    if (input === null || input === undefined)
        return '';
    const str = String(input).trim();
    const clean = str.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '');
    return clean.slice(0, maxLength);
}
function validateOrderPayload(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return { isValid: false, error: '無效的訂單資料格式 (Invalid JSON payload)' };
    }
    const tableNumber = sanitizeString(body.tableNumber, 50);
    if (!tableNumber) {
        return { isValid: false, error: '請指定有效的桌號或外帶識別 (Missing tableNumber)' };
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
        return { isValid: false, error: '購物車內無有效餐點項目 (Empty items list)' };
    }
    if (body.items.length > 200) {
        return { isValid: false, error: '單筆訂單品項數量超出上限 (Items limit exceeded: max 200)' };
    }
    const sanitizedItems = [];
    for (let i = 0; i < body.items.length; i++) {
        const item = body.items[i];
        if (!item || typeof item !== 'object') {
            return { isValid: false, error: `第 ${i + 1} 項餐點格式錯誤 (Invalid item object)` };
        }
        const name = typeof item.name === 'object' && item.name !== null
            ? item.name
            : sanitizeString(item.name || '', 100);
        const qty = Number(item.qty);
        if (!Number.isFinite(qty) || qty <= 0 || !Number.isInteger(qty) || qty > 1000) {
            return { isValid: false, error: `餐點數量異常 (Invalid quantity: ${qty})` };
        }
        const price = Number(item.price);
        if (!Number.isFinite(price) || price < -1000000 || price > 1000000) {
            return { isValid: false, error: `餐點金額異常 (Invalid price: ${price})` };
        }
        sanitizedItems.push({
            ...item,
            name,
            qty,
            price
        });
    }
    let sanitizedTakeoutInfo = undefined;
    if (body.takeoutInfo && typeof body.takeoutInfo === 'object') {
        const rawPickupTime = sanitizeString(body.takeoutInfo.pickupTime || '', 10);
        if (rawPickupTime && !/^\d{1,2}:\d{2}$/.test(rawPickupTime)) {
            return { isValid: false, error: '預計取餐時間格式不正確，請使用 HH:mm (Invalid pickup time format)' };
        }
        sanitizedTakeoutInfo = {
            customerName: sanitizeString(body.takeoutInfo.customerName || '', 50),
            phone: sanitizeString(body.takeoutInfo.phone || '', 30),
            pickupTime: rawPickupTime || undefined
        };
    }
    const sanitizedOrder = {
        tableNumber,
        items: sanitizedItems,
        customerName: sanitizeString(body.customerName || '', 50),
        customerPhone: sanitizeString(body.customerPhone || body.phone || '', 30),
        customerAvatar: sanitizeString(body.customerAvatar || '', 255) || undefined,
        paymentMethod: ['cash', 'credit', 'member', 'twqr'].includes(body.paymentMethod) ? body.paymentMethod : 'cash',
        guestCount: (typeof body.guestCount === 'number' && Number.isFinite(body.guestCount) && body.guestCount > 0) ? Math.min(Math.floor(body.guestCount), 100) : undefined,
        notes: sanitizeString(body.notes || '', 500),
        source: sanitizeString(body.source || 'direct', 50),
        utm_medium: sanitizeString(body.utm_medium || '', 50) || undefined,
        takeoutInfo: sanitizedTakeoutInfo,
        clientOrderId: sanitizeString(body.clientOrderId || '', 100) || undefined,
        reservationNo: sanitizeString(body.reservationNo || '', 50) || undefined,
        reservationDate: sanitizeString(body.reservationDate || '', 20) || undefined,
        reservationTime: sanitizeString(body.reservationTime || '', 20) || undefined,
        isMember: Boolean(body.isMember),
        notificationSent: false
    };
    return { isValid: true, sanitizedData: sanitizedOrder };
}
function validateReservationPayload(body) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return { isValid: false, error: '無效的預約資料格式 (Invalid JSON payload)' };
    }
    const customerName = sanitizeString(body.customerName, 50);
    if (!customerName || customerName.length < 1) {
        return { isValid: false, error: '請輸入有效的預約聯絡人姓名 (Missing customerName)' };
    }
    const phone = sanitizeString(body.phone, 30);
    const phoneDigits = phone.replace(/\D/g, '').slice(0, 10);
    const isMobile = /^09\d{8}$/.test(phoneDigits);
    const isLandline = /^0[2-8]\d{7,8}$/.test(phoneDigits);
    if (!phone || (!isMobile && !isLandline)) {
        return { isValid: false, error: '請輸入有效的台灣電話號碼：手機需為10位數（09開頭），市話需為9至10位數（02~08開頭）' };
    }
    const guestCount = Number(body.guestCount);
    if (!Number.isFinite(guestCount) || guestCount < 1 || guestCount > 100 || !Number.isInteger(guestCount)) {
        return { isValid: false, error: '預約人數必須為 1 至 100 之間的整數 (Invalid guestCount)' };
    }
    const date = sanitizeString(body.date, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return { isValid: false, error: '預約日期格式不正確，請使用 YYYY-MM-DD (Invalid date format)' };
    }
    const time = sanitizeString(body.time, 10);
    if (!time || !/^\d{1,2}:\d{2}/.test(time)) {
        return { isValid: false, error: '預約時段格式不正確 (Invalid time format)' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date + 'T00:00:00');
    if (isNaN(targetDate.getTime())) {
        return { isValid: false, error: '無效的預約日期 (Invalid date)' };
    }
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 3);
    if (targetDate > maxDate) {
        const maxDateStr = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`;
        return { isValid: false, error: `預約日期最多只能提前 3 個月 (最晚至 ${maxDateStr})` };
    }
    const sanitizedReservation = {
        ...body,
        customerName,
        phone,
        guestCount,
        date,
        time,
        notes: sanitizeString(body.notes || '', 300),
        source: sanitizeString(body.source || 'direct', 50),
        utm_medium: sanitizeString(body.utm_medium || '', 50),
        notificationSent: false
    };
    return { isValid: true, sanitizedData: sanitizedReservation };
}
function validateImageUploadPayload(body) {
    if (!body || typeof body !== 'object') {
        return { isValid: false, error: '無效的圖片上傳請求 (Invalid body)' };
    }
    const rawData = body.base64 || body.data;
    if (!rawData || typeof rawData !== 'string') {
        return { isValid: false, error: '缺少圖片 base64 資料 (Missing image base64 data)' };
    }
    let mime = body.contentType || 'image/jpeg';
    let base64Clean = rawData;
    if (rawData.includes(';base64,')) {
        const parts = rawData.split(';base64,');
        const mimeMatch = parts[0].match(/data:(.*?)$/);
        if (mimeMatch)
            mime = mimeMatch[1];
        base64Clean = parts[1];
    }
    let sniffedMime = '';
    if (base64Clean.startsWith('/9j/'))
        sniffedMime = 'image/jpeg';
    else if (base64Clean.startsWith('iVBORw0KGgo'))
        sniffedMime = 'image/png';
    else if (base64Clean.startsWith('R0lGODlh'))
        sniffedMime = 'image/gif';
    else if (base64Clean.startsWith('UklGR'))
        sniffedMime = 'image/webp';
    if (sniffedMime) {
        mime = sniffedMime;
    }
    else {
        return { isValid: false, error: '檔案格式錯誤：無法辨識的圖片魔術字節' };
    }
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(mime)) {
        return { isValid: false, error: `不支援的圖片格式 (${mime})，僅允許 JPEG, PNG, WEBP, GIF` };
    }
    const extMap = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif'
    };
    const cleanExt = extMap[mime] || 'jpg';
    const rawFolder = sanitizeString(body.folder || 'dishes', 50);
    const targetFolder = rawFolder.replace(/[^a-zA-Z0-9_-]/g, '') || 'dishes';
    const rawFilename = sanitizeString(body.filename || '', 100);
    let targetFilename = rawFilename
        ? rawFilename.replace(/[^a-zA-Z0-9._-]/g, '')
        : `dish-${Date.now()}.${cleanExt}`;
    targetFilename = targetFilename.replace(/-+\./g, '.').replace(/\.+/g, '.').replace(/^-+|-+$/g, '');
    if (!targetFilename.includes('.')) {
        targetFilename = `${targetFilename}.${cleanExt}`;
    }
    return {
        isValid: true,
        sanitizedData: {
            base64Clean,
            mime,
            cleanExt,
            targetFolder,
            targetFilename
        }
    };
}
function validateRatingPayload(body) {
    if (!body || typeof body !== 'object') {
        return { isValid: false, error: '無效的評價資料格式 (Invalid rating payload)' };
    }
    const ratingNum = Number(body.rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        return { isValid: false, error: '評分星級必須為 1 到 5 之間的整數 (Rating must be 1-5)' };
    }
    const feedback = sanitizeString(body.feedback || '', 500);
    return {
        isValid: true,
        sanitizedData: {
            rating: ratingNum,
            feedback
        }
    };
}
function validateCheckoutPayload(body) {
    if (!body || typeof body !== 'object') {
        return { isValid: false, error: '無效的結帳資料格式' };
    }
    const paymentMethod = typeof body.paymentMethod === 'string' ? body.paymentMethod : 'cash';
    const cashTendered = Number(body.cashTendered) || 0;
    const changeAmount = Number(body.changeAmount) || 0;
    if (cashTendered < 0 || changeAmount < 0) {
        return { isValid: false, error: '金額不能為負數' };
    }
    const checkoutRecord = body.checkoutRecord && typeof body.checkoutRecord === 'object'
        ? body.checkoutRecord
        : null;
    return {
        isValid: true,
        sanitizedData: {
            paymentMethod,
            cashTendered,
            changeAmount,
            checkoutRecord
        }
    };
}
const MENU_BOOLEAN_FLAGS = [
    'isSetMeal', 'requiredSaucesOption', 'hasNoodlesOption', 'hasCoconutsMilkOption',
    'containsBeef', 'containsPork', 'containsSeafood', 'isNotSpicy'
];
const MENU_IMAGE_FIELDS = ['image', 'thumbnailUrl', 'avifUrl', 'avifThumbnailUrl'];
const VALID_SOLD_OUT_TYPES = ['none', 'daily', 'permanent'];
function sanitizeLocalizedText(value, maxLen) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const out = {};
        for (const [k, v] of Object.entries(value)) {
            out[k] = sanitizeString(v, maxLen);
        }
        return out;
    }
    if (typeof value === 'string') {
        return { zh: sanitizeString(value, maxLen) };
    }
    return { zh: '' };
}
function validateMenuItemPayload(body, options = {}) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return { isValid: false, error: '無效的菜單資料格式 (Invalid JSON payload)' };
    }
    const isUpdate = options.mode === 'update';
    const has = (key) => body[key] !== undefined;
    const out = {};
    if (!isUpdate || has('name'))
        out.name = sanitizeLocalizedText(body.name, 100);
    if (!isUpdate || has('description'))
        out.description = sanitizeLocalizedText(body.description, 500);
    if (!isUpdate || has('price')) {
        const priceNum = Number(body.price);
        if (body.price === null || !Number.isFinite(priceNum) || priceNum < -1000000 || priceNum > 1000000) {
            return { isValid: false, error: `無效的餐點定價 (Invalid price: ${body.price})` };
        }
        out.price = priceNum;
    }
    if (!isUpdate || has('category'))
        out.category = sanitizeString(body.category || 'skewers', 50);
    for (const field of MENU_IMAGE_FIELDS) {
        if (!isUpdate || has(field)) {
            out[field] = typeof body[field] === 'string' ? sanitizeString(body[field], 2048) : '';
        }
    }
    if (!isUpdate || has('trackInventory'))
        out.trackInventory = Boolean(body.trackInventory);
    if (out.trackInventory === false) {
        out.inventoryCount = null;
    }
    else if (has('inventoryCount') && body.inventoryCount !== null && body.inventoryCount !== '') {
        const parsed = Number(body.inventoryCount);
        out.inventoryCount = Number.isFinite(parsed) ? Math.round(parsed) : 0;
    }
    else if (out.trackInventory === true && (!isUpdate || body.inventoryCount === null || body.inventoryCount === '')) {
        out.inventoryCount = 0;
    }
    else if (!isUpdate) {
        out.inventoryCount = null;
    }
    if (!isUpdate || has('available'))
        out.available = has('available') ? Boolean(body.available) : true;
    if (!isUpdate || has('soldOutType')) {
        out.soldOutType = VALID_SOLD_OUT_TYPES.includes(body.soldOutType)
            ? body.soldOutType
            : (out.available === false ? 'permanent' : 'none');
    }
    if (!isUpdate || has('soldOutDate'))
        out.soldOutDate = body.soldOutDate ? sanitizeString(body.soldOutDate, 20) : null;
    if (!isUpdate || has('soldOutAt'))
        out.soldOutAt = body.soldOutAt ? sanitizeString(body.soldOutAt, 50) : null;
    if (has('stockStatus'))
        out.stockStatus = body.stockStatus === 'SOLD_OUT' ? 'SOLD_OUT' : 'AVAILABLE';
    for (const flag of MENU_BOOLEAN_FLAGS) {
        if (!isUpdate || has(flag))
            out[flag] = Boolean(body[flag]);
    }
    if (!isUpdate || has('isTakeoutAvailable'))
        out.isTakeoutAvailable = body.isTakeoutAvailable !== false;
    if (!isUpdate || has('customAddOns'))
        out.customAddOns = Array.isArray(body.customAddOns) ? body.customAddOns : [];
    if (!isUpdate || has('recipe'))
        out.recipe = Array.isArray(body.recipe) ? body.recipe : [];
    if (!isUpdate || has('orderIndex')) {
        out.orderIndex = Number.isFinite(Number(body.orderIndex)) ? Number(body.orderIndex) : 999;
    }
    if (!isUpdate) {
        Object.assign(out, applyInventoryLinkage({}, out));
        if (!out.stockStatus)
            out.stockStatus = out.available ? 'AVAILABLE' : 'SOLD_OUT';
    }
    out.updatedAt = new Date().toISOString();
    if (body.id)
        out.id = sanitizeString(body.id, 100);
    return { isValid: true, sanitizedData: out };
}
function applyInventoryLinkage(existing, patch) {
    const prev = existing || {};
    const track = patch.trackInventory !== undefined ? !!patch.trackInventory : !!prev.trackInventory;
    const rawCount = patch.inventoryCount !== undefined ? patch.inventoryCount : prev.inventoryCount;
    const needsDefaultZero = track && (typeof rawCount !== 'number' || !Number.isFinite(rawCount));
    const count = needsDefaultZero ? 0 : rawCount;
    if (track && typeof count === 'number' && count <= 0) {
        return {
            ...(needsDefaultZero ? { inventoryCount: 0 } : {}),
            available: false,
            soldOutType: 'permanent',
            soldOutAt: patch.soldOutAt || prev.soldOutAt || new Date().toISOString(),
            stockStatus: 'SOLD_OUT'
        };
    }
    const wasInventoryLocked = !!prev.trackInventory && typeof prev.inventoryCount === 'number' && prev.inventoryCount <= 0;
    const canAutoRecover = patch.available === undefined || (patch.available === false && prev.available === false);
    if ((!track || (typeof count === 'number' && count > 0)) && wasInventoryLocked && canAutoRecover) {
        return { available: true, soldOutType: 'none', soldOutAt: null, soldOutDate: null, stockStatus: 'AVAILABLE' };
    }
    return {};
}
//# sourceMappingURL=validators.js.map