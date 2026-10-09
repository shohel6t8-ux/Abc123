import React from 'react';
import { X, ShieldCheck, CheckCircle2, ExternalLink } from 'lucide-react';

interface TornPaperGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TornPaperGuidelinesModal: React.FC<TornPaperGuidelinesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Adobe Stock-এ Torn Paper সাবমিশন নির্দেশিকা
            </h3>
            <p className="text-xs text-slate-500">
              বাস্তবসম্মত ছেঁড়া কাগজ জমা দেওয়ার জন্য অপরিহার্য স্টক নিয়মাবলি
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-1 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ১. প্রকৃত Alpha Transparency (স্বচ্ছ ব্যাকগ্রাউন্ড)
            </h4>
            <p className="text-slate-600">
              কাগজের শরীর অস্বচ্ছ (Opaque) থাকবে কিন্তু কাগজের বাইরের অংশ এবং ভেতরের কাটআউট উইন্ডো ১০০% স্বচ্ছ থাকবে। কোনো সাদা হ্যালো বা অপ্রয়োজনীয় পিক্সেল থাকবে না।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-1 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ২. ফাইবার ও অভ্যন্তরীণ পাল্প কোরের দৃশ্যমানতা
            </h4>
            <p className="text-slate-600">
              সাধারণ CSS ক্লিপ-পাথ দিয়ে আঁকা কাগজ স্টকে রিজেক্ট হতে পারে। বাস্তবসম্মত কাগজে সেলুলোজ তন্তু (Fibers) এবং ছেঁড়ার কারণে বের হওয়া সাদা পাল্প কোর স্তর থাকা বাঞ্ছনীয়। আমাদের ইঞ্জিন এটি নিখুঁতভাবে তৈরি করে।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-1 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ৩. ৮K ও ৪K ক্রিস্প আল্ট্রা রেজোলিউশন
            </h4>
            <p className="text-slate-600">
              Adobe Stock-এ উচ্চ রেজোলিউশনের অ্যাসেট সর্বাধিক ডাউনলোড পায়। এই স্টুডিওর ৮K (৭৬৮০×৭৬৮০ পিক্সেল) ও ৪K (৪০০০×৪০০০ পিক্সেল) এক্সপোর্ট সম্পূর্ণ ক্রিস্প প্রান্ত বজায় রাখে।
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-1 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ৪. ভেক্টর ও ইলাস্ট্রেটর (.ai / .svg) সমর্থন
            </h4>
            <p className="text-slate-600">
              ক্রেতারা Adobe Illustrator-এ ভেক্টর পাথ হিসেবে স্কেল ও রি-কালার করতে পছন্দ করে। সরাসরি .ai রেডি ভেক্টর ডাউনলোড করে ভেক্টর ক্যাটাগরিতে আপলোড করা যায়।
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <a
            href="https://helpx.adobe.com/stock/contributor/submit-your-content/submit-pngs/submit-png-files.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>অফিসিয়াল Adobe Stock PNG গাইডলাইন পড়ুন</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors cursor-pointer"
          >
            বুঝেছি, কাজ শুরু করুন
          </button>
        </div>
      </div>
    </div>
  );
};
