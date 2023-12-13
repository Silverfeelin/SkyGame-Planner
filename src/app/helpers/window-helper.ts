export class WindowHelper {
  static isWindows(): boolean {
    return window.navigator.userAgent?.includes('Windows') === true;
  }
}
