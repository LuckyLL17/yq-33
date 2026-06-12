import type { PaperConfig, FontConfig } from '@/types';

export function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function drawPaperBackground(
  ctx: CanvasRenderingContext2D,
  config: PaperConfig,
  pageWidth: number,
  pageHeight: number
): void {
  const { type, bgColor, lineColor, lineSpacing } = config;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, pageWidth, pageHeight);

  switch (type) {
    case 'line': {
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 0.5;
      for (let y = lineSpacing; y < pageHeight; y += lineSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(pageWidth, y);
        ctx.stroke();
      }
      break;
    }
    case 'grid': {
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 0.5;
      for (let y = lineSpacing; y < pageHeight; y += lineSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(pageWidth, y);
        ctx.stroke();
      }
      for (let x = lineSpacing; x < pageWidth; x += lineSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, pageHeight);
        ctx.stroke();
      }
      break;
    }
    case 'kraft': {
      const gradient = ctx.createLinearGradient(0, 0, pageWidth, pageHeight);
      gradient.addColorStop(0, '#d4b896');
      gradient.addColorStop(0.5, '#c9a878');
      gradient.addColorStop(1, '#bfa068');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, pageWidth, pageHeight);
      break;
    }
    case 'dotted': {
      ctx.fillStyle = lineColor;
      const dotRadius = 1;
      const dotSpacing = lineSpacing;
      for (let y = dotSpacing; y < pageHeight; y += dotSpacing) {
        for (let x = dotSpacing; x < pageWidth; x += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case 'blank':
    default:
      break;
  }
}

export function drawPaperMargin(
  ctx: CanvasRenderingContext2D,
  config: PaperConfig,
  pageHeight: number
): void {
  if (!config.showMargin) return;

  const marginX = 60;
  const marginColor = config.marginColor || '#e74c3c';

  ctx.strokeStyle = marginColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(marginX, 0);
  ctx.lineTo(marginX, pageHeight);
  ctx.stroke();

  const holeRadius = 6;
  const holeY1 = pageHeight * 0.2;
  const holeY2 = pageHeight * 0.5;
  const holeY3 = pageHeight * 0.8;
  const holeX = marginX - 20;

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;

  [holeY1, holeY2, holeY3].forEach((y) => {
    ctx.beginPath();
    ctx.arc(holeX, y, holeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
}

export function drawPaperTexture(
  ctx: CanvasRenderingContext2D,
  pageWidth: number,
  pageHeight: number
): void {
  const imageData = ctx.getImageData(0, 0, pageWidth, pageHeight);
  const data = imageData.data;
  const rand = seededRandom(Date.now() % 100000);

  for (let i = 0; i < data.length; i += 4) {
    const noise = (rand() - 0.5) * 12;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }

  ctx.putImageData(imageData, 0, 0);
}

export function drawHandwrittenChar(
  ctx: CanvasRenderingContext2D,
  char: string,
  x: number,
  y: number,
  fontConfig: FontConfig,
  jitterSeed: number
): void {
  const rand = seededRandom(jitterSeed);
  const jitter = fontConfig.jitter;

  const offsetX = (rand() - 0.5) * 3 * jitter;
  const offsetY = (rand() - 0.5) * 2 * jitter;
  const rotation = (rand() - 0.5) * 0.05 * jitter;
  const weightVariation = 1 + (rand() - 0.5) * 0.15 * jitter;

  ctx.save();
  ctx.translate(x + offsetX, y + offsetY);
  ctx.rotate(rotation);

  ctx.fillStyle = fontConfig.color;
  ctx.font = `${Math.round(fontConfig.weight * weightVariation)} ${fontConfig.size}px ${fontConfig.family}`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(char, 0, 0);

  ctx.restore();
}
