import { ReactNode } from 'react';

export interface WindowState {
  id: string;
  title: string;
  content: ReactNode;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number | string; height: number | string };
}
