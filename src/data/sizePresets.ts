export interface SizePreset {
  id: string;
  nameBn: string;
  nameEn: string;
  ratio: string;
  baseWidth: number;
  baseHeight: number;
  export4kWidth: number;
  export4kHeight: number;
  export8kWidth: number;
  export8kHeight: number;
  descriptionBn: string;
}

export const SIZE_PRESETS: SizePreset[] = [
  {
    id: 'square-1-1',
    nameBn: '১:১ স্কয়ার (Instagram/Stock)',
    nameEn: '1:1 Square',
    ratio: '1:1',
    baseWidth: 1000,
    baseHeight: 1000,
    export4kWidth: 4000,
    export4kHeight: 4000,
    export8kWidth: 8000,
    export8kHeight: 8000,
    descriptionBn: 'Adobe Stock-এর ক্লাসিক স্কয়ার টর্ন পেপার ফ্রেম ও কাটআউট'
  },
  {
    id: 'banner-16-9',
    nameBn: '১৬:৯ ওয়াইড ব্যানার (Wallpaper/Web)',
    nameEn: '16:9 Wide Banner',
    ratio: '16:9',
    baseWidth: 1600,
    baseHeight: 900,
    export4kWidth: 3840,
    export4kHeight: 2160,
    export8kWidth: 7680,
    export8kHeight: 4320,
    descriptionBn: 'ইউটিউব থাম্বনেইল, ওয়েবসাইট ব্যানার ও হরিজন্টাল স্ট্রিপের জন্য সেরা'
  },
  {
    id: 'landscape-4-3',
    nameBn: '৪:৩ স্ট্যান্ডার্ড ল্যান্ডস্কেপ (Display)',
    nameEn: '4:3 Standard Landscape',
    ratio: '4:3',
    baseWidth: 1200,
    baseHeight: 900,
    export4kWidth: 4000,
    export4kHeight: 3000,
    export8kWidth: 8000,
    export8kHeight: 6000,
    descriptionBn: 'স্ট্যান্ডার্ড ডিজিটাল গ্রাফিক্স ও ফটো ফ্রেম কাটআউট'
  },
  {
    id: 'portrait-3-4',
    nameBn: '৩:৪ পোর্ট্রেট পোস্টার (Poster Frame)',
    nameEn: '3:4 Portrait Poster',
    ratio: '3:4',
    baseWidth: 900,
    baseHeight: 1200,
    export4kWidth: 3000,
    export4kHeight: 4000,
    export8kWidth: 6000,
    export8kHeight: 8000,
    descriptionBn: 'ওয়াল আর্ট, পোস্টার ব্যাকড্রপ ও ম্যাগাজিন কভার ছেঁড়া কাগজ'
  },
  {
    id: 'vertical-9-16',
    nameBn: '৯:১৬ মোবাইল স্টোরি (Reels/TikTok)',
    nameEn: '9:16 Mobile Story',
    ratio: '9:16',
    baseWidth: 900,
    baseHeight: 1600,
    export4kWidth: 2160,
    export4kHeight: 3840,
    export8kWidth: 4320,
    export8kHeight: 7680,
    descriptionBn: 'ইনস্টাগ্রাম রিলস, স্টোরি ও টিকটক ভার্টিক্যাল ভিডিও ওভারলে'
  },
  {
    id: 'print-a4',
    nameBn: 'A4 প্রিন্ট রেশিও (1:1.414)',
    nameEn: 'A4 Document Print',
    ratio: '1:1.414',
    baseWidth: 848,
    baseHeight: 1200,
    export4kWidth: 2828,
    export4kHeight: 4000,
    export8kWidth: 5656,
    export8kHeight: 8000,
    descriptionBn: 'আন্তর্জাতিক প্রিন্ট সাইজ, ব্রোশিওর ও স্টেশনারি ছেঁড়া কাগজ'
  },
  {
    id: 'photo-3-2',
    nameBn: '৩:২ ফটো ফ্রেম (Photography)',
    nameEn: '3:2 Classic Photo',
    ratio: '3:2',
    baseWidth: 1200,
    baseHeight: 800,
    export4kWidth: 4000,
    export4kHeight: 2667,
    export8kWidth: 8000,
    export8kHeight: 5333,
    descriptionBn: 'ডিএসএলআর ফটো কাটআউট ও ক্লাসিক ফটোগ্রাফি ফ্রেম'
  },
  {
    id: 'strip-2-1',
    nameBn: '২:১ লম্বা স্ট্রিপ (Border / Tape)',
    nameEn: '2:1 Horizontal Strip',
    ratio: '2:1',
    baseWidth: 1600,
    baseHeight: 800,
    export4kWidth: 4000,
    export4kHeight: 2000,
    export8kWidth: 8000,
    export8kHeight: 4000,
    descriptionBn: 'হেডার রিবন, বুকমার্ক ও লম্বা ছেঁড়া কাগজের স্ট্রিপ'
  }
];

/**
 * Calculates 4K and 8K export dimensions for any custom width and height
 */
export function calculateResolutions(width: number, height: number) {
  const w = Math.max(100, Math.min(10000, width));
  const h = Math.max(100, Math.min(10000, height));
  const aspect = w / h;

  // 4K Target: longest dimension ~4000px (or standard 3840px for 16:9)
  let k4W = 4000;
  let k4H = 4000;
  if (Math.abs(aspect - 16 / 9) < 0.05) {
    k4W = 3840;
    k4H = 2160;
  } else if (w >= h) {
    k4W = 4000;
    k4H = Math.round(4000 / aspect);
  } else {
    k4H = 4000;
    k4W = Math.round(4000 * aspect);
  }

  // 8K Target: longest dimension ~8000px (or standard 7680px for 16:9)
  let k8W = 8000;
  let k8H = 8000;
  if (Math.abs(aspect - 16 / 9) < 0.05) {
    k8W = 7680;
    k8H = 4320;
  } else if (w >= h) {
    k8W = 8000;
    k8H = Math.round(8000 / aspect);
  } else {
    k8H = 8000;
    k8W = Math.round(8000 * aspect);
  }

  // 2K Target: longest dimension ~2000px (or 1920 for 16:9)
  let k2W = 2000;
  let k2H = 2000;
  if (Math.abs(aspect - 16 / 9) < 0.05) {
    k2W = 1920;
    k2H = 1080;
  } else if (w >= h) {
    k2W = 2000;
    k2H = Math.round(2000 / aspect);
  } else {
    k2H = 2000;
    k2W = Math.round(2000 * aspect);
  }

  return {
    k2: { width: k2W, height: k2H },
    k4: { width: k4W, height: k4H },
    k8: { width: k8W, height: k8H },
  };
}
