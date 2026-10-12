/** Interleaved RGBA pixels, as returned by `getImageData`. */
export interface RgbaImage {
  width: number;
  height: number;
  data: Uint8ClampedArray | Uint8Array;
}

/** Single-channel image. */
export interface Plane {
  width: number;
  height: number;
  data: Float64Array;
}

/** Round half to even. */
export function rint(x: number): number {
  const f = Math.floor(x);
  const d = x - f;
  if (d > 0.5) { return f + 1; }
  if (d < 0.5) { return f; }
  return f % 2 === 0 ? f : f + 1;
}

export function clamp(x: number, lo: number, hi: number): number {
  return x < lo ? lo : x > hi ? hi : x;
}

export function median(values: ArrayLike<number>): number {
  const n = values.length;
  if (!n) { return NaN; }
  const s = Float64Array.from(values).sort();
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

/** Quantile with linear interpolation between the closest ranks. */
export function quantile(values: Float64Array, q: number): number {
  const s = Float64Array.from(values).sort();
  const pos = q * (s.length - 1);
  const lo = Math.floor(pos);
  const hi = Math.min(lo + 1, s.length - 1);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}

/** Least-squares line through (x, y): returns [slope, intercept]. */
export function polyfit(x: ArrayLike<number>, y: ArrayLike<number>): [number, number] {
  const n = x.length;
  let sx = 0, sy = 0;
  for (let i = 0; i < n; i++) { sx += x[i]; sy += y[i]; }
  const mx = sx / n, my = sy / n;
  let sxx = 0, sxy = 0;
  for (let i = 0; i < n; i++) { sxx += (x[i] - mx) ** 2; sxy += (x[i] - mx) * (y[i] - my); }
  const slope = sxy / sxx;
  return [slope, my - slope * mx];
}

/** Mean of R, G and B. */
export function luminance(img: RgbaImage): Plane {
  const { width, height, data } = img;
  const out = new Float64Array(width * height);
  for (let i = 0, p = 0; i < out.length; i++, p += 4) {
    out[i] = (data[p] + data[p + 1] + data[p + 2]) / 3;
  }
  return { width, height, data: out };
}

/** 5x5 box mean with edge-replicated borders. */
export function box5(plane: Plane): Plane {
  const { width: w, height: h, data } = plane;
  const tmp = new Float64Array(w * h);
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let d = -2; d <= 2; d++) { s += data[row + clamp(x + d, 0, w - 1)]; }
      tmp[row + x] = s;
    }
  }
  const out = new Float64Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let d = -2; d <= 2; d++) { s += tmp[clamp(y + d, 0, h - 1) * w + x]; }
      out[y * w + x] = s / 25;
    }
  }
  return { width: w, height: h, data: out };
}

export function crop(plane: Plane, x0: number, y0: number, x1: number, y1: number): Plane {
  x0 = clamp(x0, 0, plane.width); x1 = clamp(x1, x0, plane.width);
  y0 = clamp(y0, 0, plane.height); y1 = clamp(y1, y0, plane.height);
  const w = x1 - x0, h = y1 - y0;
  const out = new Float64Array(w * h);
  for (let y = 0; y < h; y++) {
    out.set(plane.data.subarray((y0 + y) * plane.width + x0, (y0 + y) * plane.width + x1), y * w);
  }
  return { width: w, height: h, data: out };
}

// #region Resampling

type Filter = { support: number, fn: (x: number) => number };

const sinc = (x: number) => x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
export const BILINEAR: Filter = { support: 1, fn: x => { x = Math.abs(x); return x < 1 ? 1 - x : 0; } };
export const LANCZOS: Filter = { support: 3, fn: x => x > -3 && x < 3 ? sinc(x) * sinc(x / 3) : 0 };

/** Filter weights per output pixel. */
function coefficients(inSize: number, outSize: number, filter: Filter): Array<{ start: number, weights: Float64Array }> {
  const scale = inSize / outSize;
  const filterScale = Math.max(scale, 1);
  const support = filter.support * filterScale;
  const out = [];
  for (let i = 0; i < outSize; i++) {
    const center = (i + 0.5) * scale;
    const start = Math.max(Math.trunc(center - support + 0.5), 0);
    const end = Math.min(Math.trunc(center + support + 0.5), inSize);
    const weights = new Float64Array(Math.max(end - start, 0));
    let total = 0;
    for (let x = 0; x < weights.length; x++) {
      weights[x] = filter.fn((x + start - center + 0.5) / filterScale);
      total += weights[x];
    }
    if (total) { for (let x = 0; x < weights.length; x++) { weights[x] /= total; } }
    out.push({ start, weights });
  }
  return out;
}

/**
 * Resamples interleaved 8-bit pixels with `channels` channels.
 * The horizontal pass runs first and both passes round to 8 bits.
 */
export function resample(src: ArrayLike<number>, w: number, h: number, channels: number,
  outW: number, outH: number, filter: Filter): Uint8ClampedArray {
  let cur: ArrayLike<number> = src;
  let curW = w;
  if (outW !== w) {
    const cx = coefficients(w, outW, filter);
    const tmp = new Uint8ClampedArray(outW * h * channels);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < outW; x++) {
        const { start, weights } = cx[x];
        for (let c = 0; c < channels; c++) {
          let s = 0;
          for (let k = 0; k < weights.length; k++) { s += weights[k] * cur[((y * curW) + start + k) * channels + c]; }
          tmp[(y * outW + x) * channels + c] = rint(s);
        }
      }
    }
    cur = tmp; curW = outW;
  }
  if (outH !== h) {
    const cy = coefficients(h, outH, filter);
    const tmp = new Uint8ClampedArray(curW * outH * channels);
    for (let y = 0; y < outH; y++) {
      const { start, weights } = cy[y];
      for (let x = 0; x < curW; x++) {
        for (let c = 0; c < channels; c++) {
          let s = 0;
          for (let k = 0; k < weights.length; k++) { s += weights[k] * cur[((start + k) * curW + x) * channels + c]; }
          tmp[(y * curW + x) * channels + c] = rint(s);
        }
      }
    }
    cur = tmp;
  }
  return cur instanceof Uint8ClampedArray && cur !== src ? cur : Uint8ClampedArray.from(cur);
}

// #endregion
