import type { FilterType } from '@/types'
import { hexToRgb } from './canvasUtils'

export function applyFilter(
  ctx: CanvasRenderingContext2D,
  filter: FilterType,
  intensity: number,
  inkColor: string
) {
  if (filter === 'none' || intensity <= 0) return

  const canvas = ctx.canvas
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  const ink = hexToRgb(inkColor)

  switch (filter) {
    case 'inkBleed':
      applyInkBleed(data, canvas.width, canvas.height, intensity, ink)
      break
    case 'pencilSketch':
      applyPencilSketch(data, canvas.width, canvas.height, intensity)
      break
    case 'penStroke':
      applyPenStroke(data, canvas.width, canvas.height, intensity, ink)
      break
    case 'brushStroke':
      applyBrushStroke(data, canvas.width, canvas.height, intensity, ink)
      break
    case 'watercolor':
      applyWatercolor(data, canvas.width, canvas.height, intensity, ink)
      break
    case 'carbonCopy':
      applyCarbonCopy(data, intensity)
      break
    case 'fountainPen':
      applyFountainPen(data, canvas.width, canvas.height, intensity, ink)
      break
    case 'crayon':
      applyCrayon(data, canvas.width, canvas.height, intensity, ink)
      break
    case 'marker':
      applyMarker(data, canvas.width, canvas.height, intensity, ink)
      break
  }

  ctx.putImageData(imageData, 0, 0)
}

function isInkPixel(r: number, g: number, b: number, ink: { r: number; g: number; b: number }): boolean {
  const dist = Math.sqrt(
    Math.pow(r - ink.r, 2) + Math.pow(g - ink.g, 2) + Math.pow(b - ink.b, 2)
  )
  return dist < 100 || (r < 150 && g < 150 && b < 150)
}

function applyInkBleed(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  intensity: number,
  ink: { r: number; g: number; b: number }
) {
  const temp = new Uint8ClampedArray(data)
  const bleedAmount = Math.floor(3 + intensity * 5)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      if (!isInkPixel(temp[idx], temp[idx + 1], temp[idx + 2], ink)) continue

      for (let dy = -bleedAmount; dy <= bleedAmount; dy++) {
        for (let dx = -bleedAmount; dx <= bleedAmount; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > bleedAmount) continue

          const nIdx = (ny * width + nx) * 4
          const bleedFactor = (1 - dist / bleedAmount) * intensity * 0.35

          if (!isInkPixel(temp[nIdx], temp[nIdx + 1], temp[nIdx + 2], ink)) {
            data[nIdx] = Math.min(255, temp[nIdx] + ink.r * bleedFactor)
            data[nIdx + 1] = Math.min(255, temp[nIdx + 1] + ink.g * bleedFactor)
            data[nIdx + 2] = Math.min(255, temp[nIdx + 2] + ink.b * bleedFactor)
            data[nIdx + 3] = Math.max(data[nIdx + 3], 255 * bleedFactor * 0.6)
          }
        }
      }
    }
  }

  for (let i = 0; i < data.length; i += 4) {
    if (isInkPixel(data[i], data[i + 1], data[i + 2], ink)) {
      const jitter = (Math.random() - 0.5) * intensity * 20
      data[i] = Math.max(0, Math.min(255, data[i] + jitter))
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + jitter))
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + jitter))
    }
  }
}

