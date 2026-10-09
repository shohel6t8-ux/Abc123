export type TornPaperArchetype = 
  | 'exclusive-vector-frame'
  | 'exclusive-deckle-frame'
  | 'exclusive-white-core-strip'
  | 'exclusive-punctured-hole'
  | 'exclusive-cardboard-tear'
  | 'exclusive-curled-banner'
  | 'exclusive-horizontal-window'
  | 'strip-horizontal'
  | 'strip-vertical'
  | 'full-sheet'
  | 'notebook-spiral'
  | 'notebook-lined'
  | 'grid-math-paper'
  | 'frame-window'
  | 'center-hole'
  | 'fragment-scrap'
  | 'folded-creased'
  | 'curled-peel'
  | 'burned-grunge'
  | 'tape-fastened'
  | 'perforated-stamp'
  | 'multilayer-stack';

export interface TornPaperStyle {
  id: string;
  number: number;
  nameBn: string;
  nameEn: string;
  category: 'exclusive' | 'basic' | 'edge-fiber' | 'layered-collage' | 'materials' | 'advanced';
  categoryBn: string;
  descriptionBn: string;
  usageBn: string;
  defaultParams: Partial<TornPaperParams>;
  tags: string[];
  isExclusive?: boolean;
}

export interface TornPaperParams {
  seed: number;
  width: number;
  height: number;
  
  // Dimensions & Aspect Ratio for 4K / 8K export
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3' | '3:2' | '3:1' | 'custom';
  customWidth: number;
  customHeight: number;
  
  // Archetype & Structural Form
  archetype: TornPaperArchetype;
  paperPattern: 'plain' | 'lined' | 'grid' | 'spiral-holes' | 'vintage-stained' | 'speckled' | 'burnt-edge';
  attachment: 'none' | 'masking-tape' | 'scotch-tape' | 'washi-tape' | 'golden-staple';
  attachmentColor: string;
  
  // Edge & Tear geometry
  tearRoughness: number;    // 10 - 100
  tearFrequency: number;    // 5 - 50
  tearDepth: number;        // 10 - 90
  edgeStyle: 'rough' | 'deckle' | 'jagged' | 'fine' | 'deep-notch';
  
  // Fiber properties
  fiberDensity: number;     // 0 - 100
  fiberLength: number;      // 2 - 35
  fiberColor: string;
  
  // Paper thickness & pulp bevel
  paperThickness: number;   // 1 - 22 (exposed white inner core)
  innerPulpColor: string;   // color of inner torn fibers (usually #ffffff or off-white)
  
  // Material, Color & Texture
  paperColor: string;
  surfaceTexture: 'smooth' | 'kraft' | 'recycled' | 'crumpled' | 'vintage' | 'cardstock' | 'cotton';
  textureGrain: number;     // 0 - 60
  crumpleIntensity: number; // 0 - 100 (wrinkle shadows & crease highlights)
  burnIntensity: number;    // 0 - 100 (singed edges)
  
  // Drop Shadow
  shadowBlur: number;       // 0 - 60
  shadowOpacity: number;    // 0.1 - 0.9
  shadowDistance: number;   // 0 - 50
  shadowAngle: number;      // 0 - 360
  
  // Layout & Multi-layer
  layersCount: number;      // 1, 2, 3
  curlAngle: number;        // corner peel / curl
  scale: number;            // 50 - 130
}
