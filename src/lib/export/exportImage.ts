import { toBlob, toCanvas, toJpeg, toPng } from 'html-to-image';

/** Lower the export scale on small screens to avoid mobile memory limits. */
export function exportScale(): number {
  const narrow = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  return narrow ? 1.5 : 2;
}

interface BlobOptions {
  type?: 'image/png' | 'image/jpeg';
  quality?: number;
  pixelRatio?: number;
}

export async function nodeToBlob(node: HTMLElement, options: BlobOptions = {}): Promise<Blob> {
  const { type = 'image/png', quality, pixelRatio = exportScale() } = options;
  const blob = await toBlob(node, {
    type,
    quality,
    pixelRatio,
    cacheBust: true,
    backgroundColor: type === 'image/jpeg' ? '#ffffff' : undefined,
  });
  if (!blob) throw new Error('Image render failed');
  return blob;
}

export async function nodeToPng(node: HTMLElement, pixelRatio = exportScale()): Promise<string> {
  return toPng(node, { pixelRatio, cacheBust: true });
}

export async function nodeToJpeg(node: HTMLElement, pixelRatio = exportScale(), quality = 0.94): Promise<string> {
  return toJpeg(node, { pixelRatio, quality, cacheBust: true, backgroundColor: '#ffffff' });
}

export async function nodeToPdfDataUrl(node: HTMLElement, pixelRatio = exportScale()): Promise<{ dataUrl: string; width: number; height: number }> {
  const canvas = await toCanvas(node, { pixelRatio, cacheBust: true });
  return { dataUrl: canvas.toDataURL('image/jpeg', 0.95), width: canvas.width, height: canvas.height };
}

/** Saves a Blob using an object URL (works on desktop and Android Chrome; Samsung Internet may prefer "Open image"). */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/** Opens the image in a new tab — the most reliable mobile fallback (long-press to save/share). */
export function openBlobImage(blob: Blob): boolean {
  const url = URL.createObjectURL(blob);
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  return Boolean(win);
}

/** Copies a PNG blob to the clipboard. Returns false where image clipboard writes are unsupported. */
export async function copyBlobToClipboard(blob: Blob): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !navigator.clipboard || typeof ClipboardItem === 'undefined') return false;
    await navigator.clipboard.write([new ClipboardItem({ [blob.type || 'image/png']: blob })]);
    return true;
  } catch {
    return false;
  }
}

export function blobToFile(blob: Blob, filename: string): File {
  return new File([blob], filename, { type: blob.type || 'image/png' });
}

export async function downloadPdf(node: HTMLElement, filename: string): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const { dataUrl, width, height } = await nodeToPdfDataUrl(node);
  const orientation = width >= height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({ orientation, unit: 'px', format: [width, height] });
  pdf.addImage(dataUrl, 'JPEG', 0, 0, width, height);
  pdf.save(filename);
}

export async function printNode(node: HTMLElement): Promise<void> {
  const dataUrl = await nodeToPng(node, 2);
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(
    `<html><head><title>ExploreBD</title><style>@page{margin:0}body{margin:0}img{width:100%;height:auto}</style></head><body><img src="${dataUrl}" onload="window.print()"/></body></html>`,
  );
  win.document.close();
}
