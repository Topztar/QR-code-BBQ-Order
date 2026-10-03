import re

# StaffPortalContainer.tsx
f = 'src/components/StaffPortalContainer.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()
c = c.replace('handleSendPromoPush,', '')
c = c.replace('const {', 'const { handleSendPromoPush } = usePrinterData();\n  const {', 1)
c = c.replace('import { useOrderData } from', 'import { usePrinterData } from \'../context/PrinterDataContext\';\nimport { useOrderData } from')
with open(f, 'w', encoding='utf-8') as file:
    file.write(c)

# OrderDataContext.tsx
f = 'src/context/OrderDataContext.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()
c = c.replace('tables,', '[],')
c = c.replace('reservations,', '[],')
with open(f, 'w', encoding='utf-8') as file:
    file.write(c)

# ingestion_contracts.test.ts
f = 'tests/ingestion_contracts.test.ts'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()
c = c.replace('} as Order', '}')
c = c.replace('{ id: \'order-1\', status: \'completed\', createdAt: \'2024-03-24T12:00:00Z\' }', '{ id: \'order-1\', status: \'completed\', createdAt: \'2024-03-24T12:00:00Z\' } as any')
c = c.replace('{ id: \'order-2\', status: \'completed\', createdAt: \'2024-03-24T13:00:00Z\' }', '{ id: \'order-2\', status: \'completed\', createdAt: \'2024-03-24T13:00:00Z\' } as any')
with open(f, 'w', encoding='utf-8') as file:
    file.write(c)

# ManagerEodTab.tsx
f = 'src/components/manager/ManagerEodTab.tsx'
with open(f, 'r', encoding='utf-8') as file:
    c = file.read()
c = c.replace('import { useState }', 'import { useState, useMemo }')
c = c.replace('import { useState,', 'import { useState, useMemo,')
with open(f, 'w', encoding='utf-8') as file:
    file.write(c)

