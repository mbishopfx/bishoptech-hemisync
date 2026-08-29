import { getPublicTone } from './tone-capability.js';
import { SCIENCE_GUIDE_SLIDES, SCIENCE_GUIDE_SOURCES } from './science-content.js';
import { createOceanProfile } from '../../components/science/vgpu-ocean/ocean-profile.js';

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const PAGE_MARGIN = 48;
const PUBLIC_STATES = new Set(['delta', 'theta', 'alpha', 'beta', 'gamma']);
const COLORS = {
  deep: [0.063, 0.133, 0.114],
  ocean: [0.016, 0.105, 0.125],
  oceanMid: [0.028, 0.19, 0.22],
  mint: [0.714, 0.867, 0.8],
  sand: [0.878, 0.706, 0.576],
  ink: [0.063, 0.133, 0.114],
  body: [0.20, 0.31, 0.28],
  quiet: [0.39, 0.48, 0.44],
  line: [0.80, 0.86, 0.83],
  paper: [0.965, 0.978, 0.968],
  white: [0.95, 0.98, 0.96]
};

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function rounded(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function numberOr(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function pdfNumber(value) {
  return Number(numberOr(value, 0).toFixed(3));
}

function pdfColor(color, mode = 'fill') {
  return `${color.map(pdfNumber).join(' ')} ${mode === 'stroke' ? 'RG' : 'rg'}`;
}

function ascii(value) {
  return String(value ?? '')
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/·/g, '-')
    .replace(/×/g, 'x')
    .replace(/°/g, ' deg')
    .replace(/≈/g, 'about')
    .replace(/→/g, '->')
    .replace(/…/g, '...')
    .replace(/[^\x20-\x7E]/g, '?');
}

function escapePdfText(value) {
  return ascii(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function hash32(value) {
  let next = value >>> 0;
  next ^= next >>> 16;
  next = Math.imul(next, 0x7feb352d);
  next ^= next >>> 15;
  next = Math.imul(next, 0x846ca68b);
  next ^= next >>> 16;
  return next >>> 0;
}

function unit(seed, salt) {
  return hash32((seed ^ Math.imul(salt, 0x9e3779b9)) >>> 0) / 0x100000000;
}

function safeDate(value) {
  const candidate = value ? new Date(value) : new Date();
  return Number.isNaN(candidate.getTime()) ? new Date() : candidate;
}

export function normalizeScienceGuidePdfInput(input = {}) {
  const toneId = String(input?.toneId || input?.tone?.id || '').trim().slice(0, 120);
  const tone = toneId ? getPublicTone(toneId) : null;
  const requestedState = String(input?.controls?.targetState || input?.targetState || input?.state || tone?.state || 'theta').toLowerCase();
  const targetState = PUBLIC_STATES.has(requestedState) ? requestedState : 'theta';
  const controls = {
    targetState,
    carrierHz: Math.round(clamp(numberOr(input?.controls?.carrierHz ?? input?.carrierHz, tone?.baseFreqHz ?? 200), 100, 400)),
    beatHz: rounded(clamp(numberOr(input?.controls?.beatHz ?? input?.beatHz, tone?.targetHz ?? 6), 0.5, 40), 1),
    volume: Math.round(clamp(numberOr(input?.controls?.volume ?? input?.volume, 72), 0, 100))
  };
  const seed = input?.ocean?.seed ?? input?.ocean?.runSeed ?? input?.oceanSeed;

  return {
    tone,
    controls,
    ocean: createOceanProfile(seed),
    generatedAt: safeDate(input?.generatedAt)
  };
}

export function scienceGuidePdfFilename(model) {
  const runLabel = String(model?.ocean?.runLabel || model?.ocean?.label || 'snapshot')
    .replace(/[^A-Za-z0-9_-]/g, '')
    .slice(0, 24) || 'snapshot';
  return `cognistration-science-guide-${runLabel}.pdf`;
}

class PdfPage {
  constructor(background) {
    this.commands = [];
    if (background) this.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, { fill: background });
  }

  add(command) {
    this.commands.push(command);
  }

  rect(x, y, width, height, { fill = null, stroke = null, lineWidth = 1 } = {}) {
    if (fill) this.add(pdfColor(fill));
    if (stroke) this.add(`${pdfColor(stroke, 'stroke')} ${pdfNumber(lineWidth)} w`);
    const operators = [fill ? 'f' : null, stroke ? 'S' : null].filter(Boolean).join(' ');
    this.add(`${pdfNumber(x)} ${pdfNumber(y)} ${pdfNumber(width)} ${pdfNumber(height)} re ${operators}`.trim());
  }

  line(x1, y1, x2, y2, { stroke = COLORS.line, lineWidth = 1 } = {}) {
    this.add(`${pdfColor(stroke, 'stroke')} ${pdfNumber(lineWidth)} w ${pdfNumber(x1)} ${pdfNumber(y1)} m ${pdfNumber(x2)} ${pdfNumber(y2)} l S`);
  }

  path(commands, { stroke = null, fill = null, lineWidth = 1 } = {}) {
    if (fill) this.add(pdfColor(fill));
    if (stroke) this.add(`${pdfColor(stroke, 'stroke')} ${pdfNumber(lineWidth)} w`);
    const operators = [fill ? 'f' : null, stroke ? 'S' : null].filter(Boolean).join(' ');
    this.add(`${commands.join(' ')} ${operators}`.trim());
  }

  circle(cx, cy, radius, { fill = null, stroke = null, lineWidth = 1 } = {}) {
    const k = 0.5522848;
    const r = pdfNumber(radius);
    this.path([
      `${pdfNumber(cx + r)} ${pdfNumber(cy)} m`,
      `${pdfNumber(cx + r)} ${pdfNumber(cy + r * k)} ${pdfNumber(cx + r * k)} ${pdfNumber(cy + r)} ${pdfNumber(cx)} ${pdfNumber(cy + r)} c`,
      `${pdfNumber(cx - r * k)} ${pdfNumber(cy + r)} ${pdfNumber(cx - r)} ${pdfNumber(cy + r * k)} ${pdfNumber(cx - r)} ${pdfNumber(cy)} c`,
      `${pdfNumber(cx - r)} ${pdfNumber(cy - r * k)} ${pdfNumber(cx - r * k)} ${pdfNumber(cy - r)} ${pdfNumber(cx)} ${pdfNumber(cy - r)} c`,
      `${pdfNumber(cx + r * k)} ${pdfNumber(cy - r)} ${pdfNumber(cx + r)} ${pdfNumber(cy - r * k)} ${pdfNumber(cx + r)} ${pdfNumber(cy)} c`
    ], { fill, stroke, lineWidth });
  }

  text(value, x, y, { size = 11, color = COLORS.body, font = 'F1' } = {}) {
    this.add(`${pdfColor(color)} BT /${font} ${pdfNumber(size)} Tf 1 0 0 1 ${pdfNumber(x)} ${pdfNumber(y)} Tm (${escapePdfText(value)}) Tj ET`);
  }

  get content() {
    return this.commands.join('\n');
  }
}

function textCapacity(width, size) {
  return Math.max(8, Math.floor(width / (size * 0.5)));
}

function wrapText(value, width, size) {
  const capacity = textCapacity(width, size);
  const words = ascii(value).trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';

  for (const word of words) {
    if (word.length > capacity) {
      if (current) {
        lines.push(current);
        current = '';
      }
      for (let index = 0; index < word.length; index += capacity) lines.push(word.slice(index, index + capacity));
      continue;
    }
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > capacity && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function wrappedText(page, value, { x, y, width, size = 11, leading = size * 1.45, color = COLORS.body, font = 'F1', maxLines = Infinity } = {}) {
  const lines = wrapText(value, width, size).slice(0, maxLines);
  lines.forEach((line, index) => page.text(line, x, y - index * leading, { size, color, font }));
  return y - lines.length * leading;
}

function pageFooter(page, pageNumber, totalPages, dark = false) {
  const color = dark ? [0.62, 0.75, 0.69] : COLORS.quiet;
  page.line(PAGE_MARGIN, 42, PAGE_WIDTH - PAGE_MARGIN, 42, { stroke: dark ? [0.22, 0.35, 0.30] : COLORS.line, lineWidth: 0.7 });
  page.text('Cognistration - Science guide - Audio off - Educational only', PAGE_MARGIN, 27, { size: 7.5, color });
  page.text(`Page ${pageNumber} / ${totalPages}`, PAGE_WIDTH - 106, 27, { size: 7.5, color });
}

function drawOceanSnapshot(page, model, x, y, width, height) {
  const ocean = model.ocean;
  const seed = ocean.seed >>> 0;
  page.rect(x, y, width, height, { fill: COLORS.ocean, stroke: [0.20, 0.40, 0.40], lineWidth: 0.8 });
  page.rect(x, y + height * 0.58, width, height * 0.42, { fill: COLORS.oceanMid });
  page.circle(x + width * (0.24 + unit(seed, 20) * 0.45), y + height * 0.72, 21 + unit(seed, 21) * 10, { fill: [0.88, 0.49, 0.29] });
  page.line(x, y + height * 0.58, x + width, y + height * 0.58, { stroke: [0.67, 0.78, 0.70], lineWidth: 0.7 });

  const segmentWidth = width / 4;
  const phase = unit(seed, 22) * Math.PI * 2;
  const waveBase = 7 + ocean.heightScale * 0.22 + ocean.amplitude * 0.5;
  for (let waveIndex = 0; waveIndex < 5; waveIndex += 1) {
    const baseline = y + height * (0.18 + waveIndex * 0.085);
    const amplitude = waveBase * (0.42 + waveIndex * 0.13);
    const commands = [`${pdfNumber(x)} ${pdfNumber(baseline)} m`];
    for (let segment = 0; segment < 4; segment += 1) {
      const direction = ((segment + waveIndex) % 2 === 0 ? 1 : -1) * amplitude;
      const start = x + segment * segmentWidth;
      const end = start + segmentWidth;
      commands.push(`${pdfNumber(start + segmentWidth * 0.24)} ${pdfNumber(baseline + direction)} ${pdfNumber(start + segmentWidth * 0.68)} ${pdfNumber(baseline - direction * 0.8)} ${pdfNumber(end)} ${pdfNumber(baseline + Math.sin(phase + segment + waveIndex) * amplitude * 0.22)} c`);
    }
    page.path(commands, { stroke: waveIndex === 0 ? COLORS.mint : [0.37, 0.68, 0.66], lineWidth: waveIndex === 0 ? 1.6 : 0.8 });
  }

  page.text('STATIC SNAPSHOT', x + 15, y + height - 22, { size: 7.5, color: COLORS.mint, font: 'F2' });
  page.text('Live vGPU FFT ocean is recorded below as run metadata.', x + 15, y + height - 36, { size: 8.5, color: COLORS.white });
}

function drawMetric(page, label, value, x, y, width, dark = false) {
  page.text(label.toUpperCase(), x, y, { size: 7.3, color: dark ? [0.57, 0.70, 0.64] : COLORS.quiet, font: 'F2' });
  wrappedText(page, value, { x, y: y - 16, width, size: 10, leading: 12, color: dark ? COLORS.white : COLORS.ink, font: 'F2', maxLines: 2 });
}

function drawCoverPage(model, totalPages) {
  const page = new PdfPage(COLORS.deep);
  const { controls, ocean, tone } = model;
  page.text('COGNISTRATION', PAGE_MARGIN, 742, { size: 9, color: COLORS.mint, font: 'F2' });
  page.text('SCIENCE GUIDE / STATIC EXPORT', PAGE_MARGIN, 725, { size: 7.5, color: [0.55, 0.68, 0.62], font: 'F2' });
  page.text(`GENERATED ${model.generatedAt.toISOString().slice(0, 10)}`, PAGE_WIDTH - 160, 725, { size: 7.5, color: [0.55, 0.68, 0.62], font: 'F2' });
  page.text('Understand the signal', PAGE_MARGIN, 672, { size: 30, color: COLORS.white, font: 'F2' });
  wrappedText(page, 'A printable snapshot of the seven-slide guide and the randomized ocean run behind this generation.', {
    x: PAGE_MARGIN,
    y: 635,
    width: 390,
    size: 12,
    leading: 17,
    color: [0.72, 0.81, 0.76]
  });

  drawOceanSnapshot(page, model, PAGE_MARGIN, 352, PAGE_WIDTH - PAGE_MARGIN * 2, 222);

  page.text('CURRENT SIGNAL', PAGE_MARGIN, 316, { size: 7.5, color: COLORS.mint, font: 'F2' });
  page.rect(PAGE_MARGIN, 248, PAGE_WIDTH - PAGE_MARGIN * 2, 50, { fill: [0.09, 0.19, 0.16], stroke: [0.18, 0.31, 0.26], lineWidth: 0.7 });
  drawMetric(page, 'Direction', controls.targetState, 62, 280, 100, true);
  drawMetric(page, 'Carrier', `${controls.carrierHz} Hz`, 190, 280, 100, true);
  drawMetric(page, 'Difference', `${controls.beatHz.toFixed(1)} Hz`, 318, 280, 100, true);
  drawMetric(page, 'Volume', `${controls.volume}%`, 446, 280, 100, true);
  if (tone?.name) page.text(`Tone: ${tone.name}`, PAGE_MARGIN, 232, { size: 8.5, color: [0.65, 0.76, 0.70] });

  page.text('OCEAN RUN / REPRODUCIBLE PARAMETERS', PAGE_MARGIN, 204, { size: 7.5, color: COLORS.mint, font: 'F2' });
  page.rect(PAGE_MARGIN, 72, PAGE_WIDTH - PAGE_MARGIN * 2, 114, { fill: [0.09, 0.19, 0.16], stroke: [0.18, 0.31, 0.26], lineWidth: 0.7 });
  drawMetric(page, 'Run label', ocean.runLabel, 62, 168, 120, true);
  drawMetric(page, 'Seed', String(ocean.seed), 220, 168, 120, true);
  drawMetric(page, 'Wind', `${ocean.windSpeed.toFixed(1)} m/s @ ${Math.round(ocean.windAngle)} deg`, 378, 168, 160, true);
  drawMetric(page, 'Amplitude', String(ocean.amplitude), 62, 132, 120, true);
  drawMetric(page, 'Patch', `${Math.round(ocean.patchSize)} m`, 220, 132, 120, true);
  drawMetric(page, 'Height / choppy', `${ocean.heightScale.toFixed(1)} / ${ocean.choppyScale.toFixed(1)}`, 378, 132, 160, true);
  drawMetric(page, 'Foam', String(ocean.foamScale), 62, 96, 120, true);
  drawMetric(page, 'Sun', `${ocean.sunElevation.toFixed(1)} deg / ${Math.round(ocean.sunAzimuth)} deg`, 220, 96, 120, true);
  drawMetric(page, 'Animation speed', `${ocean.timeScale.toFixed(2)}x`, 378, 96, 160, true);
  pageFooter(page, 1, totalPages, true);
  return page;
}

function drawSourceBlock(page, sourceIds, sourceById, x, y, width) {
  if (!sourceIds?.length) return y;
  page.text('SOURCES', x, y, { size: 8, color: COLORS.ink, font: 'F2' });
  let cursor = y - 17;
  for (const sourceId of sourceIds) {
    const source = sourceById.get(sourceId);
    if (!source) continue;
    cursor = wrappedText(page, source.label, { x, y: cursor, width, size: 8.5, leading: 10, color: COLORS.body, font: 'F2', maxLines: 2 });
    cursor = wrappedText(page, source.url, { x, y: cursor - 2, width, size: 7.2, leading: 9, color: COLORS.quiet, maxLines: 2 });
    cursor -= 8;
  }
  return cursor;
}

function drawSlidePage(slide, slideNumber, totalPages, model, sourceById) {
  const page = new PdfPage(COLORS.paper);
  const { controls, ocean } = model;
  page.text('COGNISTRATION / SCIENCE GUIDE', PAGE_MARGIN, 750, { size: 7.5, color: COLORS.quiet, font: 'F2' });
  page.text(`RUN ${ocean.runLabel} - ${controls.targetState} - AUDIO OFF`, PAGE_WIDTH - 220, 750, { size: 7.2, color: COLORS.quiet, font: 'F2' });
  page.line(PAGE_MARGIN, 733, PAGE_WIDTH - PAGE_MARGIN, 733, { stroke: COLORS.line, lineWidth: 0.8 });
  page.text(slide.eyebrow, PAGE_MARGIN, 700, { size: 8.5, color: COLORS.ink, font: 'F2' });
  let cursor = wrappedText(page, slide.title, { x: PAGE_MARGIN, y: 665, width: PAGE_WIDTH - PAGE_MARGIN * 2, size: 27, leading: 31, color: COLORS.ink, font: 'F2' });
  cursor = wrappedText(page, slide.body, { x: PAGE_MARGIN, y: cursor - 18, width: PAGE_WIDTH - PAGE_MARGIN * 2, size: 11, leading: 16, color: COLORS.body });

  if (slide.bands?.length) {
    const tableTop = cursor - 16;
    page.text('DESCRIPTIVE BAND VOCABULARY', PAGE_MARGIN, tableTop, { size: 8, color: COLORS.ink, font: 'F2' });
    let rowTop = tableTop - 18;
    slide.bands.forEach((band, index) => {
      const rowHeight = 35;
      page.rect(PAGE_MARGIN, rowTop - rowHeight + 5, PAGE_WIDTH - PAGE_MARGIN * 2, rowHeight, { fill: index % 2 === 0 ? [0.91, 0.95, 0.92] : COLORS.paper });
      page.text(band.label, 62, rowTop - 16, { size: 9, color: COLORS.ink, font: 'F2' });
      page.text(band.range, 190, rowTop - 16, { size: 8.7, color: COLORS.body });
      page.text(band.direction, 352, rowTop - 16, { size: 8.7, color: COLORS.body });
      page.line(PAGE_MARGIN, rowTop - rowHeight + 5, PAGE_WIDTH - PAGE_MARGIN, rowTop - rowHeight + 5, { stroke: COLORS.line, lineWidth: 0.5 });
      rowTop -= rowHeight;
    });
    cursor = rowTop - 7;
  }

  if (slide.facts?.length) {
    const factsTop = cursor - 12;
    page.text('WHAT TO CARRY FORWARD', PAGE_MARGIN, factsTop, { size: 8, color: COLORS.ink, font: 'F2' });
    let rowTop = factsTop - 18;
    slide.facts.forEach((fact) => {
      const detailLines = wrapText(fact.detail, 365, 8.7).slice(0, 3);
      const rowHeight = Math.max(34, detailLines.length * 11 + 16);
      page.text(fact.label, 62, rowTop - 16, { size: 8.7, color: COLORS.ink, font: 'F2' });
      detailLines.forEach((line, index) => page.text(line, 190, rowTop - 16 - index * 11, { size: 8.7, color: COLORS.body }));
      page.line(PAGE_MARGIN, rowTop - rowHeight + 5, PAGE_WIDTH - PAGE_MARGIN, rowTop - rowHeight + 5, { stroke: COLORS.line, lineWidth: 0.5 });
      rowTop -= rowHeight;
    });
    cursor = rowTop - 7;
  }

  if (slide.id === 'machine') {
    page.rect(PAGE_MARGIN, 91, PAGE_WIDTH - PAGE_MARGIN * 2, 42, { fill: [0.90, 0.95, 0.92], stroke: COLORS.line, lineWidth: 0.6 });
    page.text(`Ocean run ${ocean.runLabel} is visual context only; the PDF stores its seed and parameters, not a live WebGPU surface.`, 62, 116, { size: 8, color: COLORS.body });
  }
  drawSourceBlock(page, slide.sourceIds, sourceById, PAGE_MARGIN, Math.max(146, cursor - 10), PAGE_WIDTH - PAGE_MARGIN * 2);
  pageFooter(page, slideNumber + 1, totalPages);
  return page;
}

function serializePdf(pages) {
  const objects = [];
  const fontRegular = 3;
  const fontBold = 4;
  const pageStart = 5;
  const contentStart = pageStart + pages.length;
  objects[0] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[1] = `<< /Type /Pages /Kids [${pages.map((_, index) => `${pageStart + index} 0 R`).join(' ')}] /Count ${pages.length} >>`;
  objects[2] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';

  pages.forEach((page, index) => {
    const contentObject = contentStart + index;
    objects[pageStart - 1 + index] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> /Contents ${contentObject} 0 R >>`;
  });
  pages.forEach((page, index) => {
    const content = page.content;
    objects[contentStart - 1 + index] = `<< /Length ${Buffer.byteLength(content, 'binary')} >>\nstream\n${content}\nendstream`;
  });

  let pdf = '%PDF-1.4\n% Cognistration\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets[index + 1] = Buffer.byteLength(pdf, 'binary');
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, 'binary');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index < offsets.length; index += 1) pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, 'binary');
}

export function buildScienceGuidePdf(input = {}) {
  const model = input?.ocean?.runLabel && input?.controls && input?.generatedAt instanceof Date
    ? input
    : normalizeScienceGuidePdfInput(input);
  const sourceById = new Map(SCIENCE_GUIDE_SOURCES.map((source) => [source.id, source]));
  const totalPages = SCIENCE_GUIDE_SLIDES.length + 1;
  const pages = [drawCoverPage(model, totalPages)];
  SCIENCE_GUIDE_SLIDES.forEach((slide, index) => pages.push(drawSlidePage(slide, index + 1, totalPages, model, sourceById)));
  return serializePdf(pages);
}