function applyPencilSketch(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  intensity: number
) {
  const temp = new Uint8ClampedArray(data)

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4

      const tl = temp[((y - 1) * width + (x - 1)) * 4]
      const tc = temp[((y - 1) * width + x) * 4]
      const tr = temp[((y - 1) * width + (x + 1)) * 4]
      const ml = temp[(y * width + (x - 1)) * 4]
      const mr = temp[(y * width + (x + 1)) * 4]
      const bl = temp[((y + 1) * width + (x - 1)) * 4]
      const bc = temp[((y + 1) * width + x) * 4]
      const br = temp[((y + 1) * width + (x + 1)) * 4]

      const gx = -tl - 2 * ml - bl + tr + 2 * mr + br
      const gy = -tl - 2 * tc - tr + bl + 2 * bc + br
      const edge = Math.sqrt(gx * gx + gy * gy) * intensity

      const bg = 250 - Math.random() * 15 * intensity
      const shade = Math.max(0, bg - edge * 1.5)
      const grain = (Math.random() - 0.5) * 20 * intensity

      data[idx] = Math.max(0, Math.min(255, shade + grain))
      data[idx + 1] = Math.max(0, Math.min(255, shade - 5 + grain))
      data[idx + 2] = Math.max(0, Math.min(255, shade - 10 + grain))
    }
  }
}

function applyPenStroke(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  intensity: number,
  ink: { r: number; g: number; b: number }
) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      if (!isInkPixel(data[idx], data[idx + 1], data[idx + 2], ink)) continue

      const pressure = Math.random() * intensity
      const darken = 1 - pressure * 0.3

      data[idx] = Math.max(0, Math.floor(ink.r * darken))
      data[idx + 1] = Math.max(0, Math.floor(ink.g * darken))
      data[idx + 2] = Math.max(0, Math.floor(ink.b * darken))

      if (Math.random() < intensity * 0.08) {
        data[idx + 3] = Math.floor(data[idx + 3] * (0.5 + Math.random() * 0.5))
      }
    }
  }

  const temp = new Uint8ClampedArray(data)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4
      if (isInkPixel(data[idx], data[idx + 1], data[idx + 2], ink)) continue

      let inkNeighbors = 0
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nIdx = ((y + dy) * width + (x + dx)) * 4
          if (isInkPixel(temp[nIdx], temp[nIdx + 1], temp[nIdx + 2], ink)) inkNeighbors++
        }
      }

      if (inkNeighbors > 0 && Math.random() < inkNeighbors * intensity * 0.05) {
        const factor = Math.random() * intensity * 0.3
        data[idx] = Math.min(255, Math.floor(ink.r * factor))
        data[idx + 1] = Math.min(255, Math.floor(ink.g * factor))
        data[idx + 2] = Math.min(255, Math.floor(ink.b * factor))
        data[idx + 3] = Math.floor(255 * factor)
      }
    }
  }
}

function applyBrushStroke(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  intensity: number,
  ink: { r: number; g: number; b: number }
) {
  const temp = new Uint8ClampedArray(data)
  const brushRadius = Math.floor(2 + intensity * 4)

  for (let y = brushRadius; y < height - brushRadius; y++) {
    for (let x = brushRadius; x < width - brushRadius; x++) {
      const idx = (y * width + x) * 4
      if (!isInkPixel(temp[idx], temp[idx + 1], temp[idx + 2], ink)) continue

      for (let dy = -brushRadius; dy <= brushRadius; dy++) {
        for (let dx = -brushRadius; dx <= brushRadius; dx++) {
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist > brushRadius) continue

          const nIdx = ((y + dy) * width + (x + dx)) * 4
          const brushFactor = (1 - dist / brushRadius) * intensity * 0.5

          if (!isInkPixel(temp[nIdx], temp[nIdx + 1], temp[nIdx + 2], ink)) {
            data[nIdx] = Math.min(255, temp[nIdx] + ink.r * brushFactor)
            data[nIdx + 1] = Math.min(255, temp[nIdx + 1] + ink.g * brushFactor)
            data[nIdx + 2] = Math.min(255, temp[nIdx + 2] + ink.b * brushFactor)
            data[nIdx + 3] = Math.max(data[nIdx + 3], 255 * brushFactor * 0.7)
          } else {
            const dry = Math.random() * intensity * 0.15
            data[nIdx] = Math.min(255, data[nIdx] + ink.r * dry)
            data[nIdx + 1] = Math.min(255, data[nIdx + 1] + ink.g * dry)
          }
        }
      }
    }
  }
}

