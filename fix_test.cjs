const fs = require('fs');
let file = 'tests/ingestion_contracts.test.ts';
let c = fs.readFileSync(file, 'utf8');
c = c.replace(/as Order/g, ''); // clear old
c = c.replace(/\{ id: 'order-1', status: 'completed', createdAt: '2024-03-24T12:00:00Z' \}/g, "{ id: 'order-1', status: 'completed', createdAt: '2024-03-24T12:00:00Z' } as any");
c = c.replace(/\{ id: 'order-2', status: 'completed', createdAt: '2024-03-24T13:00:00Z' \}/g, "{ id: 'order-2', status: 'completed', createdAt: '2024-03-24T13:00:00Z' } as any");
fs.writeFileSync(file, c, 'utf8');
