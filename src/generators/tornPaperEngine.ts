import { TornPaperParams, TornPaperArchetype } from '../types/tornPaper';
import { createPRNG } from './renderEngine';

function fractalNoise(x: number, octaves = 5, prng: () => number, seedOffset = 0): number {
  let val = 0;
  let amp = 1;
  let freq = 1;
  let maxAmp = 0;

  for (let i = 0; i < octaves; i++) {
    const phase = (seedOffset + i * 19.37) % 100;
    val += Math.sin((x * freq + phase) * 0.1) * amp;
    val += Math.cos((x * freq * 1.73 + phase * 2.3) * 0.1) * (amp * 0.55);
    maxAmp += amp * 1.55;
    amp *= 0.48;
    freq *= 2.12;
  }

  return val / maxAmp;
}

export function generateTornPaperSvg(
  styleId: string,
  params: TornPaperParams,
  overrideWidth?: number,
  overrideHeight?: number
): string {
  const svgWidth = overrideWidth || params.width || 1000;
  const svgHeight = overrideHeight || params.height || 1000;
  const prng = createPRNG(params.seed);
  const cx = svgWidth / 2;
  const cy = svgHeight / 2;

  const roughness = (params.tearRoughness || 48) / 50;
  const fiberDensity = (params.fiberDensity || 70) / 100;
  const fiberLen = params.fiberLength || 10;
  const thickness = params.paperThickness || 6;
  const paperColor = params.paperColor || '#fafaf9';
  const pulpColor = params.innerPulpColor || '#ffffff';
  const shadowBlur = params.shadowBlur || 18;
  const shadowOpacity = params.shadowOpacity || 0.35;
  const crumple = params.crumpleIntensity || 0;
  const burn = params.burnIntensity || 0;
  const archetype = params.archetype || 'full-sheet';

  // -------------------------------------------------------------
  // ⭐ SPECIAL RENDERER 1: Vector Torn Paper Frame Cutout
  // -------------------------------------------------------------
  if (archetype === 'exclusive-vector-frame' || styleId === 'vector-torn-paper-frame') {
    const padX = svgWidth * 0.08;
    const padY = svgHeight * 0.08;
    const frameW = svgWidth - padX * 2;
    const frameH = svgHeight - padY * 2;
    const innerRadiusX = frameW * 0.36;
    const innerRadiusY = frameH * 0.36;
    const numPoints = 64;
    let innerPath = '';

    for (let i = 0; i <= numPoints; i++) {
      const a = (i / numPoints) * 2 * Math.PI;
      const n = fractalNoise(i * 1.2, 4, prng, params.seed * 0.2);
      const rVar = 1 + n * (roughness * 0.22);
      const ix = cx + Math.cos(a) * innerRadiusX * rVar;
      const iy = cy + Math.sin(a) * innerRadiusY * rVar;
      innerPath += (i === 0 ? `M ${ix} ${iy}` : ` L ${ix} ${iy}`);
    }
    innerPath += ' Z';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" preserveAspectRatio="xMidYMid meet" color-interpolation="sRGB" color-interpolation-filters="sRGB">
      <defs>
        <filter id="vectorFrameShadow" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
          <feDropShadow dx="0" dy="8" stdDeviation="${shadowBlur}" flood-color="#0f172a" flood-opacity="${shadowOpacity}" />
        </filter>
        <mask id="vectorFrameMask_${params.seed}">
          <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="#ffffff" />
          <path d="${innerPath}" fill="#000000" />
        </mask>
      </defs>
      <g id="VectorTornFrame" style="isolation: isolate;">
        <!-- Base Paper with Inner Window Cutout -->
        <rect x="${padX}" y="${padY}" width="${frameW}" height="${frameH}" rx="16" fill="${paperColor}" filter="url(#vectorFrameShadow)" mask="url(#vectorFrameMask_${params.seed})" />
        <!-- Inner Exposed White Lining (Crisp Offset Border) -->
        <path d="${innerPath}" fill="none" stroke="${pulpColor}" stroke-width="${thickness + 2}" opacity="0.95" />
        <path d="${innerPath}" fill="none" stroke="#e2e8f0" stroke-width="1.5" opacity="0.7" />
      </g>
    </svg>`;
  }

  // -------------------------------------------------------------
  // ⭐ SPECIAL RENDERER 2: Rough Deckle Edge Handmade Frame
  // -------------------------------------------------------------
  if (archetype === 'exclusive-deckle-frame' || styleId === 'rough-deckle-edge-frame') {
    const padX = svgWidth * 0.08;
    const padY = svgHeight * 0.08;
    const frameW = svgWidth - padX * 2;
    const frameH = svgHeight - padY * 2;
    const radiusX = frameW * 0.36;
    const radiusY = frameH * 0.36;
    const steps = 70;
    let deckleHole = '';
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * 2 * Math.PI;
      const n = fractalNoise(i * 1.5, 4, prng, params.seed * 0.3);
      const r = (1 + n * (roughness * 0.25) + (prng() - 0.5) * 0.04);
      const dx = cx + Math.cos(a) * radiusX * r;
      const dy = cy + Math.sin(a) * radiusY * r;
      deckleHole += (i === 0 ? `M ${dx} ${dy}` : ` L ${dx} ${dy}`);
    }
    deckleHole += ' Z';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" preserveAspectRatio="xMidYMid meet" color-interpolation="sRGB" color-interpolation-filters="sRGB">
      <defs>
        <filter id="deckleShadow" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
          <feDropShadow dx="2" dy="10" stdDeviation="${shadowBlur * 0.9}" flood-color="#1e293b" flood-opacity="${shadowOpacity * 1.1}" />
        </filter>
        <mask id="deckleMask_${params.seed}">
          <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="#ffffff" />
          <path d="${deckleHole}" fill="#000000" />
        </mask>
      </defs>
      <g id="DeckleEdgeFrame" style="isolation: isolate;">
        <rect x="${padX}" y="${padY}" width="${frameW}" height="${frameH}" rx="8" fill="${paperColor}" filter="url(#deckleShadow)" mask="url(#deckleMask_${params.seed})" />
        <!-- Exposed Deckle Pulp Rim -->
        <path d="${deckleHole}" fill="none" stroke="${pulpColor}" stroke-width="${thickness + 4}" stroke-linecap="round" opacity="0.9" />
        <path d="${deckleHole}" fill="none" stroke="#d6d3d1" stroke-width="2" opacity="0.6" />
      </g>
    </svg>`;
  }

  // -------------------------------------------------------------
  // ⭐ SPECIAL RENDERER 4: 3D Punctured / Burst Paper Hole Effect
  // -------------------------------------------------------------
  if (archetype === 'exclusive-punctured-hole' || styleId === 'punctured-burst-hole') {
    const padX = svgWidth * 0.09;
    const padY = svgHeight * 0.09;
    const frameW = svgWidth - padX * 2;
    const frameH = svgHeight - padY * 2;
    const minDim = Math.min(frameW, frameH);
    const numFlaps = 8;
    const holeRadius = minDim * 0.16;
    const flapLength = minDim * 0.22;
    let flapsSvg = '';
    let holePolygon = '';

    for (let i = 0; i < numFlaps; i++) {
      const a1 = (i / numFlaps) * 2 * Math.PI;
      const a2 = ((i + 1) / numFlaps) * 2 * Math.PI;
      const aMid = (a1 + a2) / 2;

      const p1x = cx + Math.cos(a1) * holeRadius;
      const p1y = cy + Math.sin(a1) * holeRadius;
      const p2x = cx + Math.cos(a2) * holeRadius;
      const p2y = cy + Math.sin(a2) * holeRadius;

      // Outer curled tip of the torn triangular flap
      const tipDist = holeRadius + flapLength * (0.85 + prng() * 0.35);
      const tipX = cx + Math.cos(aMid) * tipDist;
      const tipY = cy + Math.sin(aMid) * tipDist;

      if (i === 0) holePolygon += `M ${p1x} ${p1y}`;
      holePolygon += ` L ${p2x} ${p2y}`;

      // Each triangular flap has its own 3D warp curl and shadow
      flapsSvg += `
        <g>
          <!-- Flap Under-shadow -->
          <polygon points="${p1x},${p1y} ${tipX + 6},${tipY + 12} ${p2x},${p2y}" fill="#0f172a" opacity="0.4" filter="url(#tornDropShadow)" />
          <!-- White Pulp Exposed Core of Flap -->
          <polygon points="${p1x - 3},${p1y - 3} ${tipX},${tipY} ${p2x + 3},${p2y + 3}" fill="${pulpColor}" />
          <!-- Main Colored Paper Flap Face -->
          <polygon points="${p1x},${p1y} ${tipX},${tipY} ${p2x},${p2y}" fill="${paperColor}" stroke="#e2e8f0" stroke-width="1" />
          <!-- Highlight ridge on flap -->
          <line x1="${(p1x + p2x) / 2}" y1="${(p1y + p2y) / 2}" x2="${tipX}" y2="${tipY}" stroke="#ffffff" stroke-width="2" opacity="0.65" />
        </g>
      `;
    }
    holePolygon += ' Z';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" preserveAspectRatio="xMidYMid meet" color-interpolation="sRGB" color-interpolation-filters="sRGB">
      <defs>
        <filter id="tornDropShadow" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
          <feDropShadow dx="2" dy="8" stdDeviation="${shadowBlur}" flood-color="#0f172a" flood-opacity="${shadowOpacity}" />
        </filter>
        <mask id="burstMask_${params.seed}">
          <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="#ffffff" />
          <path d="${holePolygon}" fill="#000000" />
        </mask>
      </defs>
      <g id="BurstPaper" style="isolation: isolate;">
        <!-- Base Paper Sheet with Center Hole Cutout -->
        <rect x="${padX}" y="${padY}" width="${frameW}" height="${frameH}" rx="12" fill="${paperColor}" filter="url(#tornDropShadow)" mask="url(#burstMask_${params.seed})" />
        <!-- 3D Outward Bursting Flaps -->
        ${flapsSvg}
      </g>
    </svg>`;
  }

  // -------------------------------------------------------------
  // ⭐ SPECIAL RENDERER 7: Horizontal Split Paper Window / Reveal
  // -------------------------------------------------------------
  if (archetype === 'exclusive-horizontal-window' || styleId === 'horizontal-rip-window') {
    const padX = svgWidth * 0.08;
    const padY = svgHeight * 0.08;
    const splitY1 = cy - svgHeight * 0.14;
    const splitY2 = cy + svgHeight * 0.14;
    const steps = 80;

    let topHalf = `M ${padX} ${padY} L ${svgWidth - padX} ${padY} L ${svgWidth - padX} ${splitY1}`;
    let topPulp = `M ${padX} ${padY} L ${svgWidth - padX} ${padY} L ${svgWidth - padX} ${splitY1 + thickness}`;

    for (let i = steps; i >= 0; i--) {
      const t = i / steps;
      const x = padX + t * (svgWidth - padX * 2);
      const n = fractalNoise(x * 0.4, 4, prng, params.seed * 0.2);
      const y = splitY1 + n * (roughness * 22);
      topHalf += ` L ${x} ${y}`;
      topPulp += ` L ${x} ${y + thickness + (prng() - 0.5) * 2}`;
    }
    topHalf += ' Z';
    topPulp += ' Z';

    let bottomHalf = `M ${padX} ${svgHeight - padY} L ${svgWidth - padX} ${svgHeight - padY} L ${svgWidth - padX} ${splitY2}`;
    let bottomPulp = `M ${padX} ${svgHeight - padY} L ${svgWidth - padX} ${svgHeight - padY} L ${svgWidth - padX} ${splitY2 - thickness}`;

    for (let i = steps; i >= 0; i--) {
      const t = i / steps;
      const x = padX + t * (svgWidth - padX * 2);
      const n = fractalNoise(x * 0.4, 4, prng, params.seed * 0.4 + 100);
      const y = splitY2 + n * (roughness * 22);
      bottomHalf += ` L ${x} ${y}`;
      bottomPulp += ` L ${x} ${y - thickness + (prng() - 0.5) * 2}`;
    }
    bottomHalf += ' Z';
    bottomPulp += ' Z';

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" preserveAspectRatio="xMidYMid meet" color-interpolation="sRGB" color-interpolation-filters="sRGB">
      <defs>
        <filter id="splitShadow" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
          <feDropShadow dx="0" dy="10" stdDeviation="${shadowBlur}" flood-color="#0f172a" flood-opacity="${shadowOpacity * 1.1}" />
        </filter>
      </defs>
      <g id="HorizontalSplitPaper" style="isolation: isolate;">
        <!-- Top Sheet with Exposed Pulp Core and Drop Shadow -->
        <g filter="url(#splitShadow)">
          <path d="${topPulp}" fill="${pulpColor}" />
          <path d="${topHalf}" fill="${paperColor}" />
        </g>
        <!-- Bottom Sheet with Exposed Pulp Core and Drop Shadow -->
        <g filter="url(#splitShadow)">
          <path d="${bottomPulp}" fill="${pulpColor}" />
          <path d="${bottomHalf}" fill="${paperColor}" />
        </g>
      </g>
    </svg>`;
  }

  // -------------------------------------------------------------
  // GENERAL RENDERER (Supports 3D Curled Banner, White Core Strip, Kraft Cardboard & all standard styles)
  // -------------------------------------------------------------
  let left = svgWidth * 0.10;
  let right = svgWidth - svgWidth * 0.10;
  let top = svgHeight * 0.10;
  let bottom = svgHeight - svgHeight * 0.10;

  if (archetype === 'strip-horizontal' || archetype === 'exclusive-white-core-strip' || archetype === 'exclusive-curled-banner') {
    top = cy - svgHeight * 0.16;
    bottom = cy + svgHeight * 0.16;
  } else if (archetype === 'strip-vertical') {
    left = cx - svgWidth * 0.18;
    right = cx + svgWidth * 0.18;
  } else if (archetype === 'fragment-scrap') {
    left = cx - svgWidth * 0.24;
    right = cx + svgWidth * 0.24;
    top = cy - svgHeight * 0.20;
    bottom = cy + svgHeight * 0.20;
  }

  const steps = 90;
  const topPoints: { x: number; y: number }[] = [];
  const bottomPoints: { x: number; y: number }[] = [];
  const leftPoints: { x: number; y: number }[] = [];
  const rightPoints: { x: number; y: number }[] = [];

  // Top Edge
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = left + t * (right - left);
    const n = fractalNoise(x * 0.45, 5, prng, params.seed * 0.11);
    const yOffset = n * (roughness * 20) + (prng() - 0.5) * (roughness * 5);
    topPoints.push({ x, y: top + yOffset });
  }

  // Bottom Edge
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = right - t * (right - left);
    const n = fractalNoise(x * 0.45, 5, prng, params.seed * 0.23 + 70);
    const yOffset = n * (roughness * 20) + (prng() - 0.5) * (roughness * 5);
    bottomPoints.push({ x, y: bottom + yOffset });
  }

  // Left Edge
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = bottom - t * (bottom - top);
    const n = fractalNoise(y * 0.45, 5, prng, params.seed * 0.37 + 140);
    const xOffset = n * (roughness * (archetype === 'strip-vertical' ? 24 : 14)) + (prng() - 0.5) * (roughness * 5);
    leftPoints.push({ x: left + xOffset, y });
  }

  // Right Edge
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const y = top + t * (bottom - top);
    const n = fractalNoise(y * 0.45, 5, prng, params.seed * 0.49 + 210);
    const xOffset = n * (roughness * (archetype === 'strip-vertical' ? 24 : 14)) + (prng() - 0.5) * (roughness * 5);
    rightPoints.push({ x: right + xOffset, y });
  }

  // Main Paper Face Polygon Path
  let pathD = `M ${topPoints[0].x} ${topPoints[0].y}`;
  for (const pt of topPoints) pathD += ` L ${pt.x} ${pt.y}`;
  for (const pt of rightPoints) pathD += ` L ${pt.x} ${pt.y}`;
  for (const pt of bottomPoints) pathD += ` L ${pt.x} ${pt.y}`;
  for (const pt of leftPoints) pathD += ` L ${pt.x} ${pt.y}`;
  pathD += ' Z';

  // Exposed Raw Pulp Bevel Path (Outer Bevel Rim)
  const effectiveThickness = (archetype === 'exclusive-white-core-strip' || archetype === 'exclusive-cardboard-tear') ? thickness * 1.5 : thickness;
  let pulpD = `M ${topPoints[0].x} ${topPoints[0].y - effectiveThickness}`;
  for (const pt of topPoints) pulpD += ` L ${pt.x} ${pt.y - effectiveThickness + (prng() - 0.5) * 2.5}`;
  for (const pt of rightPoints) pulpD += ` L ${pt.x + effectiveThickness} ${pt.y}`;
  for (const pt of bottomPoints) pulpD += ` L ${pt.x} ${pt.y + effectiveThickness + (prng() - 0.5) * 2.5}`;
  for (const pt of leftPoints) pulpD += ` L ${pt.x - effectiveThickness} ${pt.y}`;
  pulpD += ' Z';

  // Realistic Protruding Cellulose Fibers
  const fiberList: string[] = [];
  const allEdgePoints = [...topPoints, ...rightPoints, ...bottomPoints, ...leftPoints];

  for (let i = 0; i < allEdgePoints.length; i += 2) {
    if (prng() < fiberDensity) {
      const pt = allEdgePoints[i];
      const normAngle = Math.atan2(pt.y - cy, pt.x - cx) + (prng() - 0.5) * 0.88;
      const len = fiberLen * (0.35 + prng() * 1.35);
      const fx = pt.x + Math.cos(normAngle) * len;
      const fy = pt.y + Math.sin(normAngle) * len;
      const fOp = 0.45 + prng() * 0.5;
      const fWidth = 0.6 + prng() * 0.85;

      fiberList.push(
        `<line x1="${pt.x}" y1="${pt.y}" x2="${fx}" y2="${fy}" stroke="${pulpColor}" stroke-width="${fWidth}" opacity="${fOp}" stroke-linecap="round" />`
      );
    }
  }

  // 3D Curled Edge Banner Lighting (Roll / cylindrical shadow effect)
  let curledShading = '';
  if (archetype === 'exclusive-curled-banner') {
    const rollW = (right - left) * 0.08;
    curledShading = `
      <g>
        <!-- Left curled cylinder roll -->
        <rect x="${left}" y="${top}" width="${rollW}" height="${bottom - top}" fill="url(#curlGradientLeft_${params.seed})" opacity="0.6" />
        <!-- Right curled cylinder roll -->
        <rect x="${right - rollW}" y="${top}" width="${rollW}" height="${bottom - top}" fill="url(#curlGradientRight_${params.seed})" opacity="0.6" />
      </g>
    `;
  }

  // Creases & Crumple Lighting
  let crumpleShading = '';
  if (crumple > 8) {
    const numCreases = Math.floor(crumple / 10) + 4;
    let creases = '';
    for (let c = 0; c < numCreases; c++) {
      const startX = left + prng() * (right - left);
      const startY = top + prng() * (bottom - top);
      const endX = left + prng() * (right - left);
      const endY = top + prng() * (bottom - top);
      const midX = (startX + endX) / 2 + (prng() - 0.5) * 50;
      const midY = (startY + endY) / 2 + (prng() - 0.5) * 50;

      creases += `<path d="M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}" stroke="#1e293b" stroke-width="2.6" opacity="${(crumple / 100) * 0.18}" stroke-linecap="round" fill="none" />`;
      creases += `<path d="M ${startX + 2} ${startY + 2} Q ${midX + 2} ${midY + 2} ${endX + 2} ${endY + 2}" stroke="#ffffff" stroke-width="2.2" opacity="${(crumple / 100) * 0.42}" stroke-linecap="round" fill="none" />`;
    }
    crumpleShading = creases;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}" preserveAspectRatio="xMidYMid meet" color-interpolation="sRGB" color-interpolation-filters="sRGB">
    <defs>
      <filter id="tornDropShadow" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
        <feDropShadow dx="2" dy="8" stdDeviation="${shadowBlur * 0.8}" flood-color="#0f172a" flood-opacity="${shadowOpacity}" />
      </filter>
      <!-- Gradients for 3D curled banner -->
      <linearGradient id="curlGradientLeft_${params.seed}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.45" />
        <stop offset="40%" stop-color="#ffffff" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </linearGradient>
      <linearGradient id="curlGradientRight_${params.seed}" x1="100%" y1="0%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.45" />
        <stop offset="40%" stop-color="#ffffff" stop-opacity="0.5" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </linearGradient>
    </defs>
    <g id="TornCraftMaster" style="isolation: isolate;">
      <!-- Base Drop Shadow on transparent background -->
      <g filter="url(#tornDropShadow)">
        <!-- Exposed Cellulose Pulp Core (White Bevel Outer Rim) -->
        <path d="${pulpD}" fill="${pulpColor}" />
        <!-- Main Paper Face Layer -->
        <path d="${pathD}" fill="${paperColor}" />
      </g>
      <!-- 3D Curled Shading -->
      ${curledShading}
      <!-- Top Edge Highlight / Specular Bevel -->
      <path d="${pathD}" fill="none" stroke="#ffffff" stroke-width="1.6" opacity="0.4" />
      <!-- Crumple / Crease Lighting -->
      <g opacity="0.88">
        ${crumpleShading}
      </g>
      <!-- Micro Cellulose Fibers sprouting outwards -->
      <g opacity="0.94">
        ${fiberList.join('')}
      </g>
    </g>
  </svg>`;
}