function applyWatercolor(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  intensity: number,
  ink: { r: number; g: number; b: number }
) {
  const temp = new Uint8ClampedArray(data)
  const radius = Math.floor(4 + intensity * 8)

  for (let y = radius; y < height - radius; y += 2) {
    for (let x = radius; x < width - radius; x += 2) {
      const idx = (y * width + x) * 4
      if (!isInkPixel(temp[idx], temp[idx + 1], temp[idx + 2], ink)) continue

      const randR = radius + Math.floor((Math.random() - 0.5) * radius * 0.6)
      const randG = radius + Math.floor((Math.random() - 0.5) * radius * 0.6)
      const randB = radius + Math.floor((Math.random() - 0.5) * radius * 0.6)

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const distR = Math.sqrt(dx * dx + dy * dy)
          if (distR > randR) continue

          const nIdx = ((y + dy) * width + (x + dx)) * 4
          const factor = (1 - distR / randR) * intensity * 0.4
          const gFactor = (1 - Math.min(distR, randG) / randG) * intensity * 0.35
          const bFactor = (1 - Math.min(distR, randB) / randB) * intensity * 0.45

          if (!isInkPixel(temp[nIdx], temp[nIdx + 1], temp[nIdx + 2], ink)) {
            data[nIdx] = Math.min(255, temp[nIdx] + ink.r * factor)
            data[nIdx + 1] = Math.min(255, temp[nIdx + 1] + ink.g * gFactor)
            data[nIdx + 2] = Math.min(255, temp[nIdx + 2] + ink.b * bFactor)
            data[nIdx + 3] = Math.max(data[nIdx + 3], 255 * Math.max(factor, gFactor, bFactor) * 0.5)
          }
        }
      }
    }
  }

  for (let i = 0; i < data.length; i += 4) {
    const wet = (Math.random() - 0.5) * intensity * 25
    data[i] = Math.max(0, Math.min(255, data[i] + wet))
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + wet * 0.8))
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + wet * 0.6))
  }
}

function applyCarbonCopy(data: Uint8ClampedArray, intensity: number) {
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114

    if (gray < 200) {
      const blueShift = intensity * 60
      const grain = (Math.random() - 0.5) * intensity * 30
      data[i] = Math.max(0, Math.min(255, gray * 0.6 + grain))
      data[i + 1] = Math.max(0, Math.min(255, gray * 0.75 + grain))
      data[i + 2] = Math.max(0, Math.min(255, gray + blueShift + grain))
    } else {
      const fade = 255 - (255 - gray) * (1 - intensity * 0.3)
      data[i] = fade
      data[i + 1] = fade
      data[i + 2] = Math.min(255, fade + 5)
    }
  }
}

function applyFountainPen(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  intensity: number,
  ink: { r: number; g: number; b: number }
) {
  const temp = new Uint8ClampedArray(data)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4
      if (!isInkPixel(data[idx], data[idx + 1], data[idx + 2], ink)) continue

      let flowVariation = 0
      if (x > 0) {
        const leftIdx = (y * width + (x - 1)) * 4
        if (!isInkPixel(temp[leftIdx], temp[leftIdx + 1], temp[leftIdx + 2], ink)) {
          flowVariation = intensity * 0.4
        }
      }

      const nibWidth = Math.random() * intensity
      const factor = 1 - flowVariation - nibWidth * 0.2 + Math.random() * intensity * 0.1

      data[idx] = Math.max(0, Math.min(255, Math.floor(ink.r * factor)))
      data[idx + 1] = Math.max(0, Math.min(255, Math.floor(ink.g * factor)))
      data[idx + 2] = Math.max(0, Math.min(255, Math.floor(ink.b * factor)))

      if (Math.random() < intensity * 0.05) {
        data[idx + 3] = Math.floor(data[idx + 3] * 0.3)
      }
    }
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4
      if (isInkPixel(data[idx], data[idx + 1], data[idx + 2], ink)) continue

      let hasInkLeft = false
      for (let dx = -3; dx < 0; dx++) {
        const nIdx = (y * width + (x + dx)) * 4
        if (isInkPixel(temp[nIdx], temp[nIdx + 1], temp[nIdx + 2], ink)) {
          hasInkLeft = true
          break
        }
      }

      if (hasInkLeft && Math.random() < intensity * 0.15) {
        const feather = Math.random() * intensity * 0.2
        data[idx] = Math.floor(ink.r * feather)
        data[idx + 1] = Math.floor(ink.g * feather)
        data[idx + 2] = Math.floor(ink.b * feather)
        data[idx + 3] = Math.floor(255 * feather)
      }
    }
  }
}

