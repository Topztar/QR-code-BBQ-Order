import React, { useState, useRef, useCallback } from 'react';
import { TableConfig } from '../types';

interface UseTableLayoutProps {
  tables: TableConfig[];
  onUpdateTableStatus?: (id: string, updates: Partial<Omit<TableConfig, 'id' | 'qrCodeUrl'>>) => Promise<{ success: boolean; error?: string }>;
}

export function useTableLayout({ tables, onUpdateTableStatus }: UseTableLayoutProps) {
  const [tableLayoutMode, setTableLayoutMode] = useState<'grid' | 'floormap'>('floormap');
  const [localTablePositions, setLocalTablePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [gridSize, setGridSize] = useState<number>(5); // Default grid size 5%

  const [isTableLayoutLocked, setIsTableLayoutLocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('table-layout-locked') !== 'false';
    } catch {
      return true;
    }
  });

  const [selectedFineTuneTableId, setSelectedFineTuneTableId] = useState<string | null>(null);
  const fineTuneTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Drag and drop mouse event handler
  const handleTableMouseDown = useCallback((e: React.MouseEvent, tableId: string) => {
    if (isTableLayoutLocked) return;
    e.preventDefault();
    const mapElement = document.getElementById('floor-map-container');
    if (!mapElement) return;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentRect = mapElement.getBoundingClientRect();
      const rawX = moveEvent.clientX - currentRect.left;
      const rawY = moveEvent.clientY - currentRect.top;

      let xPercent = Math.max(0, Math.min(100, Math.round((rawX / currentRect.width) * 100)));
      let yPercent = Math.max(0, Math.min(100, Math.round((rawY / currentRect.height) * 100)));

      if (snapToGrid) {
        xPercent = Math.round(xPercent / gridSize) * gridSize;
        yPercent = Math.round(yPercent / gridSize) * gridSize;
        xPercent = Math.max(0, Math.min(100, xPercent));
        yPercent = Math.max(0, Math.min(100, yPercent));
      }

      setLocalTablePositions((prev) => ({
        ...prev,
        [tableId]: { x: xPercent, y: yPercent },
      }));
    };

    const handleMouseUp = async (upEvent: MouseEvent) => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);

      const currentRect = mapElement.getBoundingClientRect();
      const rawX = upEvent.clientX - currentRect.left;
      const rawY = upEvent.clientY - currentRect.top;
      let finalX = Math.max(0, Math.min(100, Math.round((rawX / currentRect.width) * 100)));
      let finalY = Math.max(0, Math.min(100, Math.round((rawY / currentRect.height) * 100)));

      if (snapToGrid) {
        finalX = Math.round(finalX / gridSize) * gridSize;
        finalY = Math.round(finalY / gridSize) * gridSize;
        finalX = Math.max(0, Math.min(100, finalX));
        finalY = Math.max(0, Math.min(100, finalY));
      }

      if (onUpdateTableStatus) {
        await onUpdateTableStatus(tableId, { positionX: finalX, positionY: finalY } as any);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [isTableLayoutLocked, snapToGrid, gridSize, onUpdateTableStatus]);

  // Drag and drop touch event handler for tablet/mobile devices
  const handleTableTouchStart = useCallback((e: React.TouchEvent, tableId: string) => {
    if (isTableLayoutLocked) return;
    e.stopPropagation();
    const mapElement = document.getElementById('floor-map-container');
    if (!mapElement) return;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length === 0) return;
      const touch = moveEvent.touches[0];

      const currentRect = mapElement.getBoundingClientRect();
      const rawX = touch.clientX - currentRect.left;
      const rawY = touch.clientY - currentRect.top;

      let xPercent = Math.max(0, Math.min(100, Math.round((rawX / currentRect.width) * 100)));
      let yPercent = Math.max(0, Math.min(100, Math.round((rawY / currentRect.height) * 100)));

      if (snapToGrid) {
        xPercent = Math.round(xPercent / gridSize) * gridSize;
        yPercent = Math.round(yPercent / gridSize) * gridSize;
        xPercent = Math.max(0, Math.min(100, xPercent));
        yPercent = Math.max(0, Math.min(100, yPercent));
      }

      setLocalTablePositions((prev) => ({
        ...prev,
        [tableId]: { x: xPercent, y: yPercent },
      }));
    };

    const handleTouchEnd = async (endEvent: TouchEvent) => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);

      const endedTouch = endEvent.changedTouches[0];
      if (!endedTouch) return;

      const currentRect = mapElement.getBoundingClientRect();
      const rawX = endedTouch.clientX - currentRect.left;
      const rawY = endedTouch.clientY - currentRect.top;
      let finalX = Math.max(0, Math.min(100, Math.round((rawX / currentRect.width) * 100)));
      let finalY = Math.max(0, Math.min(100, Math.round((rawY / currentRect.height) * 100)));

      if (snapToGrid) {
        finalX = Math.round(finalX / gridSize) * gridSize;
        finalY = Math.round(finalY / gridSize) * gridSize;
        finalX = Math.max(0, Math.min(100, finalX));
        finalY = Math.max(0, Math.min(100, finalY));
      }

      if (onUpdateTableStatus) {
        await onUpdateTableStatus(tableId, { positionX: finalX, positionY: finalY } as any);
      }
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [isTableLayoutLocked, snapToGrid, gridSize, onUpdateTableStatus]);

  // Fine tune coordinate modifier (with 500ms debounce protection)
  const handleFineTunePosition = useCallback(async (dx: number, dy: number) => {
    if (isTableLayoutLocked || !selectedFineTuneTableId) return;
    const tbl = tables.find((t) => t.id === selectedFineTuneTableId);
    if (!tbl) return;

    const currentX = localTablePositions[tbl.id]?.x !== undefined ? localTablePositions[tbl.id].x : (tbl.positionX || 10);
    const currentY = localTablePositions[tbl.id]?.y !== undefined ? localTablePositions[tbl.id].y : (tbl.positionY || 10);

    const stepX = snapToGrid ? (dx > 0 ? gridSize : dx < 0 ? -gridSize : 0) : dx;
    const stepY = snapToGrid ? (dy > 0 ? gridSize : dy < 0 ? -gridSize : 0) : dy;

    let nextX = Math.max(0, Math.min(100, currentX + stepX));
    let nextY = Math.max(0, Math.min(100, currentY + stepY));

    if (snapToGrid) {
      nextX = Math.round(nextX / gridSize) * gridSize;
      nextY = Math.round(nextY / gridSize) * gridSize;
      nextX = Math.max(0, Math.min(100, nextX));
      nextY = Math.max(0, Math.min(100, nextY));
    }

    setLocalTablePositions((prev) => ({
      ...prev,
      [tbl.id]: { x: nextX, y: nextY },
    }));

    if (fineTuneTimeoutRef.current) {
      clearTimeout(fineTuneTimeoutRef.current);
    }
    fineTuneTimeoutRef.current = setTimeout(async () => {
      if (onUpdateTableStatus) {
        await onUpdateTableStatus(tbl.id, { positionX: nextX, positionY: nextY } as any);
      }
    }, 500);
  }, [isTableLayoutLocked, selectedFineTuneTableId, tables, localTablePositions, snapToGrid, gridSize, onUpdateTableStatus]);

  return {
    tableLayoutMode,
    setTableLayoutMode,
    localTablePositions,
    setLocalTablePositions,
    snapToGrid,
    setSnapToGrid,
    gridSize,
    setGridSize,
    isTableLayoutLocked,
    setIsTableLayoutLocked,
    selectedFineTuneTableId,
    setSelectedFineTuneTableId,
    handleTableMouseDown,
    handleTableTouchStart,
    handleFineTunePosition,
  };
}
