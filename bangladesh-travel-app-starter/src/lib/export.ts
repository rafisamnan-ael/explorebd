import { toJpeg, toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export async function exportNode(node: HTMLElement, type: 'png' | 'jpg' | 'pdf') {
  const dataUrl = type === 'jpg'
    ? await toJpeg(node, { quality: 0.95, pixelRatio: 2 })
    : await toPng(node, { pixelRatio: 2 });

  if (type === 'pdf') {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [node.offsetWidth, node.offsetHeight] });
    pdf.addImage(dataUrl, 'PNG', 0, 0, node.offsetWidth, node.offsetHeight);
    pdf.save('my-bangladesh-travel-map.pdf');
    return;
  }

  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `my-bangladesh-travel-map.${type === 'jpg' ? 'jpg' : 'png'}`;
  a.click();
}
