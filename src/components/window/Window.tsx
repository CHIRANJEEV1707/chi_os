'use client';
import React, { useRef } from 'react';
import { cn } from '@/lib/utils';
import TitleBar from './TitleBar';
import { WindowState } from '@/lib/types';
import { useWindowStore } from '@/store/windowStore';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { useWindowResize } from '@/hooks/useWindowResize';

type WindowProps = {
  windowState: WindowState;
  desktopBounds: { width: number; height: number };
};

const TASKBAR_HEIGHT = 40;
const handles = ['n','s','w','e','nw','ne','sw','se'];
const handleClassMap: {[key: string]: string} = {
    n: 'resize-handle resize-handle-n',
    s: 'resize-handle resize-handle-s',
    w: 'resize-handle resize-handle-w',
    e: 'resize-handle resize-handle-e',
    nw: 'resize-handle resize-handle-nw',
    ne: 'resize-handle resize-handle-ne',
    sw: 'resize-handle resize-handle-sw',
    se: 'resize-handle resize-handle-se',
}


export default function Window({ windowState, desktopBounds }: WindowProps) {
  const {
    closeWindow,
    focusWindow,
    toggleMinimize,
    toggleMaximize,
    updateWindowPosition,
  } = useWindowStore();
  const nodeRef = useRef(null);
  const windowWrapperRef = useRef<HTMLDivElement>(null);

  const { onResizeStart, isResizing } = useWindowResize(windowState.id, windowWrapperRef, desktopBounds);

  if (windowState.isMinimized) {
    return null;
  }

  const handleFocus = (e: React.MouseEvent) => {
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
          ref={windowWrapperRef}
          style={{ width, height }}
          className={cn(
            'flex flex-col overflow-visible',
            'bg-window-bg border-2 border-border text-primary shadow-lg',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            isResizing && 'window-resizing'
          )}
        >
           {!windowState.isMaximized && handles.map(dir => (
            <div
              key={dir}
              className={handleClassMap[dir]}
              onMouseDown={(e) => onResizeStart(e, dir)}
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
