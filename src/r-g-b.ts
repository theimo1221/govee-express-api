export class RGB {
  public constructor(
    public r: number,
    public g: number,
    public b: number,
  ) {
  }

 public static hexToRgb(color: string): RGB | null {
    let hex: string | null = RGB.formatHex(color);
    if (hex === null) {
      return null;
    }
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (_m, r, g, b) => {
      return r + r + g + g + b + b;
    });

    const result: RegExpExecArray | null = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result || result.length !== 4) {
      return null;
    }
    const r: number = parseInt(result[1], 16);
    const g: number = parseInt(result[2], 16);
    const b: number = parseInt(result[3], 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return null;
    }
    return { r, g, b };
  }

  public static formatHex(hex: string): string | null {
    if (hex === undefined || hex === null || hex === '') {
      return null;
    }
    if (!hex.startsWith('#')) {
      return `#${hex}`;
    }
    return hex;
  }
}
