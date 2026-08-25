"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeString = sanitizeString;
exports.validateOrderPayload = validateOrderPayload;
exports.validateReservationPayload = validateReservationPayload;
exports.validateImageUploadPayload = validateImageUploadPayload;
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
    let calculatedTotal = 0;
    for (let i = 0; i < body.items.length; i++) {
        const item = body.items[i];
        if (!item || typeof item !== 'object') {
            return { isValid: false, error: `第 ${i + 1} 項餐點格式錯誤 (Invalid item object)` };
        }
        const name = typeof item.name === 'object' && item.name !== null
            ? item.name
            : sanitizeString(item.name || '', 100);
        const qty = Number(item.quantity || item.qty);
        if (!Number.isFinite(qty) || qty <= 0 || !Number.isInteger(qty) || qty > 1000) {
            return { isValid: false, error: `餐點數量異常 (Invalid quantity: ${qty})` };
        }
        const price = Number(item.price);
        if (!Number.isFinite(price) || price < 0 || price > 1000000) {
            return { isValid: false, error: `餐點金額異常 (Invalid price: ${price})` };
        }
        sanitizedItems.push({
            ...item,
            name,
            quantity: qty,
            qty,
            price,
            notes: sanitizeString(item.notes || '', 200)
        });
        calculatedTotal += (price * qty);
    }
    const sanitizedOrder = {
        ...body,
        tableNumber,
        items: sanitizedItems,
        customerName: sanitizeString(body.customerName || '', 50),
        customerPhone: sanitizeString(body.customerPhone || body.phone || '', 30),
        notes: sanitizeString(body.notes || '', 500),
        totalAmount: typeof body.totalAmount === 'number' && Number.isFinite(body.totalAmount) && body.totalAmount >= 0
            ? body.totalAmount
            : calculatedTotal
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
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phone || phoneDigits.length < 7 || phoneDigits.length > 15) {
        return { isValid: false, error: '請輸入有效的電話號碼 (7-15 digits phone number required)' };
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
        notes: sanitizeString(body.notes || '', 300)
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
//# sourceMappingURL=validators.js.map