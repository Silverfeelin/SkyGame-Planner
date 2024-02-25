export class JsonHelper {
  /* Returns a JSON array without the surrounding brackets and with a trailing comma. */
  static inArray(json: string): string {
    let startI = json.indexOf('{');
    if (startI === -1) { startI = json.indexOf('"') }
    let endI = json.lastIndexOf('}');
    if (endI === -1) { endI = json.lastIndexOf('"') }
    json = json.substring(startI, endI + 1) + ',';
    return json;
  }
}
