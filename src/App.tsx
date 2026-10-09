/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TornPaperNavbar } from './components/TornPaperNavbar';
import { TornPaperStudio } from './components/TornPaperStudio';
import { TornPaperBatchModal } from './components/TornPaperBatchModal';
import { TornPaperGuidelinesModal } from './components/TornPaperGuidelinesModal';
import { TORN_PAPER_STYLES } from './data/tornPaperData';
import { TornPaperParams } from './types/tornPaper';

export default function App() {
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [batchCount, setBatchCount] = useState<number>(50);
  const [batchAutoStart, setBatchAutoStart] = useState<boolean>(false);

  const handleOpenMega50 = () => {
    setBatchCount(50);
    setBatchAutoStart(true);
    setIsBatchOpen(true);
  };

  const handleOpenMega30 = () => {
    setBatchCount(30);
    setBatchAutoStart(true);
    setIsBatchOpen(true);
  };

  const handleOpenBatch = () => {
    setBatchCount(50);
    setBatchAutoStart(false);
    setIsBatchOpen(true);
  };

  // Default baseline params for batch modal reference
  const [baseParams] = useState<TornPaperParams>({
    seed: 123456789,
    width: 1000,
    height: 1000,
    aspectRatio: '1:1',
    customWidth: 1000,
    customHeight: 1000,
    archetype: 'full-sheet',
    paperPattern: 'plain',
    attachment: 'none',
    attachmentColor: '#fde047',
    tearRoughness: 48,
    tearFrequency: 25,
    tearDepth: 50,
    edgeStyle: 'rough',
    fiberDensity: 70,
    fiberLength: 10,
    fiberColor: '#ffffff',
    paperThickness: 6,
    innerPulpColor: '#ffffff',
    paperColor: '#fafaf9',
    surfaceTexture: 'smooth',
    textureGrain: 14,
    crumpleIntensity: 15,
    burnIntensity: 0,
    shadowBlur: 18,
    shadowOpacity: 0.35,
    shadowDistance: 12,
    shadowAngle: 90,
    layersCount: 1,
    curlAngle: 0,
    scale: 85,
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Dedicated Modern Header */}
      <TornPaperNavbar
        onOpenBatch={handleOpenBatch}
        onOpenGuidelines={() => setIsGuidelinesOpen(true)}
        onOpenMega50={handleOpenMega50}
        onOpenMega30={handleOpenMega30}
      />

      {/* 100% Dedicated Torn Paper Studio */}
      <main className="flex-1 flex flex-col">
        <TornPaperStudio onBackToHome={() => {}} />
      </main>

      {/* Modals */}
      <TornPaperGuidelinesModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
      />

      <TornPaperBatchModal
        isOpen={isBatchOpen}
        onClose={() => setIsBatchOpen(false)}
        style={TORN_PAPER_STYLES[0]}
        baseParams={baseParams}
        initialCount={batchCount}
        initialFormat="png-8k"
        autoStart={batchAutoStart}
      />

      {/* Modern Light Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">TornCraft 8K Studio</span>
            <span>•</span>
            <span>Photorealistic Torn Paper Generator for Adobe Stock</span>
          </div>
          <div className="text-slate-600 font-medium">
            ৮K ও ৪K True Alpha PNG • Adobe Illustrator (.ai / SVG) • Cellulose Fibers • ৫০০০+ প্রসিডিউরাল স্টাইল
          </div>
        </div>
      </footer>
    </div>
  );
}
