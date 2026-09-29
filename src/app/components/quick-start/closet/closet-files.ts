/** File types the screenshot matcher can decode. */
const SCREENSHOT_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export const SCREENSHOT_ACCEPT = SCREENSHOT_TYPES.join(',');
export const isScreenshotFile = (file: File) => SCREENSHOT_TYPES.includes(file.type);