function applyCrayon(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  intensity: number,
  ink: { r: number; g: number; b: number }
) {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4

      const baseGray = 248
      const paperGrain = (Math.random() - 0.5) * 15 * intensity
      const baseR = baseGray + paperGrain
      const baseG = baseGray - 3 + paperGrain
      const baseB = baseGray - 8 + paperGrain

      if (isInkPixel(data[idx], data[idx + 1], data[idx + 2], ink)) {
        const crayonTexture = Math.random()
        if (crayonTexture < 0.75 * intensity) {
          const waxSpread = 0.6 + Math.random() * 0.4
          const jitter = (Math.random() - 0.5) * intensity * 40
          data[idx] = Math.max(0, Math.min(255, ink.r * waxSpread + jitter))
          data[idx + 1] = Math.max(0, Math.min(255, ink.g * waxSpread + jitter))
          data[idx + 2] = Math.max(0, Math.min(255, ink.b * waxSpread + jitter))
        } else {
          data[idx] = baseR
          data[idx + 1] = baseG
          data[idx + 2] = baseB
        }
      } else {
        data[idx] = Math.min(255, baseR)
        data[idx + 1] = Math.min(255, baseG)
        data[idx + 2] = Math.min(255, baseB)
      }
    }
  }
}

function applyMarker(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  intensity: number,
  ink: { r: number; g: number; b: number }
) {
  const temp = new Uint8ClampedArray(data)
  const markerWidth = Math.floor(1 + intensity * 3)

  for (let y = markerWidth; y < height - markerWidth; y++) {
    for (let x = markerWidth; x < width - markerWidth; x++) {
      const idx = (y * width + x) * 4
      if (!isInkPixel(temp[idx], temp[idx + 1], temp[idx + 2], ink)) continue

      for (let dy = -markerWidth; dy <= markerWidth; dy++) {
        for (let dx = -markerWidth; dx <= markerWidth; dx++) {
          const dist = Math.abs(dx) + Math.abs(dy)
          if (dist > markerWidth) continue

          const nIdx = ((y + dy) * width + (x + dx)) * 4
          const alpha = (1 - dist / (markerWidth + 1)) * intensity * 0.65

          if (!isInkPixel(temp[nIdx], temp[nIdx + 1], temp[nIdx + 2], ink)) {
            data[nIdx] = Math.min(255, temp[nIdx] + (ink.r - temp[nIdx]) * alpha)
            data[nIdx + 1] = Math.min(255, temp[nIdx + 1] + (ink.g - temp[nIdx + 1]) * alpha)
            data[nIdx + 2] = Math.min(255, temp[nIdx + 2] + (ink.b - temp[nIdx + 2]) * alpha)
          }
        }
      }
    }
  }

  for (let i = 0; i < data.length; i += 4) {
    if (isInkPixel(data[i], data[i + 1], data[i + 2], ink)) {
      const vivid = 1 + intensity * 0.15
      data[i] = Math.min(255, Math.floor(data[i] * vivid))
      data[i + 1] = Math.min(255, Math.floor(data[i + 1] * vivid))
      data[i + 2] = Math.min(255, Math.floor(data[i + 2] * vivid))
    }
  }
}
