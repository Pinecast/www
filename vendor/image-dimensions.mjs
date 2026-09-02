/**
 * image-dimensions.mjs
 *
 * Read the intrinsic width and height of a local image by parsing just its
 * header. This replaces the `image-size` package, which has open security
 * advisories with no patched release. We only need to measure the handful of
 * formats that live under `public/`, so a small, format-by-format reader is
 * enough and keeps the build free of unmaintained dependencies.
 *
 * Supported: PNG, JPEG, GIF, WebP (VP8, VP8L, VP8X), SVG.
 */
import { openSync, readSync, closeSync, readFileSync } from "node:fs";

// Enough bytes for every fixed-position header below; JPEG and SVG fall back
// to reading the whole file because their size lives at a variable offset.
const HEADER_BYTES = 64;

/**
 * @param {string} path
 * @returns {Buffer}
 */
const readHeader = (path) => {
  const buffer = Buffer.alloc(HEADER_BYTES);
  const fd = openSync(path, "r");
  try {
    const bytesRead = readSync(fd, buffer, 0, HEADER_BYTES, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    closeSync(fd);
  }
};

/** @param {Buffer} buf */
const isPng = (buf) =>
  buf.length >= 24 &&
  buf.toString("ascii", 1, 4) === "PNG" &&
  buf[0] === 0x89 &&
  buf.toString("ascii", 12, 16) === "IHDR";

/** @param {Buffer} buf */
const readPng = (buf) => ({
  width: buf.readUInt32BE(16),
  height: buf.readUInt32BE(20),
});

/** @param {Buffer} buf */
const isGif = (buf) =>
  buf.length >= 10 &&
  (buf.toString("ascii", 0, 6) === "GIF87a" ||
    buf.toString("ascii", 0, 6) === "GIF89a");

/** @param {Buffer} buf */
const readGif = (buf) => ({
  width: buf.readUInt16LE(6),
  height: buf.readUInt16LE(8),
});

/** @param {Buffer} buf */
const isWebp = (buf) =>
  buf.length >= 30 &&
  buf.toString("ascii", 0, 4) === "RIFF" &&
  buf.toString("ascii", 8, 12) === "WEBP";

/** @param {Buffer} buf */
const readWebp = (buf) => {
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8 ") {
    // Lossy: 14-bit dimensions after the 3-byte frame tag and start code.
    return {
      width: buf.readUInt16LE(26) & 0x3fff,
      height: buf.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === "VP8L") {
    // Lossless: 14-bit dimensions minus one, packed after the 0x2f signature.
    const bits = buf.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }
  if (chunk === "VP8X") {
    // Extended: 24-bit canvas dimensions minus one.
    return {
      width: buf.readUIntLE(24, 3) + 1,
      height: buf.readUIntLE(27, 3) + 1,
    };
  }
  throw new Error(`Unrecognized WebP chunk "${chunk}"`);
};

/** @param {Buffer} buf */
const isJpeg = (buf) => buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8;

/**
 * Walk the JPEG marker segments until the first start-of-frame, which carries
 * the dimensions.
 * @param {Buffer} buf
 */
const readJpeg = (buf) => {
  let offset = 2;
  while (offset + 9 <= buf.length) {
    if (buf[offset] !== 0xff) {
      throw new Error("Malformed JPEG: expected marker");
    }
    const marker = buf[offset + 1];
    // Padding bytes between segments.
    if (marker === 0xff) {
      offset += 1;
      continue;
    }
    const length = buf.readUInt16BE(offset + 2);
    const isStartOfFrame =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;
    if (isStartOfFrame) {
      return {
        height: buf.readUInt16BE(offset + 5),
        width: buf.readUInt16BE(offset + 7),
      };
    }
    if (length < 2) {
      throw new Error("Malformed JPEG: bad segment length");
    }
    offset += 2 + length;
  }
  throw new Error("Malformed JPEG: no start-of-frame segment");
};

/** @param {Buffer} buf */
const isSvg = (buf) => /^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE[^>]*>\s*)?<svg[\s>]/i.test(
  buf.toString("utf8"),
);

/** @param {string} value */
const parseSvgLength = (value) => {
  const match = /^\s*([0-9]*\.?[0-9]+)\s*(px)?\s*$/i.exec(value);
  return match ? Math.round(parseFloat(match[1])) : undefined;
};

/** @param {string} text */
const readSvg = (text) => {
  const open = /<svg[^>]*>/i.exec(text);
  if (!open) {
    throw new Error("Malformed SVG: no <svg> element");
  }
  const attrs = open[0];
  const attr = (name) => {
    const match = new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, "i").exec(
      attrs,
    );
    return match ? match[1] : undefined;
  };
  const width = attr("width");
  const height = attr("height");
  if (width && height) {
    const w = parseSvgLength(width);
    const h = parseSvgLength(height);
    if (w && h) {
      return { width: w, height: h };
    }
  }
  const viewBox = attr("viewBox");
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every(Number.isFinite)) {
      const ratio = parts[2] / parts[3];
      if (width) {
        const w = parseSvgLength(width);
        if (w) return { width: w, height: Math.round(w / ratio) };
      }
      if (height) {
        const h = parseSvgLength(height);
        if (h) return { width: Math.round(h * ratio), height: h };
      }
      return { width: Math.round(parts[2]), height: Math.round(parts[3]) };
    }
  }
  throw new Error("SVG has neither width/height nor a usable viewBox");
};

/**
 * @param {string} path - Absolute path to the image on disk.
 * @returns {{width: number, height: number}}
 */
export const getImageDimensions = (path) => {
  const header = readHeader(path);
  if (isPng(header)) return readPng(header);
  if (isGif(header)) return readGif(header);
  if (isWebp(header)) return readWebp(header);
  if (isJpeg(header)) return readJpeg(readFileSync(path));
  if (isSvg(header)) return readSvg(readFileSync(path, "utf8"));
  throw new Error(`Unsupported image format: ${path}`);
};

export default getImageDimensions;
