import type { FontPreset } from '../types';

const loadedFonts = new Set<string>();
const loadingPromises = new Map<string, Promise<boolean>>();

export async function loadFont(font: FontPreset): Promise<boolean> {
  if (loadedFonts.has(font.family)) {
    return true;
  }

  const existingPromise = loadingPromises.get(font.family);
  if (existingPromise) {
    return existingPromise;
  }

  const loadPromise = (async (): Promise<boolean> => {
    try {
      if (font.source === 'google') {
        await loadGoogleFont(font);
      } else if (font.source === 'custom' && font.fontUrl) {
        await loadCustomFont(font);
      } else {
        return await checkFontAvailable(font.family);
      }
      loadedFonts.add(font.family);
      return true;
    } catch (error) {
      console.warn(`Failed to load font: ${font.family}`, error);
      return false;
    } finally {
      loadingPromises.delete(font.family);
    }
  })();

  loadingPromises.set(font.family, loadPromise);
  return loadPromise;
}

export async function loadFonts(fonts: FontPreset[]): Promise<Map<string, boolean>> {
  const results = new Map<string, boolean>();
  const promises = fonts.map(async (font) => {
    const success = await loadFont(font);
    results.set(font.family, success);
  });
  await Promise.all(promises);
  return results;
}

async function loadGoogleFont(font: FontPreset): Promise<void> {
  const familyEncoded = encodeURIComponent(font.family).replace(/%20/g, '+');
  const weights = font.fontWeight ? `:wght@${font.fontWeight}` : ':wght@400;500;600;700';
  const url = `https://fonts.googleapis.com/css2?family=${familyEncoded}${weights}&display=swap`;

  const existingLink = document.querySelector(`link[data-google-font="${font.family}"]`);
  if (existingLink) {
    await waitForFont(font.family, 3000);
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  link.setAttribute('data-google-font', font.family);
  document.head.appendChild(link);

  await waitForFont(font.family, 5000);
}

async function loadCustomFont(font: FontPreset): Promise<void> {
  if (!font.fontUrl) {
    throw new Error('Custom font requires fontUrl');
  }

  const fontFace = new FontFace(
    font.family,
    `url(${font.fontUrl})`,
    {
      weight: font.fontWeight ? font.fontWeight.toString() : '400',
      style: font.fontStyle || 'normal',
    }
  );

  const loadedFace = await fontFace.load();
  if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.add(loadedFace);
  }
}

async function checkFontAvailable(family: string): Promise<boolean> {
  if (typeof document === 'undefined' || !document.fonts) {
    return false;
  }

  try {
    const result = await document.fonts.load(`16px "${family}"`);
    return result.length > 0;
  } catch {
    return false;
  }
}

function waitForFont(family: string, timeoutMs: number = 3000): Promise<void> {
  return new Promise((resolve) => {
    const startTime = Date.now();

    const check = () => {
      if (typeof document !== 'undefined' && document.fonts) {
        document.fonts.load(`16px "${family}"`).then((result) => {
          if (result.length > 0) {
            resolve();
          } else if (Date.now() - startTime > timeoutMs) {
            resolve();
          } else {
            setTimeout(check, 100);
          }
        }).catch(() => {
          if (Date.now() - startTime > timeoutMs) {
            resolve();
          } else {
            setTimeout(check, 100);
          }
        });
      } else {
        resolve();
      }
    };

    check();
  });
}

export function isFontLoaded(family: string): boolean {
  return loadedFonts.has(family);
}

export function getLoadedFonts(): string[] {
  return Array.from(loadedFonts);
}

export function resetLoadedFonts(): void {
  loadedFonts.clear();
  loadingPromises.clear();
}
