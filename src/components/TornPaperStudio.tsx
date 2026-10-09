import React, { useState, useMemo } from 'react';
import { 
  TORN_PAPER_CATEGORIES, 
  TORN_PAPER_STYLES, 
} from '../data/tornPaperData';
import { SIZE_PRESETS, calculateResolutions } from '../data/sizePresets';
import { TornPaperParams, TornPaperStyle, TornPaperArchetype } from '../types/tornPaper';
import { generateTornPaperSvg } from '../generators/tornPaperEngine';
import { exportToPng } from '../generators/renderEngine';
import { TornPaperBatchModal } from './TornPaperBatchModal';
import { 
  Eye, 
  Sparkles, 
  Grid3X3, 
  Download, 
  RefreshCw, 
  Check, 
  FileCode, 
  Palette, 
  Sliders, 
  Copy, 
  Scissors, 
  ShieldCheck,
  RotateCcw,
  Wand2,
  Star,
  Maximize2,
  Lock,
  Unlock,
  ArrowLeftRight,
  Layers,
  FileCheck2,
  Tag
} from 'lucide-react';

interface TornPaperStudioProps {
  onBackToHome?: () => void;
}

const MATERIAL_PRESETS = [
  { label: 'White Copier', color: '#ffffff', pulp: '#ffffff', grain: 8 },
  { label: 'Ivory Cream', color: '#fefce8', pulp: '#ffffff', grain: 12 },
  { label: 'Kraft Brown', color: '#c8a27a', pulp: '#dfc2a2', grain: 32 },
  { label: 'Recycled Flecked', color: '#e7e5e4', pulp: '#f5f5f4', grain: 35 },
  { label: 'Matte Black', color: '#18181b', pulp: '#e4e4e7', grain: 18 },
  { label: 'Vintage Parchment', color: '#fef3c7', pulp: '#fef9c3', grain: 28 },
  { label: 'Cardstock 300g', color: '#f8fafc', pulp: '#ffffff', grain: 15 },
  { label: 'Japanese Washi', color: '#faf8f5', pulp: '#ffffff', grain: 20 },
];

