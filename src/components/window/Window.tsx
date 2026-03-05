'use client';
import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import TitleBar from './TitleBar';
import { WindowState } from '@/lib/types';
import { useWindowStore } from '@/store/windowStore';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';

type WindowProps = {
  windowState: WindowState;
  desktopBounds: { width: number; height: number };
};

const TASKBAR_HEIGHT = 40;
const MIN_WIDTH = 320;
const MIN_HEIGHT = 200;
const RESIZE_HANDLES = ['top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];

const getCursorForDirection = (direction: string) => {
  if (direction.includes('top') || direction.includes('bottom')) {
    if (direction.includes('left') || direction.includes('right')) {
      if ((direction.includes('top') && direction.includes('left')) || (direction.includes('bottom') && direction.includes('right'))) {
        return 'nwse-resize';
      }
      return 'nesw-resize';
    }
    return 'ns-resize';
  }
  if (direction.includes('left') || direction.includes('right')) {
    return 'ew-resize';
  }
  return 'auto';
};

export default function Window({ windowState, desktopBounds }: WindowProps) {
  const {
    closeWindow,
    focusWindow,
    toggleMinimize,
    toggleMaximize,
    updateWindowPosition,
    updateWindowSize,
  } = useWindowStore();
  const nodeRef = useRef(null);
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>, direction: string) => {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    const bodyCursor = getCursorForDirection(direction);
    document.body.style.cursor = bodyCursor;

    const startX = e.clientX;
    const startY = e.clientY;
    const { position: { x: startLeft, y: startTop }, size: { width: startWidth, height: startHeight } } = useWindowStore.getState().windows.find(w => w.id === windowState.id)!;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        let newWidth = startWidth as number;
        let newHeight = startHeight as number;
        let newX = startLeft;
        let newY = startTop;

        if (direction.includes('right')) newWidth = Math.max(MIN_WIDTH, (startWidth as number) + dx);
        if (direction.includes('bottom')) newHeight = Math.max(MIN_HEIGHT, (startHeight as number) + dy);

        if (direction.includes('left')) {
            const w = (startWidth as number) - dx;
            if (w < MIN_WIDTH) {
                newWidth = MIN_WIDTH;
                newX = startLeft + (startWidth as number) - MIN_WIDTH;
            } else {
                newWidth = w;
                newX = startLeft + dx;
            }
        }
        if (direction.includes('top')) {
            const h = (startHeight as number) - dy;
            if (h < MIN_HEIGHT) {
                newHeight = MIN_HEIGHT;
                newY = startTop + (startHeight as number) - MIN_HEIGHT;
            } else {
                newHeight = h;
                newY = startTop + dy;
            }
        }

        // Max constraints
        if (newX < 0) { newWidth += newX; newX = 0; }
        if (newY < 0) { newHeight += newY; newY = 0; }
        if (newX + newWidth > desktopBounds.width) { newWidth = desktopBounds.width - newX; }
        if (newY + newHeight > desktopBounds.height - TASKBAR_HEIGHT) { newHeight = desktopBounds.height - TASKBAR_HEIGHT - newY; }

        updateWindowSize(windowState.id, { width: newWidth, height: newHeight });
        updateWindowPosition(windowState.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
        setIsResizing(false);
        document.body.style.cursor = '';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);

        const currentWindow = useWindowStore.getState().windows.find(w => w.id === windowState.id);
        if (currentWindow) {
            const snappedWidth = Math.round((currentWindow.size.width as number) / 4) * 4;
            const snappedHeight = Math.round((currentWindow.size.height as number) / 4) * 4;
            let snappedX = currentWindow.position.x;
            let snappedY = currentWindow.position.y;
            if (direction.includes('left')) {
                snappedX = currentWindow.position.x + ((currentWindow.size.width as number) - snappedWidth);
            }
            if (direction.includes('top')) {
                snappedY = currentWindow.position.y + ((currentWindow.size.height as number) - snappedHeight);
            }
            updateWindowSize(windowState.id, { width: snappedWidth, height: snappedHeight });
            updateWindowPosition(windowState.id, { x: snappedX, y: snappedY });
        }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  if (windowState.isMinimized) {
    return null;
  }

  const handleFocus = (e: React.MouseEvent) => {
    // Prevent focus when clicking on buttons in title bar or resize handles
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.resize-handle')) {
      return;
    }
    focusWindow(windowState.id);
  };

  const onDragStop = (_e: DraggableEvent, data: DraggableData) => {
    if (!windowState.isMaximized) {
      updateWindowPosition(windowState.id, { x: data.x, y: data.y });
    }
  };

  const width = windowState.isMaximized
    ? desktopBounds.width
    : typeof windowState.size.width === 'number'
    ? windowState.size.width
    : 640;
  const height = windowState.isMaximized
    ? desktopBounds.height - TASKBAR_HEIGHT
    : typeof windowState.size.height === 'number'
    ? windowState.size.height
    : 420;

  const position = windowState.isMaximized ? { x: 0, y: 0 } : windowState.position;

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".window-titlebar"
      position={position}
      onStop={onDragStop}
      onMouseDown={handleFocus}
      bounds={{
        top: 0,
        left: 0,
        right: desktopBounds.width - width,
        bottom: desktopBounds.height - height - TASKBAR_HEIGHT,
      }}
      disabled={windowState.isMaximized || isResizing}
    >
      <div ref={nodeRef} className="absolute" style={{ zIndex: windowState.zIndex }} onMouseDown={handleFocus}>
        <div
          style={{ width, height }}
          className={cn(
            'flex flex-col',
            'bg-window-bg border-2 border-border text-primary shadow-lg',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            isResizing && 'window-resizing'
          )}
        >
           {!windowState.isMaximized && RESIZE_HANDLES.map(dir => (
            <div
              key={dir}
              className={`resize-handle resize-handle-${dir}`}
              onMouseDown={(e) => handleResizeMouseDown(e, dir)}
            />
          ))}
          <TitleBar
            title={windowState.title}
            icon={windowState.id}
            onClose={() => closeWindow(windowState.id)}
            onMaximize={() => toggleMaximize(windowState.id)}
            onMinimize={() => toggleMinimize(windowState.id)}
            isMaximized={windowState.isMaximized}
          />
          <div className={cn("flex-grow overflow-auto p-1 bg-black/30 h-full", isResizing && 'pointer-events-none')}>
            {windowState.content}
          </div>
        </div>
      </div>
    </Draggable>
  );
}
