import React, { useState, useRef, useEffect } from 'react';
import { X, Sparkles, Download, Check, Layers, RefreshCw, Maximize2, StopCircle } from 'lucide-react';
import { TornPaperParams, TornPaperStyle } from '../types/tornPaper';
import { generateTornPaperSvg } from '../generators/tornPaperEngine';
import { exportToPng } from '../generators/renderEngine';
import { SIZE_PRESETS } from '../data/sizePresets';
import { TORN_PAPER_STYLES } from '../data/tornPaperData';

interface TornPaperBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  style?: TornPaperStyle;
  baseParams: TornPaperParams;
  initialCount?: number;
  initialFormat?: 'png-8k' | 'png-4k' | 'svg';
  currentPresetId?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  export8kW?: number;
  export8kH?: number;
  export4kW?: number;
  export4kH?: number;
  autoStart?: boolean;
}

export const TornPaperBatchModal: React.FC<TornPaperBatchModalProps> = ({
  isOpen,
  onClose,
  style,
  baseParams,
  initialCount = 50,
  initialFormat = 'png-8k',
  currentPresetId = 'square-1-1',
  canvasWidth = 1000,
  canvasHeight = 1000,
  export8kW = 8000,
  export8kH = 8000,
  export4kW = 4000,
  export4kH = 4000,
  autoStart = false,
}) => {
  const [count, setCount] = useState<number>(initialCount);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(currentPresetId);
  const [format, setFormat] = useState<'png-8k' | 'png-4k' | 'svg'>(initialFormat);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);
  const [currentStyleName, setCurrentStyleName] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [completed, setCompleted] = useState(false);
  const isCancelledRef = useRef<boolean>(false);

  // Sync props when modal opens
  useEffect(() => {
    if (isOpen) {
      setCount(initialCount);
      setFormat(initialFormat);
      setSelectedPresetId(currentPresetId);
      setProgress(0);
      setCompleted(false);
      setCurrentFileIndex(0);
      isCancelledRef.current = false;
      if (autoStart) {
        // Start immediately with initialCount
        executeBatch(initialCount, initialFormat, currentPresetId);
      }
    }
  }, [isOpen, initialCount, initialFormat, currentPresetId, autoStart]);

  if (!isOpen) return null;

  const activePreset = SIZE_PRESETS.find((p) => p.id === selectedPresetId);
  const active8kW = activePreset ? activePreset.export8kWidth : export8kW;
  const active8kH = activePreset ? activePreset.export8kHeight : export8kH;
  const active4kW = activePreset ? activePreset.export4kWidth : export4kW;
  const active4kH = activePreset ? activePreset.export4kHeight : export4kH;
  const activeBaseW = activePreset ? activePreset.baseWidth : canvasWidth;
  const activeBaseH = activePreset ? activePreset.baseHeight : canvasHeight;

  const handleCancel = () => {
    isCancelledRef.current = true;
    setIsProcessing(false);
  };

  const executeBatch = async (
    targetCount: number,
    targetFormat: 'png-8k' | 'png-4k' | 'svg',
    targetPresetId: string
  ) => {
    setIsProcessing(true);
    setProgress(0);
    setCompleted(false);
    setCurrentFileIndex(0);
    isCancelledRef.current = false;

    const currentPreset = SIZE_PRESETS.find((p) => p.id === targetPresetId);
    const p8kW = currentPreset ? currentPreset.export8kWidth : export8kW;
    const p8kH = currentPreset ? currentPreset.export8kHeight : export8kH;
    const p4kW = currentPreset ? currentPreset.export4kWidth : export4kW;
    const p4kH = currentPreset ? currentPreset.export4kHeight : export4kH;
    const pBaseW = currentPreset ? currentPreset.baseWidth : canvasWidth;
    const pBaseH = currentPreset ? currentPreset.baseHeight : canvasHeight;

    // Shuffle styles from the available 57 styles so each batch item gets a distinct realistic style!
    const shuffledStyles = [...TORN_PAPER_STYLES].sort(() => 0.5 - Math.random());

    try {
      for (let i = 0; i < targetCount; i++) {
        if (isCancelledRef.current) {
          break;
        }

        setCurrentFileIndex(i + 1);
        const currentStyle = shuffledStyles[i % shuffledStyles.length];
        setCurrentStyleName(currentStyle.nameBn);

        const itemSeed = Math.floor(Math.random() * 900000000 + 100000000);

        // Retain the user's customized parameters (shadow, fibers, colors, texture) while adopting the style's archetype
        const variantParams: TornPaperParams = {
          ...baseParams,
          ...currentStyle.defaultParams,
          seed: itemSeed,
          width: pBaseW,
          height: pBaseH,
          // Preserve custom shadow & fiber feel
          shadowBlur: baseParams.shadowBlur,
          shadowOpacity: baseParams.shadowOpacity,
          paperColor: baseParams.paperColor || currentStyle.defaultParams.paperColor || '#fafaf9',
          innerPulpColor: baseParams.innerPulpColor || currentStyle.defaultParams.innerPulpColor || '#ffffff',
          tearRoughness: currentStyle.defaultParams.tearRoughness || baseParams.tearRoughness || 48,
          fiberDensity: baseParams.fiberDensity || 65,
          fiberLength: baseParams.fiberLength || 8,
          scale: baseParams.scale || 85,
        };

        const safeStyleName = currentStyle.nameEn.replace(/[^a-zA-Z0-9]/g, '');

        if (targetFormat === 'png-8k') {
          // Native 8K vector rendering with exact canvas size and sRGB profile embedding
          const svgCode = generateTornPaperSvg(currentStyle.id, variantParams, p8kW, p8kH);
          const blob = await exportToPng(svgCode, p8kW, p8kH);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `torn paper ${i + 1}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else if (targetFormat === 'png-4k') {
          const svgCode = generateTornPaperSvg(currentStyle.id, variantParams, p4kW, p4kH);
          const blob = await exportToPng(svgCode, p4kW, p4kH);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `torn paper ${i + 1}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          const svgCode = generateTornPaperSvg(currentStyle.id, variantParams, pBaseW, pBaseH);
          const blob = new Blob([svgCode], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `torn paper ${i + 1}.svg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }

        setProgress(Math.round(((i + 1) / targetCount) * 100));

        // 380ms delay between files so browser downloads sequentially without throttling
        await new Promise((res) => setTimeout(res, 380));
      }

      if (!isCancelledRef.current) {
        setCompleted(true);
      }
    } catch (err) {
      console.error('Batch generation failed', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateBatch = () => {
    executeBatch(count, format, selectedPresetId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-amber-500/10 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900">
                ১-ক্লিকে ৫০টি / ৩০টি ৮K মেগা ব্যাচ এক্সপোর্ট
              </h3>
              <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase">
                sRGB Mode
              </span>
            </div>
            <p className="text-xs text-slate-500">
              ৫০টি স্বতন্ত্র স্টাইল থেকে রেন্ডমলি আলাদা আলাদা ৮K sRGB True Alpha PNG ফাইল অটো-ডাউনলোড হবে
            </p>
          </div>
        </div>

        <div className="space-y-3.5 my-4">
          {/* File Count Selector - Prominent 50 & 30 options */}
          <div>
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between mb-1.5">
              <span>কয়টি ইউনিক ডিজাইনের স্টক প্যাক তৈরি করবেন:</span>
              <span className="text-[11px] text-amber-700 font-black">নির্বাচিত: {count}টি ফাইল</span>
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {[
                { n: 50, label: '৫০টি মেগা প্যাক', tag: 'বেস্ট সেলার', highlight: true },
                { n: 30, label: '৩০টি ফাইল', tag: 'জনপ্রিয়', highlight: true },
                { n: 20, label: '২০টি ফাইল', tag: 'স্ট্যান্ডার্ড', highlight: false },
                { n: 10, label: '১০টি ফাইল', tag: 'মিনি প্যাক', highlight: false },
                { n: 5, label: '৫টি ফাইল', tag: 'টেস্ট', highlight: false },
              ].map(({ n, label, tag, highlight }) => (
                <button
                  key={n}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setCount(n)}
                  className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer disabled:opacity-50 ${
                    count === n
                      ? 'border-amber-600 bg-amber-500 text-white font-black shadow-xs ring-2 ring-amber-400/40'
                      : highlight
                        ? 'border-amber-300 bg-amber-50/70 text-amber-900 hover:bg-amber-100 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="text-xs sm:text-sm font-black">{n}টি</div>
                  <div className={`text-[9px] truncate ${count === n ? 'text-white/90' : 'text-slate-500'}`}>
                    {tag}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Size Preset Selector */}
          <div>
            <label className="text-xs font-bold text-slate-800 flex items-center justify-between mb-1.5">
              <span className="flex items-center gap-1">
                <Maximize2 className="w-3.5 h-3.5 text-amber-600" />
                <span>সাধারণ সাইজ ও অ্যাসপেক্ট রেশিও:</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                ৮K: {active8kW}×{active8kH}px
              </span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {SIZE_PRESETS.slice(0, 8).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  disabled={isProcessing}
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`py-1 px-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer text-left disabled:opacity-50 ${
                    selectedPresetId === preset.id
                      ? 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-500/40'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-mono text-[9px] text-amber-700">{preset.ratio}</div>
                  <div className="truncate text-[10px]">{preset.nameBn.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Format Selector */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              এক্সপোর্ট ফরম্যাট ও রেজোলিউশন:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setFormat('png-8k')}
                className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                  format === 'png-8k'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-500/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-amber-700 font-black">
                  <Sparkles className="w-3 h-3" />
                  <span>৮K sRGB PNG</span>
                </div>
                <span className="block text-[10px] font-mono text-slate-600 mt-0.5">
                  {active8kW} × {active8kH} px
                </span>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setFormat('png-4k')}
                className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                  format === 'png-4k'
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-500/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-blue-700 font-black">৪K sRGB PNG</div>
                <span className="block text-[10px] font-mono text-slate-600 mt-0.5">
                  {active4kW} × {active4kH} px
                </span>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setFormat('svg')}
                className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer disabled:opacity-50 ${
                  format === 'svg'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-indigo-700 font-black">SVG Vector</div>
                <span className="block text-[10px] text-slate-500 mt-0.5">
                  ইলাস্ট্রেটর ভেক্টর
                </span>
              </button>
            </div>
          </div>

          {/* Active Generation Progress Indicator */}
          {isProcessing && (
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-xs font-black text-slate-800">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span>ডাউনলোড হচ্ছে [{currentFileIndex}/{count}]: <strong className="text-amber-900">{currentStyleName}</strong></span>
                </span>
                <span className="font-mono text-amber-900">{progress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500 text-center">
                ব্রাউজারে প্রতি {format === 'png-8k' ? '৮K' : '৪K'} ফাইল আলাদা আলাদা ডাউনলোড হচ্ছে... অনুগ্রহ করে ট্যাব বন্ধ করবেন না।
              </p>
            </div>
          )}

          {/* Completed Confirmation */}
          {completed && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>🎉 সফল! {count}টি সম্পূর্ণ স্বতন্ত্র স্টাইলের ৮K Torn Paper ফাইল সফলভাবে ডাউনলোড সম্পন্ন হয়েছে!</span>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
          {isProcessing ? (
            <button
              onClick={handleCancel}
              className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <StopCircle className="w-4 h-4" />
              <span>থামান (Cancel)</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              বন্ধ করুন
            </button>
          )}

          <button
            onClick={handleGenerateBatch}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer ml-auto"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>১-ক্লিকে {count}টি ৮K ফাইল অটো-ডাউনলোড শুরু করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
