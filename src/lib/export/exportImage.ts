import { toJpeg, toPng, toCanvas } from 'html-to-image';

export async function nodeToPng(node: HTMLElement, pixelRatio = 2): Promise<string> {
  return toPng(node, {
    pixelRatio,
    cacheBust: true,
    backgroundColor: undefined,
  });
}

export async function nodeToJpeg(node: HTMLElement, pixelRatio = 2, quality = 0.94): Promise<string> {
  return toJpeg(node, {
    pixelRatio,
    quality,
    cacheBust: true,
    backgroundColor: '#ffffff',
  });
}

export async function nodeToPdfDataUrl(node: HTMLElement, pixelRatio = 2): Promise<{ dataUrl: string; width: number; height: number }> {
  const canvas = await toCanvas(node, { pixelRatio, cacheBust: true });
  return { dataUrl: canvas.toDataURL('image/jpeg', 0.95), width: canvas.width, height: canvas.height };
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

/** Copies a PNG data URL to the clipboard (image/png). Returns false if unsupported. */
export async function copyImageToClipboard(dataUrl: string): Promise<boolean> {
  try {
    if (typeof navigator === 'undefined' || !navigator.clipboard || typeof ClipboardItem === 'undefined') return false;
    const blob = await (await fetch(dataUrl)).blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type || 'image/png']: blob })]);
    return true;
  } catch {
    return false;
  }
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
