export type SharePlatform = 'facebook' | 'x' | 'whatsapp' | 'telegram' | 'linkedin' | 'reddit';

export const sharePlatforms: SharePlatform[] = ['facebook', 'x', 'whatsapp', 'telegram', 'linkedin', 'reddit'];

export const platformLabels: Record<SharePlatform, string> = {
  facebook: 'Facebook',
  x: 'X',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  linkedin: 'LinkedIn',
  reddit: 'Reddit',
};

/** Builds the platform-specific share intent URL. */
export function platformShareUrl(platform: SharePlatform, url: string, text: string): string {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  switch (platform) {
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${u}&quote=${t}`;
    case 'x':
      return `https://twitter.com/intent/tweet?text=${t}&url=${u}&hashtags=ExploreBD,Bangladesh`;
    case 'whatsapp':
      return `https://wa.me/?text=${t}%0A${u}`;
    case 'telegram':
      return `https://t.me/share/url?url=${u}&text=${t}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case 'reddit':
      return `https://www.reddit.com/submit?url=${u}&title=${t}`;
    default:
      return url;
  }
}

export function openShareWindow(platform: SharePlatform, url: string, text: string): void {
  const intent = platformShareUrl(platform, url, text);
  window.open(intent, '_blank', 'noopener,noreferrer,width=720,height=640');
}

export interface NativeShareData {
  title: string;
  text: string;
  url: string;
  file?: File;
}

export function canNativeShare(data: NativeShareData): boolean {
  if (typeof navigator === 'undefined' || !('share' in navigator)) return false;
  if (data.file && 'canShare' in navigator) {
    try {
      return navigator.canShare({ files: [data.file] });
    } catch {
      return false;
    }
  }
  return true;
}

/** Uses the Web Share API when available (mobile), returns false otherwise. */
export async function nativeShare(data: NativeShareData): Promise<boolean> {
  if (!canNativeShare(data)) return false;
  try {
    const payload: ShareData = { title: data.title, text: data.text, url: data.url };
    if (data.file && 'canShare' in navigator && navigator.canShare({ files: [data.file] })) {
      payload.files = [data.file];
    }
    await navigator.share(payload);
    return true;
  } catch {
    return false;
  }
}

export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [meta, base64] = dataUrl.split(',');
  const mime = /:(.*?);/.exec(meta ?? '')?.[1] ?? 'image/png';
  const binary = atob(base64 ?? '');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}