export const TornPaperStudio: React.FC<TornPaperStudioProps> = () => {
  // Category & Style selection
  const [activeCategoryId, setActiveCategoryId] = useState<'exclusive' | 'basic' | 'edge-fiber' | 'layered-collage' | 'materials' | 'advanced'>('exclusive');
  const [activeStyleId, setActiveStyleId] = useState<string>('vector-torn-paper-frame');

  // General PNG Size Preset & Custom Dimensions state
  const [selectedPresetId, setSelectedPresetId] = useState<string>('square-1-1');
  const [customWidth, setCustomWidth] = useState<number>(1000);
  const [customHeight, setCustomHeight] = useState<number>(1000);
  const [isRatioLocked, setIsRatioLocked] = useState<boolean>(true);

  // Preview background mode
  const [bgMode, setBgMode] = useState<'transparent' | 'white' | 'dark' | 'mockup'>('transparent');
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [copiedTags, setCopiedTags] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [singleDownloadIndex, setSingleDownloadIndex] = useState<number>(1);

  // Lower controls tab (keeps vertical height remarkably compact and neat)
  const [controlTab, setControlTab] = useState<'edge-fiber' | 'materials' | 'metadata'>('edge-fiber');

  // Mega Batch Modal state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchModalCount, setBatchModalCount] = useState<number>(50);
  const [batchAutoStart, setBatchAutoStart] = useState<boolean>(false);

  const handleOpenMegaBatch = (count = 50, autoStart = false) => {
    setBatchModalCount(count);
    setBatchAutoStart(autoStart);
    setIsBatchModalOpen(true);
  };

  // Active Category & Styles List
  const currentStylesList = useMemo(() => {
    return TORN_PAPER_STYLES.filter((s) => s.category === activeCategoryId);
  }, [activeCategoryId]);

  const activeStyle = useMemo(() => {
    return TORN_PAPER_STYLES.find((s) => s.id === activeStyleId) || currentStylesList[0];
  }, [activeStyleId, currentStylesList]);

  // Selected Preset or Custom Size resolution calculation
  const activePreset = useMemo(() => {
    return SIZE_PRESETS.find((p) => p.id === selectedPresetId);
  }, [selectedPresetId]);

  const canvasWidth = activePreset ? activePreset.baseWidth : customWidth;
  const canvasHeight = activePreset ? activePreset.baseHeight : customHeight;

  // Real-time calculated 4K and 8K export dimensions
  const resolutions = useMemo(() => {
    if (activePreset) {
      return {
        k4: { width: activePreset.export4kWidth, height: activePreset.export4kHeight },
        k8: { width: activePreset.export8kWidth, height: activePreset.export8kHeight },
        k2: { width: Math.round(activePreset.export4kWidth / 2), height: Math.round(activePreset.export4kHeight / 2) }
      };
    }
    return calculateResolutions(customWidth, customHeight);
  }, [activePreset, customWidth, customHeight]);

  // Parameters
  const [params, setParams] = useState<TornPaperParams>(() => ({
    seed: Math.floor(Math.random() * 900000000 + 100000000),
    width: 1000,
    height: 1000,
    aspectRatio: '1:1',
    customWidth: 1000,
    customHeight: 1000,
    archetype: 'exclusive-vector-frame',
    paperPattern: 'plain',
    attachment: 'none',
    attachmentColor: '#fde047',
    tearRoughness: 48,
    tearFrequency: 25,
    tearDepth: 50,
    edgeStyle: 'rough',
    fiberDensity: 65,
    fiberLength: 8,
    fiberColor: '#ffffff',
    paperThickness: 8,
    innerPulpColor: '#ffffff',
    paperColor: '#fafaf9',
    surfaceTexture: 'smooth',
    textureGrain: 14,
    crumpleIntensity: 10,
    burnIntensity: 0,
    shadowBlur: 16,
    shadowOpacity: 0.35,
    shadowDistance: 12,
    shadowAngle: 90,
    layersCount: 1,
    curlAngle: 0,
    scale: 85,
  }));

  // Handle Preset Size change
  const handleSelectSizePreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = SIZE_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setCustomWidth(found.baseWidth);
      setCustomHeight(found.baseHeight);
      setParams((prev) => ({
        ...prev,
        width: found.baseWidth,
        height: found.baseHeight,
        aspectRatio: found.ratio as any,
      }));
    }
  };

  // Handle Custom Width & Height input
  const handleCustomWidthChange = (val: number) => {
    const w = Math.max(200, Math.min(8000, val || 200));
    if (isRatioLocked && customWidth > 0) {
      const ratio = customHeight / customWidth;
      const newH = Math.round(w * ratio);
      setCustomWidth(w);
      setCustomHeight(newH);
      setParams((prev) => ({ ...prev, width: w, height: newH, aspectRatio: 'custom' }));
    } else {
      setCustomWidth(w);
      setParams((prev) => ({ ...prev, width: w, aspectRatio: 'custom' }));
    }
  };

  const handleCustomHeightChange = (val: number) => {
    const h = Math.max(200, Math.min(8000, val || 200));
    if (isRatioLocked && customHeight > 0) {
      const ratio = customWidth / customHeight;
      const newW = Math.round(h * ratio);
      setCustomHeight(h);
      setCustomWidth(newW);
      setParams((prev) => ({ ...prev, width: newW, height: h, aspectRatio: 'custom' }));
    } else {
      setCustomHeight(h);
      setParams((prev) => ({ ...prev, height: h, aspectRatio: 'custom' }));
    }
  };

  const handleSwapOrientation = () => {
    const newW = canvasHeight;
    const newH = canvasWidth;
    setSelectedPresetId('custom');
    setCustomWidth(newW);
    setCustomHeight(newH);
    setParams((prev) => ({ ...prev, width: newW, height: newH, aspectRatio: 'custom' }));
  };

  // Switch Style
  const handleSelectStyle = (style: TornPaperStyle) => {
    setActiveStyleId(style.id);
    setParams((prev) => ({
      ...prev,
      seed: Math.floor(Math.random() * 900000000 + 100000000),
      ...style.defaultParams,
      width: canvasWidth,
      height: canvasHeight,
    }));
  };

  // Switch Category
  const handleSelectCategory = (catId: 'exclusive' | 'basic' | 'edge-fiber' | 'layered-collage' | 'materials' | 'advanced') => {
    setActiveCategoryId(catId);
    const firstStyleInCat = TORN_PAPER_STYLES.find((s) => s.category === catId);
    if (firstStyleInCat) {
      handleSelectStyle(firstStyleInCat);
    }
  };

  // Generate Unique Variation
  const handleGenerateNextStyle = () => {
    const archetypes: TornPaperArchetype[] = [
      'exclusive-vector-frame', 'exclusive-deckle-frame', 'exclusive-white-core-strip',
      'exclusive-punctured-hole', 'exclusive-cardboard-tear', 'exclusive-curled-banner',
      'exclusive-horizontal-window', 'full-sheet', 'strip-horizontal', 'strip-vertical',
      'notebook-spiral', 'notebook-lined', 'grid-math-paper'
    ];
    const pickedArchetype = archetypes[Math.floor(Math.random() * archetypes.length)];
    const pickedMat = MATERIAL_PRESETS[Math.floor(Math.random() * MATERIAL_PRESETS.length)];

    setParams((prev) => ({
      ...prev,
      seed: Math.floor(Math.random() * 900000000 + 100000000),
      archetype: pickedArchetype,
      paperColor: pickedMat.color,
      innerPulpColor: pickedMat.pulp,
      tearRoughness: Math.floor(25 + Math.random() * 55),
      fiberDensity: Math.floor(45 + Math.random() * 50),
      fiberLength: Math.floor(6 + Math.random() * 18),
      paperThickness: Math.floor(4 + Math.random() * 12),
      crumpleIntensity: Math.floor(Math.random() * 55),
      shadowBlur: Math.floor(12 + Math.random() * 22),
      shadowOpacity: 0.3 + Math.random() * 0.2,
      width: canvasWidth,
      height: canvasHeight,
    }));
  };

  // Reset to Clean Defaults
  const handleReset = () => {
    setParams({
      seed: Math.floor(Math.random() * 900000000 + 100000000),
      width: canvasWidth,
      height: canvasHeight,
      aspectRatio: activePreset ? (activePreset.ratio as any) : '1:1',
      customWidth: canvasWidth,
      customHeight: canvasHeight,
      archetype: activeStyle.defaultParams.archetype || 'exclusive-vector-frame',
      paperPattern: 'plain',
      attachment: 'none',
      attachmentColor: '#fde047',
      tearRoughness: 48,
      tearFrequency: 25,
      tearDepth: 50,
      edgeStyle: 'rough',
      fiberDensity: 65,
      fiberLength: 8,
      fiberColor: '#ffffff',
      paperThickness: 8,
      innerPulpColor: '#ffffff',
      paperColor: '#fafaf9',
      surfaceTexture: 'smooth',
      textureGrain: 14,
      crumpleIntensity: 10,
      burnIntensity: 0,
      shadowBlur: 16,
      shadowOpacity: 0.35,
      shadowDistance: 12,
      shadowAngle: 90,
      layersCount: 1,
      curlAngle: 0,
      scale: 85,
    });
  };

  const updateParam = (key: keyof TornPaperParams, val: any) => {
    setParams((prev) => ({ ...prev, [key]: val }));
  };

  // Live SVG code using exact canvas dimensions
  const currentSvg = useMemo(() => {
    return generateTornPaperSvg(activeStyle.id, params, canvasWidth, canvasHeight);
  }, [activeStyle.id, params, canvasWidth, canvasHeight]);

  // High-Resolution 4K and 8K Download Handler
  const handleDownloadPng = async (targetWidth: number, targetHeight: number, label: string) => {
    try {
      setIsExporting(label);
      const highResSvg = generateTornPaperSvg(activeStyle.id, params, targetWidth, targetHeight);
      const blob = await exportToPng(highResSvg, targetWidth, targetHeight);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const fileName = `torn paper ${singleDownloadIndex}.png`;
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSingleDownloadIndex((prev) => prev + 1);

      setExportSuccess(`${fileName} sRGB (${targetWidth}×${targetHeight} px) ডাউনলোড সফল!`);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (err) {
      console.error('Export PNG failed', err);
      alert('PNG রেন্ডার করতে সমস্যা হয়েছে। ব্রাউজার মেমরি চেক করুন।');
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadSvg = () => {
    try {
      setIsExporting('svg');
      const blob = new Blob([currentSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const fileName = `torn paper ${singleDownloadIndex}.svg`;
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSingleDownloadIndex((prev) => prev + 1);

      setExportSuccess(`${fileName} ডাউনলোড সফল!`);
      setTimeout(() => setExportSuccess(null), 2500);
    } catch (err) {
      console.error('Export SVG failed', err);
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadAi = () => {
    try {
      setIsExporting('ai');
      const aiReadySvg = `<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: TornCraft 8K Vector Engine for Adobe Illustrator -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
${currentSvg}`;

      const blob = new Blob([aiReadySvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const fileName = `torn paper ${singleDownloadIndex}.ai`;
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSingleDownloadIndex((prev) => prev + 1);

      setExportSuccess(`${fileName} ডাউনলোড সফল!`);
      setTimeout(() => setExportSuccess(null), 2500);
    } catch (err) {
      console.error('Export AI failed', err);
    } finally {
      setIsExporting(null);
    }
  };

  // Stock Title & Tags reflecting selected dimensions and 8K/4K resolutions
  const stockTitle = `Realistic ${activeStyle.nameEn} with cellulose fibers, exposed pulp core and soft drop shadow on transparent background - 8K (${resolutions.k8.width}x${resolutions.k8.height}) 4K Ultra HD Stock Asset`;

  const fullTags = [
    ...activeStyle.tags,
    'torn paper png',
    'ripped paper edge',
    '8k torn paper',
    '4k high resolution',
    'true transparent png',
    'cellulose fibers',
    'exposed white core',
    'vector torn paper frame',
    'burst paper hole',
    'deckle edge paper',
    'kraft paper tear',
    'curled paper banner',
    'split paper window',
    `${resolutions.k8.width}x${resolutions.k8.height}`,
    `${resolutions.k4.width}x${resolutions.k4.height}`,
    activePreset ? `${activePreset.nameEn.toLowerCase()} torn paper` : 'custom size torn paper',
    'isolated on transparent background',
    'adobe stock best seller'
  ];

  const handleCopyTags = () => {
    navigator.clipboard.writeText(fullTags.join(', '));
    setCopiedTags(true);
    setTimeout(() => setCopiedTags(false), 2000);
  };

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(stockTitle);
    setCopiedTitle(true);
    setTimeout(() => setCopiedTitle(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      {/* 1. SLIM & SLEEK CATEGORY & SUBMENU BAR (Low Height, High-Density Premium UI) */}
      <div className="bg-white border-b border-slate-200/90 sticky top-11 z-30 shadow-2xs">
        {/* Compact Category Tabs */}
        <div className="max-w-7xl mx-auto px-3.5 py-0.5 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            {TORN_PAPER_CATEGORIES.map((cat) => {
              const isSel = cat.id === activeCategoryId;
              const isExclusive = cat.id === 'exclusive';
              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat.id)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                    isSel
                      ? isExclusive
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'bg-slate-900 text-white shadow-xs'
                      : isExclusive
                        ? 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 font-black'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isExclusive && <Star className="w-2.5 h-2.5 fill-current" />}
                  <span>{cat.titleBn}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
            <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
            <span>৮K sRGB • True Alpha</span>
          </div>
        </div>

        {/* Compact Sub-menu of Styles */}
        <div className="max-w-7xl mx-auto px-3.5 py-0.5 bg-slate-50/70">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[9px] font-black text-amber-900 bg-amber-100/90 border border-amber-300 px-1 py-0.5 rounded shrink-0 flex items-center gap-0.5">
              <Star className="w-2 h-2 fill-amber-500 text-amber-600" />
              <span>{activeCategoryId === 'exclusive' ? 'এক্সক্লুসিভ:' : 'স্টাইল:'}</span>
            </span>
            {currentStylesList.map((style) => {
              const isCurrent = style.id === activeStyleId;
              return (
                <button
                  key={style.id}
                  onClick={() => handleSelectStyle(style)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                    isCurrent
                      ? 'bg-amber-600 text-white font-black shadow-xs ring-1 ring-amber-500/30'
                      : 'bg-white hover:bg-amber-50 text-slate-800 border border-slate-200 hover:border-amber-300'
                  }`}
                >
                  {style.isExclusive && <Star className="w-2 h-2 fill-current text-amber-400" />}
                  <span>{style.nameBn}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. COMPACT UNIFIED CONTROL DECK & FIXED PREVIEW CANVAS */}
      <div className="bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3.5 py-1.5">
          
          {/* STREAMLINED LOW-HEIGHT CONTROL DECK */}
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-xl px-2.5 py-1 mb-1.5 shadow-2xs text-white flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <Wand2 className="w-3 h-3 text-white" />
              </div>
              <div className="leading-tight">
                <h3 className="text-xs font-black flex items-center gap-1">
                  <span>৫০০০+ রিয়ালিস্টিক টর্ন পেপার জেনারেটর</span>
                  <span className="text-[9px] text-amber-950 bg-white/80 px-1 py-0.2 rounded font-black hidden md:inline">
                    Adobe Stock 8K sRGB
                  </span>
                </h3>
              </div>
            </div>

            {/* Quick Action Buttons directly in top deck */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Requested 50 & 30 Batch 1-Click triggers */}
              <button
                onClick={() => handleOpenMegaBatch(50, true)}
                className="px-2 py-0.5 bg-amber-950 text-amber-200 hover:bg-black active:scale-95 rounded-md font-black text-[11px] shadow-xs transition-all cursor-pointer flex items-center gap-1 border border-amber-400/40"
                title="এক ক্লিকে ৫০টি বিভিন্ন স্টাইলের ৮K PNG ফাইল অটো-ডাউনলোড করুন"
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>👑 ১-ক্লিক ৫০টি ৮K (অটো)</span>
              </button>

              <button
                onClick={() => handleOpenMegaBatch(30, true)}
                className="px-2 py-0.5 bg-white/20 hover:bg-white/30 active:scale-95 text-white rounded-md font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1"
                title="এক ক্লিকে ৩০টি স্বতন্ত্র স্টাইলের ৮K PNG ডাউনলোড করুন"
              >
                <span>⚡ ১-ক্লিক ৩০টি ৮K</span>
              </button>

              <button
                onClick={handleGenerateNextStyle}
                className="px-2 py-0.5 bg-white hover:bg-amber-50 active:scale-95 text-amber-900 rounded-md font-black text-[11px] shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                title="রেন্ডম নতুন রূপ দেখুন"
              >
                <span>🎲 নতুন স্টাইল</span>
              </button>

              <button
                onClick={handleReset}
                className="p-1 bg-white/20 hover:bg-white/30 text-white rounded-md transition-colors cursor-pointer"
                title="ডিফল্ট সেটিংসে রিসেট"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 📐 COMPACT PNG GENERAL SIZE & 4K / 8K RESOLUTION CONTROLLER */}
          <div className="bg-slate-50/90 border border-slate-200/90 rounded-xl p-1.5 mb-1.5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-1 mb-1 pb-1 border-b border-slate-200/80">
              <div className="flex items-center gap-1">
                <Maximize2 className="w-3 h-3 text-amber-600" />
                <span className="text-[11px] font-black text-slate-900">
                  PNG সাইজ ও রেজোলিউশন:
                </span>
                <span className="text-[9px] text-amber-800 bg-amber-100/70 px-1 py-0.2 rounded font-bold">
                  {activePreset ? activePreset.nameEn : 'Custom'}
                </span>
              </div>

              {/* Realtime Size & Resolution Specification Badges */}
              <div className="flex flex-wrap items-center gap-1 text-[9px]">
                <span className="px-1.5 py-0.2 rounded bg-white border border-slate-200 text-slate-700 font-bold">
                  ক্যানভাস: <strong className="text-amber-900 font-mono">{canvasWidth}×{canvasHeight}px</strong>
                </span>
                <span className="px-1.5 py-0.2 rounded bg-blue-50 border border-blue-200 text-blue-700 font-bold">
                  ৪K: <strong className="font-mono">{resolutions.k4.width}×{resolutions.k4.height}px</strong>
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-50 border border-amber-300 text-amber-900 font-black flex items-center gap-0.5">
                  <Sparkles className="w-2 h-2 text-amber-600" />
                  ৮K sRGB: <strong className="font-mono">{resolutions.k8.width}×{resolutions.k8.height}px</strong>
                </span>
              </div>
            </div>

            {/* Presets Button Row */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {SIZE_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleSelectSizePreset(preset.id)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs ring-1 ring-slate-700'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                    title={`${preset.nameEn}: 4K (${preset.export4kWidth}×${preset.export4kHeight}px) | 8K (${preset.export8kWidth}×${preset.export8kHeight}px)`}
                  >
                    <span className={`text-[8px] font-mono px-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {preset.ratio}
                    </span>
                    <span>{preset.nameBn.split(' ')[0]}</span>
                  </button>
                );
              })}

              {/* Custom Size Toggle */}
              <button
                onClick={() => setSelectedPresetId('custom')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                  selectedPresetId === 'custom'
                    ? 'bg-amber-600 text-white shadow-xs ring-1 ring-amber-500'
                    : 'bg-white hover:bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                <Sliders className="w-2.5 h-2.5" />
                <span>কাস্টম</span>
              </button>
            </div>

            {/* Custom Dimensions Configurator */}
            {selectedPresetId === 'custom' && (
              <div className="mt-1 pt-1 border-t border-slate-200/90 flex flex-wrap items-center gap-1.5 text-xs bg-white/80 p-1.5 rounded-lg border border-amber-100">
                <div className="flex items-center gap-1">
                  <label className="text-[10px] font-bold text-slate-700">W:</label>
                  <input
                    type="number"
                    min={200}
                    max={8000}
                    step={50}
                    value={customWidth}
                    onChange={(e) => handleCustomWidthChange(Number(e.target.value))}
                    className="w-16 px-1 py-0.5 border border-slate-300 rounded text-[11px] font-mono font-bold bg-white text-slate-800"
                  />
                  <span className="text-[9px] text-slate-400">px</span>
                </div>

                <div className="flex items-center gap-1">
                  <label className="text-[10px] font-bold text-slate-700">H:</label>
                  <input
                    type="number"
                    min={200}
                    max={8000}
                    step={50}
                    value={customHeight}
                    onChange={(e) => handleCustomHeightChange(Number(e.target.value))}
                    className="w-16 px-1 py-0.5 border border-slate-300 rounded text-[11px] font-mono font-bold bg-white text-slate-800"
                  />
                  <span className="text-[9px] text-slate-400">px</span>
                </div>

                <button
                  onClick={() => setIsRatioLocked(!isRatioLocked)}
                  className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                    isRatioLocked
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}
                  title={isRatioLocked ? 'অনুপাত লকড্' : 'আনলকড্'}
                >
                  {isRatioLocked ? <Lock className="w-2.5 h-2.5 text-amber-600" /> : <Unlock className="w-2.5 h-2.5 text-slate-400" />}
                  <span>{isRatioLocked ? 'লকড্' : 'আনলক'}</span>
                </button>

                <button
                  onClick={handleSwapOrientation}
                  className="px-1.5 py-0.5 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                  title="প্রস্থ ও উচ্চতা অদল-বদল"
                >
                  <ArrowLeftRight className="w-2.5 h-2.5" />
                  <span>অদল-বদল</span>
                </button>
              </div>
            )}
          </div>

          {/* Sub Bar for Canvas Modes & Active Info */}
          <div className="flex items-center justify-between gap-1.5 mb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-wide flex items-center gap-1">
                <Eye className="w-3 h-3 text-amber-600" />
                লাইভ ক্যানভাস
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-mono">
                #{params.seed}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 font-bold border border-amber-200">
                {activeStyle.nameEn}
              </span>
            </div>

            {/* Background Modes */}
            <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200 text-[10px]">
              <button
                onClick={() => setBgMode('transparent')}
                className={`px-1.5 py-0.2 rounded font-medium transition-colors cursor-pointer flex items-center gap-0.5 ${
                  bgMode === 'transparent' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="স্বচ্ছ গ্রিড"
              >
                <Grid3X3 className="w-2.5 h-2.5" />
                <span>স্বচ্ছ</span>
              </button>

              <button
                onClick={() => setBgMode('white')}
                className={`px-1.5 py-0.2 rounded font-medium transition-colors cursor-pointer ${
                  bgMode === 'white' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                সাদা
              </button>

              <button
                onClick={() => setBgMode('dark')}
                className={`px-1.5 py-0.2 rounded font-medium transition-colors cursor-pointer ${
                  bgMode === 'dark' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="কন্ট্রাস্ট"
              >
                কন্ট্রাস্ট
              </button>

              <button
                onClick={() => setBgMode('mockup')}
                className={`px-1.5 py-0.2 rounded font-medium transition-colors cursor-pointer ${
                  bgMode === 'mockup' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                মকআপ
              </button>
            </div>
          </div>

          {/* STREAMLINED COMPACT INTERACTIVE CANVAS (Low Height for instant Desktop feel) */}
          <div className="relative w-full h-[205px] sm:h-[225px] md:h-[245px] rounded-xl border border-slate-300/80 overflow-hidden shadow-inner flex items-center justify-center p-2">
            {bgMode === 'transparent' && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, #f1f5f9 25%, transparent 25%), 
                    linear-gradient(-45deg, #f1f5f9 25%, transparent 25%), 
                    linear-gradient(45deg, transparent 75%, #f1f5f9 75%), 
                    linear-gradient(-45deg, transparent 75%, #f1f5f9 75%)
                  `,
                  backgroundSize: '12px 12px',
                  backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
                  backgroundColor: '#ffffff',
                }}
              />
            )}

            {bgMode === 'white' && <div className="absolute inset-0 bg-white" />}
            {bgMode === 'dark' && <div className="absolute inset-0 bg-slate-900" />}
            {bgMode === 'mockup' && (
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100/60 via-slate-100 to-amber-50">
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px]" />
              </div>
            )}

            {/* Rendered SVG - perfectly contained with true proportions */}
            <div
              className="relative z-10 w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto [&>svg]:object-contain [&>svg]:drop-shadow-sm"
              dangerouslySetInnerHTML={{ __html: currentSvg }}
            />

            {exportSuccess && (
              <div className="absolute top-2 z-30 bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-md flex items-center gap-1 animate-bounce">
                <Check className="w-3 h-3" />
                <span>{exportSuccess}</span>
              </div>
            )}
          </div>

          {/* 🚀 HIGH-DENSITY DYNAMIC DOWNLOAD BAR (With 1-Click 50 & 30 Batch Options and sRGB Mode) */}
          <div className="mt-1.5 flex flex-wrap items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="font-bold text-slate-800">এক্সপোর্ট:</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
                <span>🎨 sRGB Mode</span>
                <span className="text-slate-400 font-normal hidden lg:inline">• True Alpha Transparent</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1 ml-auto">
              {/* Requested 1-Click 50 Batch Auto Download button */}
              <button
                onClick={() => handleOpenMegaBatch(50, true)}
                className="px-2.5 py-1 rounded-lg text-xs font-black text-amber-950 bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                title="১-ক্লিকে ৫০টি বিভিন্ন স্টাইলের ৮K PNG ফাইল অটো-ডাউনলোড করুন"
              >
                <Sparkles className="w-3 h-3" />
                <span>👑 ১-ক্লিক ৫০টি ৮K (অটো)</span>
              </button>

              {/* Requested 30 Batch Download button */}
              <button
                onClick={() => handleOpenMegaBatch(30, true)}
                className="px-2 py-1 rounded-lg text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors cursor-pointer flex items-center gap-1"
                title="১-ক্লিকে ৩০টি বিভিন্ন স্টাইলের ৮K PNG ডাউনলোড করুন"
              >
                <span>⚡ ১-ক্লিক ৩০টি ৮K</span>
              </button>

              {/* 8K Ultra HD PNG */}
              <button
                onClick={() => handleDownloadPng(resolutions.k8.width, resolutions.k8.height, '৮K Ultra PNG')}
                disabled={isExporting !== null}
                className="px-2.5 py-1 rounded-lg text-[11px] font-black text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 shadow-2xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                title={`${resolutions.k8.width} × ${resolutions.k8.height} px sRGB`}
              >
                {isExporting === '৮K Ultra PNG' ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                <span>৮K sRGB ({resolutions.k8.width}×{resolutions.k8.height})</span>
              </button>

              {/* 4K PNG */}
              <button
                onClick={() => handleDownloadPng(resolutions.k4.width, resolutions.k4.height, '৪K PNG')}
                disabled={isExporting !== null}
                className="px-2 py-1 rounded-lg text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-2xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                title={`${resolutions.k4.width} × ${resolutions.k4.height} px sRGB`}
              >
                {isExporting === '৪K PNG' ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                <span>৪K sRGB</span>
              </button>

              {/* 2K PNG */}
              <button
                onClick={() => handleDownloadPng(resolutions.k2.width, resolutions.k2.height, '২K PNG')}
                disabled={isExporting !== null}
                className="px-2 py-1 rounded-md text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                ২K
              </button>

              {/* SVG Vector */}
              <button
                onClick={handleDownloadSvg}
                disabled={isExporting !== null}
                className="px-2 py-1 rounded-md text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                <FileCode className="w-2.5 h-2.5 text-indigo-600" />
                <span>SVG</span>
              </button>

              {/* Adobe Illustrator */}
              <button
                onClick={handleDownloadAi}
                disabled={isExporting !== null}
                className="px-2 py-1 rounded-md text-[11px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                <Palette className="w-2.5 h-2.5 text-amber-600" />
                <span>ইলাস্ট্রেটর (.ai)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. COMPACT TABBED CONTROLS BELOW PREVIEW (Low Height, High Aesthetic Density) */}
      <div className="max-w-7xl mx-auto px-3.5 py-2">
        {/* Navigation Tabs for Lower Controls */}
        <div className="flex items-center gap-1.5 mb-2 border-b border-slate-200 pb-1.5">
          <button
            onClick={() => setControlTab('edge-fiber')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              controlTab === 'edge-fiber'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>১. ফাইবার, এজ ও শ্যাডো কন্ট্রোল</span>
          </button>

          <button
            onClick={() => setControlTab('materials')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              controlTab === 'materials'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Palette className="w-3 h-3" />
            <span>২. পেপার ম্যাটেরিয়াল ও রং</span>
          </button>

          <button
            onClick={() => setControlTab('metadata')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              controlTab === 'metadata'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            <span>৩. Adobe Stock মেটাডাটা ও ট্যাগ</span>
          </button>
        </div>

        {/* Tab 1: Edge & Fiber & Shadow Sliders */}
        {controlTab === 'edge-fiber' && (
          <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {/* Fiber Length */}
              <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">ফাইবার দৈর্ঘ্য</label>
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1 rounded">
                    {params.fiberLength}px
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="28"
                  step="1"
                  value={params.fiberLength}
                  onChange={(e) => updateParam('fiberLength', Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Fiber Density */}
              <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">ফাইবার ঘনত্ব</label>
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1 rounded">
                    {params.fiberDensity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={params.fiberDensity}
                  onChange={(e) => updateParam('fiberDensity', Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Tear Roughness */}
              <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">ছেঁড়ার কর্কশতা</label>
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1 rounded">
                    {params.tearRoughness}%
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="95"
                  step="2"
                  value={params.tearRoughness}
                  onChange={(e) => updateParam('tearRoughness', Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Paper Thickness / Pulp Core */}
              <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">পাল্প কোর পুরুত্ব</label>
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1 rounded">
                    {params.paperThickness}px
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="18"
                  step="1"
                  value={params.paperThickness}
                  onChange={(e) => updateParam('paperThickness', Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Crumple Intensity */}
              <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">ভাঁজ ও বলিরেখা</label>
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1 rounded">
                    {params.crumpleIntensity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={params.crumpleIntensity}
                  onChange={(e) => updateParam('crumpleIntensity', Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Shadow Blur */}
              <div className="bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-semibold text-slate-700">শ্যাডো ব্লার</label>
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-1 rounded">
                    {params.shadowBlur}px
                  </span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="45"
                  step="2"
                  value={params.shadowBlur}
                  onChange={(e) => updateParam('shadowBlur', Number(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg accent-amber-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Materials & Colors */}
        {controlTab === 'materials' && (
          <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 mb-2.5">
              {MATERIAL_PRESETS.map((m) => (
                <button
                  key={m.label}
                  onClick={() => {
                    setParams((prev) => ({
                      ...prev,
                      paperColor: m.color,
                      innerPulpColor: m.pulp,
                      textureGrain: m.grain,
                    }));
                  }}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                    params.paperColor.toLowerCase() === m.color.toLowerCase()
                      ? 'border-amber-600 bg-amber-50/60 text-amber-950 ring-1 ring-amber-500/20 font-bold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: m.color }}
                  />
                  <span className="truncate">{m.label}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
                <span className="text-[10px] font-semibold text-slate-600">কাগজের রং:</span>
                <input
                  type="color"
                  value={params.paperColor}
                  onChange={(e) => updateParam('paperColor', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={params.paperColor}
                  onChange={(e) => updateParam('paperColor', e.target.value)}
                  className="w-16 px-1 text-[10px] font-mono font-bold bg-white border border-slate-200 rounded uppercase"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
                <span className="text-[10px] font-semibold text-slate-600">পাল্প কোর:</span>
                <input
                  type="color"
                  value={params.innerPulpColor}
                  onChange={(e) => updateParam('innerPulpColor', e.target.value)}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={params.innerPulpColor}
                  onChange={(e) => updateParam('innerPulpColor', e.target.value)}
                  className="w-16 px-1 text-[10px] font-mono font-bold bg-white border border-slate-200 rounded uppercase"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Metadata & Tags */}
        {controlTab === 'metadata' && (
          <div className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span>Adobe Stock টাইটেল:</span>
                  <button
                    onClick={handleCopyTitle}
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-0.5 text-[10px] font-bold cursor-pointer"
                  >
                    {copiedTitle ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                    <span>{copiedTitle ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                  </button>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] text-slate-800 font-medium">
                  {stockTitle}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span>কীওয়ার্ড ও ট্যাগ ({fullTags.length}টি):</span>
                  <button
                    onClick={handleCopyTags}
                    className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded-md flex items-center gap-1 text-[10px] font-bold cursor-pointer"
                  >
                    {copiedTags ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTags ? 'কপি হয়েছে!' : 'সব ট্যাগ কপি'}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                  {fullTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.2 bg-white border border-slate-200 text-slate-700 rounded text-[10px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Integrated Mega 50 & 30 Batch Exporter Modal */}
      <TornPaperBatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        baseParams={params}
        initialCount={batchModalCount}
        initialFormat="png-8k"
        currentPresetId={selectedPresetId}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
        export8kW={resolutions.k8.width}
        export8kH={resolutions.k8.height}
        export4kW={resolutions.k4.width}
        export4kH={resolutions.k4.height}
        autoStart={batchAutoStart}
      />
    </div>
  );
};
