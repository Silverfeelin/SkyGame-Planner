import type { GridHint } from './grid';
import type { ScreenshotMatch } from './batch';

export interface ClosetImportReference {
  sheet: string;
  x: number;
  y: number;
  ongoing: boolean;
}

export type ClosetImportRequest =
  | { id: number, kind: 'prepare', references: Array<ClosetImportReference> }
  | { id: number, kind: 'process', file: Blob, hint?: GridHint };

export type ClosetImportResponse =
  | { id: number, kind: 'prepared', count: number }
  | { id: number, kind: 'processed', result: ScreenshotMatch | null }
  | { id: number, kind: 'error', message: string };
