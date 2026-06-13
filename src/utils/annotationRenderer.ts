import type {
  Annotation,
  AnnotationStyle,
  PathAnnotation,
  ShapeAnnotation,
  LineAnnotation,
  UnderlineAnnotation,
  TextAnnotation,
} from '@/store/useWorkspaceStore'

interface DrawAnnotationOptions {
  ctx: CanvasRenderingContext2D
  annotation: Annotation
}

function applyStyle(ctx: CanvasRenderingContext2D, style: AnnotationStyle) {
  ctx.strokeStyle = style.color
  ctx.lineWidth = style.strokeWidth
  ctx.globalAlpha = style.opacity ?? 1
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

function drawPath(ctx: CanvasRenderingContext2D, ann: PathAnnotation) {
  if (ann.points.length < 2) {
    if (ann.points.length === 1) {
      applyStyle(ctx, ann.style)
      ctx.fillStyle = ann.style.color
      ctx.beginPath()
      ctx.arc(ann.points[0].x, ann.points[0].y, ann.style.strokeWidth / 2, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1
    }
    return
  }
  applyStyle(ctx, ann.style)
  ctx.beginPath()
  ctx.moveTo(ann.points[0].x, ann.points[0].y)
  for (let i = 1; i < ann.points.length; i++) {
    ctx.lineTo(ann.points[i].x, ann.points[i].y)
  }
  ctx.stroke()
  ctx.globalAlpha = 1
}

function drawShape(ctx: CanvasRenderingContext2D, ann: ShapeAnnotation) {
  applyStyle(ctx, ann.style)
  ctx.fillStyle = ann.style.fillColor || 'transparent'
  ctx.beginPath()
  if (ann.type === 'circle') {
    const cx = ann.x + ann.width / 2
    const cy = ann.y + ann.height / 2
    const rx = Math.abs(ann.width) / 2
    const ry = Math.abs(ann.height) / 2
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
  } else {
    ctx.rect(ann.x, ann.y, ann.width, ann.height)
  }
  if (ann.style.fillColor) {
    ctx.fill()
  }
  ctx.stroke()
  ctx.globalAlpha = 1
}

function drawLine(ctx: CanvasRenderingContext2D, ann: LineAnnotation) {
  applyStyle(ctx, ann.style)
  ctx.beginPath()
  ctx.moveTo(ann.x1, ann.y1)
  ctx.lineTo(ann.x2, ann.y2)
  ctx.stroke()

  if (ann.type === 'arrow') {
    const headLen = ann.style.strokeWidth * 6
    const angle = Math.atan2(ann.y2 - ann.y1, ann.x2 - ann.x1)
    ctx.fillStyle = ann.style.color
    ctx.beginPath()
    ctx.moveTo(ann.x2, ann.y2)
    ctx.lineTo(
      ann.x2 - headLen * Math.cos(angle - Math.PI / 6),
      ann.y2 - headLen * Math.sin(angle - Math.PI / 6)
    )
    ctx.lineTo(
      ann.x2 - headLen * Math.cos(angle + Math.PI / 6),
      ann.y2 - headLen * Math.sin(angle + Math.PI / 6)
    )
    ctx.closePath()
    ctx.fill()
  }
  ctx.globalAlpha = 1
}

function drawUnderline(ctx: CanvasRenderingContext2D, ann: UnderlineAnnotation) {
  applyStyle(ctx, ann.style)
  const { x, y, width } = ann
  const step = 6
  const amplitude = 3
  ctx.beginPath()

  if (ann.type === 'underline') {
    ctx.moveTo(x, y)
    ctx.lineTo(x + width, y)
    ctx.stroke()
  } else {
    ctx.moveTo(x, y)
    let currentX = x
    let goingUp = true
    while (currentX < x + width) {
      const nextX = Math.min(currentX + step, x + width)
      const midX = (currentX + nextX) / 2
      const midY = y + (goingUp ? -amplitude : amplitude)
      ctx.quadraticCurveTo(midX, midY, nextX, y)
      currentX = nextX
      goingUp = !goingUp
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

function drawText(ctx: CanvasRenderingContext2D, ann: TextAnnotation) {
  applyStyle(ctx, ann.style)
  ctx.fillStyle = ann.style.color
  const fontSize = ann.style.fontSize || 20
  const fontFamily = ann.style.fontFamily || '"Ma Shan Zheng", "KaiTi", cursive, serif'
  ctx.font = `400 ${fontSize}px ${fontFamily}`
  ctx.textBaseline = 'top'
  ctx.fillText(ann.text, ann.x, ann.y)
  ctx.globalAlpha = 1
}

export function drawAnnotation({ ctx, annotation }: DrawAnnotationOptions) {
  switch (annotation.type) {
    case 'path':
    case 'highlight':
      drawPath(ctx, annotation)
      break
    case 'circle':
    case 'rect':
      drawShape(ctx, annotation)
      break
    case 'line':
    case 'arrow':
      drawLine(ctx, annotation)
      break
    case 'underline':
    case 'wavy':
      drawUnderline(ctx, annotation)
      break
    case 'text':
      drawText(ctx, annotation)
      break
  }
}

interface DrawAnnotationsForPageOptions {
  ctx: CanvasRenderingContext2D
  pageIdx: number
  annotations: Annotation[]
}

export function drawAnnotationsForPage({
  ctx,
  pageIdx,
  annotations,
}: DrawAnnotationsForPageOptions) {
  const pageAnns = annotations.filter((a) => a.pageIndex === pageIdx)
  pageAnns.forEach((ann) => drawAnnotation({ ctx, annotation: ann }))
}
