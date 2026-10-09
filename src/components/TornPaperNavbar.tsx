import React from 'react';
import { 
  Scissors, 
  Layers, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Download 
} from 'lucide-react';

interface TornPaperNavbarProps {
  onOpenBatch: () => void;
  onOpenGuidelines: () => void;
  onOpenMega50?: () => void;
  onOpenMega30?: () => void;
}

export const TornPaperNavbar: React.FC<TornPaperNavbarProps> = ({
  onOpenBatch,
  onOpenGuidelines,
  onOpenMega50,
  onOpenMega30,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3.5 h-11 flex items-center justify-between">
        {/* Logo & Brand Title */}
        <div className="flex items-center gap-2 select-none">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <Scissors className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-sm font-black tracking-tight text-slate-900">
                TornCraft
              </span>
              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[9px] font-black uppercase">
                ৮K sRGB Studio
              </span>
            </div>
            <p className="text-[9px] text-slate-500 font-medium hidden sm:block mt-0.5">
              Adobe Stock • ৫০০০+ রিয়ালিস্টিক ছেঁড়া কাগজ • True Alpha
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* sRGB Mode Badge */}
          <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <span>🎨 sRGB Mode</span>
          </span>

          {/* Quick Mega 50 Pack trigger */}
          <button
            onClick={onOpenMega50 || onOpenBatch}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-black text-amber-950 bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 hover:from-amber-400 hover:to-orange-500 shadow-2xs transition-all cursor-pointer"
            title="১-ক্লিকে ৫০টি স্বতন্ত্র স্টাইলের ৮K মেগা স্টক প্যাক অটো-ডাউনলোড করুন"
          >
            <Sparkles className="w-3 h-3 text-amber-950" />
            <span className="hidden xs:inline">১-ক্লিক ৫০টি ৮K</span>
            <span className="xs:hidden">৫০টি ৮K</span>
          </button>

          {/* Quick Mega 30 Pack trigger */}
          <button
            onClick={onOpenMega30 || onOpenBatch}
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors cursor-pointer"
            title="১-ক্লিকে ৩০টি স্বতন্ত্র স্টাইলের ৮K PNG ডাউনলোড করুন"
          >
            <span>১-ক্লিক ৩০টি ৮K</span>
          </button>

          <button
            onClick={onOpenBatch}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            title="কাস্টম ব্যাচ এক্সপোর্টার"
          >
            <Layers className="w-3 h-3 text-slate-600" />
            <span className="hidden sm:inline">ব্যাচ এক্সপোর্ট</span>
          </button>

          <button
            onClick={onOpenGuidelines}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="অ্যাডোবি স্টক নির্দেশিকা"
          >
            <ShieldCheck className="w-3 h-3 text-slate-500" />
            <span className="hidden lg:inline">নির্দেশিকা</span>
          </button>

          <a
            href="https://helpx.adobe.com/stock/contributor/submit-your-content/submit-pngs/submit-png-files.html"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
            title="অফিসিয়াল অ্যাডোবি স্টক ডকুমেন্টেশন"
          >
            <span className="hidden xl:inline">Adobe Stock Docs</span>
            <ExternalLink className="w-3 h-3 text-blue-600" />
          </a>
        </div>
      </div>
    </header>
  );
};
