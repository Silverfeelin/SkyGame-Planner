/** File types the screenshot matcher can decode. */
const SCREENSHOT_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export const SCREENSHOT_ACCEPT = SCREENSHOT_TYPES.join(',');
export const isScreenshotFile = (file: File) => SCREENSHOT_TYPES.includes(file.type);

export const PASTE_KEY = /Mac/.test(navigator.platform) ? '⌘V' : 'Ctrl+V';

export const screenshotsFromClipboard = (event: ClipboardEvent): Array<File> =>
  Array.from(event.clipboardData?.files ?? []).filter(isScreenshotFile);

export const isEditableTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && (target.isContentEditable || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement);
