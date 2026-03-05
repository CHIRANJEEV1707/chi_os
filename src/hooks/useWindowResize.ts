'use client';
import { useRef, useState, useCallback } from 'react';
import { useWindowStore } from '@/store/windowStore';

const getCursorForDirection = (direction: string) => {
  if (direction.includes('n') || direction.includes('s')) {
    if (direction.includes('e') || direction.includes('w')) {
      if ((direction.includes('n') && direction.includes('w')) || (direction.includes('s') && direction.includes('e'))) {
        return 'nwse-resize';
      }
      return 'nesw-resize';
    }
    return 'ns-resize';
  }
  if (direction.includes('e') || direction.includes('w')) {
    return 'ew-resize';
  }
  return 'auto';
};

export const useWindowResize = (windowId: string, minWidth = 320, minHeight = 200) => {
  const resizing = useRef<any>(null);
  const { updateWindow } = useWindowStore();
  const [isResizing, setIsResizing] = useState(false);

  const onResizeMove = useCallback((e: MouseEvent) => {
    if (!resizing.current) return;
    
    const {
      direction,
      startMouseX, startMouseY,
      startW, startH,
      startX, startY
    } = resizing.current;

    const dx = e.clientX - startMouseX;
    const dy = e.clientY - startMouseY;

    let newW = startW;
    let newH = startH;
    let newX = startX;
    let newY = startY;

    if (direction === 'e' || direction === 'ne' || direction === 'se') {
      newW = Math.max(minWidth, startW + dx);
    }

    if (direction === 's' || direction === 'se' || direction === 'sw') {
      newH = Math.max(minHeight, startH + dy);
    }

    if (direction === 'w' || direction === 'nw' || direction === 'sw') {
      const rawW = startW - dx;
      if (rawW >= minWidth) {
        newW = rawW;
        newX = startX + dx;
      } else {
        newW = minWidth;
        newX = startX + startW - minWidth;
      }
    }

    if (direction === 'n' || direction === 'nw' || direction === 'ne') {
      const rawH = startH - dy;
      if (rawH >= minHeight) {
        newH = rawH;
        newY = startY + dy;
      } else {
        newH = minHeight;
        newY = startY + startH - minHeight;
      }
    }

    updateWindow(windowId, {
      x: Math.round(newX),
      y: Math.round(newY),
      width: Math.round(newW),
      height: Math.round(newH)
    });
  }, [windowId, minWidth, minHeight, updateWindow]);

  const onResizeEnd = useCallback(() => {
    resizing.current = null;
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', onResizeEnd);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    document.body.classList.remove('is-resizing');
    setIsResizing(false);
  }, [onResizeMove]);

  const onResizeStart = useCallback((e: React.MouseEvent<HTMLDivElement>, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const windowEl = document.getElementById(`window-${windowId}`);
    if (!windowEl) return;
    const rect = windowEl.getBoundingClientRect();
    
    resizing.current = {
      direction,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startW: rect.width,
      startH: rect.height,
      startX: rect.left,
      startY: rect.top,
    };

    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', onResizeEnd);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = getCursorForDirection(direction);
    document.body.classList.add('is-resizing');
    setIsResizing(true);
  }, [windowId, onResizeMove, onResizeEnd]);
  
  return { onResizeStart, isResizing };
};
