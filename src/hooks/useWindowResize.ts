'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import { useWindowStore } from '@/store/windowStore';

const TASKBAR_HEIGHT = 40;

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

export const useWindowResize = (
  windowId: string,
  windowRef: React.RefObject<HTMLDivElement>,
  desktopBounds: { width: number; height: number },
  minWidth = 320,
  minHeight = 200
) => {
  const resizing = useRef<any>(null);
  const [isResizing, setIsResizing] = useState(false);
  const { updateWindowPosition, updateWindowSize } = useWindowStore();

  const onResizeMove = useCallback((e: MouseEvent) => {
    if (!resizing.current) return;
    const { direction, startX, startY, startW, startH, startLeft, startTop } = resizing.current;
    
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    let newW = startW;
    let newH = startH;
    let newX = startLeft;
    let newY = startTop;

    if (direction.includes('e')) newW = Math.max(minWidth, startW + dx);
    if (direction.includes('s')) newH = Math.max(minHeight, startH + dy);

    if (direction.includes('w')) {
      const w = startW - dx;
      if (w < minWidth) {
        newW = minWidth;
        newX = startLeft + startW - minWidth;
      } else {
        newW = w;
        newX = startLeft + dx;
      }
    }
    if (direction.includes('n')) {
      const h = startH - dy;
      if (h < minHeight) {
        newH = minHeight;
        newY = startTop + startH - minHeight;
      } else {
        newH = h;
        newY = startTop + dy;
      }
    }
    
    // Max constraints
    if (newX < 0) { newW += newX; newX = 0; }
    if (newY < 0) { newH += newY; newY = 0; }
    if (newX + newW > desktopBounds.width) { newW = desktopBounds.width - newX; }
    if (newY + newH > desktopBounds.height - TASKBAR_HEIGHT) { newH = desktopBounds.height - TASKBAR_HEIGHT - newY; }

    updateWindowSize(windowId, { width: newW, height: newH });
    updateWindowPosition(windowId, { x: newX, y: newY });
  }, [windowId, updateWindowSize, updateWindowPosition, minWidth, minHeight, desktopBounds]);

  const onResizeEnd = useCallback(() => {
    document.body.classList.remove('is-resizing');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    setIsResizing(false);

    // Snap to grid
    const { windows } = useWindowStore.getState();
    const currentWindow = windows.find(w => w.id === windowId);
    if (currentWindow) {
      const snappedWidth = Math.round((currentWindow.size.width as number) / 4) * 4;
      const snappedHeight = Math.round((currentWindow.size.height as number) / 4) * 4;
      let snappedX = currentWindow.position.x;
      let snappedY = currentWindow.position.y;
      
      if (resizing.current?.direction.includes('w')) {
        snappedX = currentWindow.position.x + ((currentWindow.size.width as number) - snappedWidth);
      }
      if (resizing.current?.direction.includes('n')) {
        snappedY = currentWindow.position.y + ((currentWindow.size.height as number) - snappedHeight);
      }
      
      updateWindowSize(windowId, { width: snappedWidth, height: snappedHeight });
      updateWindowPosition(windowId, { x: snappedX, y: snappedY });
    }

    resizing.current = null;
    document.removeEventListener('mousemove', onResizeMove);
    document.removeEventListener('mouseup', onResizeEnd);
  }, [onResizeMove, windowId, updateWindowSize, updateWindowPosition]);

  const onResizeStart = useCallback((e: React.MouseEvent<HTMLDivElement>, direction: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!windowRef.current) return;
    
    const { windows } = useWindowStore.getState();
    const winState = windows.find(w => w.id === windowId);
    if (!winState) return;

    resizing.current = {
        direction,
        startX: e.clientX,
        startY: e.clientY,
        startW: windowRef.current.offsetWidth,
        startH: windowRef.current.offsetHeight,
        startLeft: winState.position.x,
        startTop: winState.position.y,
    };
    
    document.body.classList.add('is-resizing');
    document.body.style.cursor = getCursorForDirection(direction);
    document.body.style.userSelect = 'none';
    setIsResizing(true);
    
    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', onResizeEnd);
  }, [windowId, windowRef, onResizeMove, onResizeEnd]);
  
  useEffect(() => {
    return () => {
      if(resizing.current) {
        onResizeEnd();
      }
    }
  }, [onResizeEnd]);

  return { onResizeStart, isResizing };
};
