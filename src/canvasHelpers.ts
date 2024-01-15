import {AsyncDrawable} from './hooks/useAsyncResource';

// Clamp dpi to 2 for performance
export const dpi = Math.min(2, global.devicePixelRatio ?? 1);

export function drawImageProp(
  [img, loaded]: AsyncDrawable,
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  if (!loaded) {
    if (y < ctx.canvas.height / 2) {
      ctx.fillStyle = '#cf8aea';
    } else {
      ctx.fillStyle = '#c4ff7e';
    }
    ctx.fillRect(x, y, w, h);
    return;
  }
  // default offset is center
  let offsetX = 0.5;
  let offsetY = 0.5;

  // keep bounds [0.0, 1.0]
  if (offsetX < 0) offsetX = 0;
  if (offsetY < 0) offsetY = 0;
  if (offsetX > 1) offsetX = 1;
  if (offsetY > 1) offsetY = 1;

  let iw = 'videoWidth' in img ? img.videoWidth : img.width,
    ih = 'videoHeight' in img ? img.videoHeight : img.height,
    r = Math.min(w / iw, h / ih),
    nw = iw * r, // new prop. width
    nh = ih * r, // new prop. height
    cx,
    cy,
    cw,
    ch,
    ar = 1;

  // decide which gap to fill
  if (nw < w) ar = w / nw;
  if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; // updated
  nw *= ar;
  nh *= ar;

  // calc source rectangle
  cw = iw / (nw / w);
  ch = ih / (nh / h);

  cx = (iw - cw) * offsetX;
  cy = (ih - ch) * offsetY;

  // make sure source rectangle is valid
  if (cx < 0) cx = 0;
  if (cy < 0) cy = 0;
  if (cw > iw) cw = iw;
  if (ch > ih) ch = ih;

  // fill image in dest. rectangle
  ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
}

export function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 20,
) {
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
}

export function drawImageInRoundedRect(
  ctx: CanvasRenderingContext2D,
  image: AsyncDrawable,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number = 20,
) {
  ctx.save();
  ctx.beginPath();
  roundedRectPath(ctx, x, y, width, height, radius);
  ctx.closePath();
  ctx.clip();
  drawImageProp(image, ctx, x, y, width, height);
  ctx.restore();
}
