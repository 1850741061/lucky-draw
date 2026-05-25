import { useState, useCallback } from 'react';
import { ArrowLeft, Plus, Trash2, Play, RotateCcw, Sparkles, Users, Trophy, Settings2, Repeat, Ban, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DrawItem {
  id: string;
  text: string;
}

interface DrawResult {
  items: DrawItem[];
  timestamp: number;
}

type DrawMode = 'unique' | 'repeatable';

const DEFAULT_ITEMS: DrawItem[] = [
  { id: '1', text: '张三' },
  { id: '2', text: '李四' },
  { id: '3', text: '王五' },
  { id: '4', text: '赵六' },
  { id: '5', text: '钱七' },
  { id: '6', text: '孙八' },
];

// Web Audio API Synthesizer for pure high-fidelity drawing sounds
class SynthAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playShuffle() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // Deep cardboard click / snap
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.linearRampToValueAtTime(45, now + 0.05);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playFlip(index: number) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // Ascending sci-fi laser unlock sound (higher pitch per card index)
    const baseFreq = 420 + index * 80;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 2.2, now + 0.12);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playWin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Energetic Major 9th chord to signify win (F4, A4, C5, E5, A5)
    const freqs = [349.23, 440.00, 523.25, 659.25, 880.00];

    freqs.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.06);

      gain.gain.setValueAtTime(0, now + index * 0.06);
      gain.gain.linearRampToValueAtTime(0.07, now + index * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.06 + 0.6);

      osc.start(now + index * 0.06);
      osc.stop(now + index * 0.06 + 0.6);
    });
  }
}

const synth = new SynthAudio();

interface DrawPageProps {
  onBack: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export default function DrawPage({ onBack, isDarkMode, toggleTheme }: DrawPageProps) {
  const [items, setItems] = useState<DrawItem[]>(DEFAULT_ITEMS);
  const [drawCount, setDrawCount] = useState(1);
  const [drawMode, setDrawMode] = useState<DrawMode>('unique');
  const [isDrawing, setIsDrawing] = useState(false);
  const [results, setResults] = useState<DrawResult[]>([]);
  const [currentDraw, setCurrentDraw] = useState<DrawItem[]>([]);
  const [animationIndex, setAnimationIndex] = useState<number>(-1);
  const [drawnItems, setDrawnItems] = useState<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Synced audio toggle
  const toggleSound = () => {
    synth.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const addItem = () => {
    const newItem: DrawItem = {
      id: Date.now().toString(),
      text: `项目 ${items.length + 1}`,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 2) return;
    setItems(items.filter(item => item.id !== id));
    setDrawnItems(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const updateItem = (id: string, text: string) => {
    setItems(items.map(item => item.id === id ? { ...item, text } : item));
  };

  const resetItems = () => {
    setItems(DEFAULT_ITEMS);
    setResults([]);
    setCurrentDraw([]);
    setDrawnItems(new Set());
  };

  const resetDrawnItems = () => {
    setDrawnItems(new Set());
  };

  const draw = useCallback(() => {
    if (isDrawing) return;
    
    if (drawMode === 'unique') {
      const availableItems = items.filter(item => !drawnItems.has(item.id));
      if (availableItems.length < drawCount) return;
    } else {
      if (items.length < drawCount) return;
    }

    setIsDrawing(true);
    setCurrentDraw([]);

    let counter = 0;
    const animationInterval = setInterval(() => {
      if (drawMode === 'unique') {
        const availableItems = items.filter(item => !drawnItems.has(item.id));
        setAnimationIndex(Math.floor(Math.random() * availableItems.length));
      } else {
        setAnimationIndex(Math.floor(Math.random() * items.length));
      }
      counter++;
      
      // Play cardboard shuffle sound
      synth.playShuffle();

      if (counter > 20) {
        clearInterval(animationInterval);
        
        let selected: DrawItem[] = [];
        
        if (drawMode === 'unique') {
          const availableItems = items.filter(item => !drawnItems.has(item.id));
          const shuffled = [...availableItems].sort(() => Math.random() - 0.5);
          selected = shuffled.slice(0, drawCount);
          
          setDrawnItems(prev => {
            const next = new Set(prev);
            selected.forEach(item => next.add(item.id));
            return next;
          });
        } else {
          selected = [];
          for (let i = 0; i < drawCount; i++) {
            const randomIndex = Math.floor(Math.random() * items.length);
            selected.push(items[randomIndex]);
          }
        }
        
        setCurrentDraw(selected);
        setResults(prev => [{
          items: selected,
          timestamp: Date.now(),
        }, ...prev]);
        setAnimationIndex(-1);
        setIsDrawing(false);

        // Haptic feedback
        if (navigator.vibrate) {
          navigator.vibrate([50, 100, 50]);
        }
      }
    }, 90);
  }, [isDrawing, items, drawCount, drawMode, drawnItems]);

  const clearHistory = () => {
    setResults([]);
    setCurrentDraw([]);
    setDrawnItems(new Set());
  };

  const getAvailableCount = () => {
    if (drawMode === 'unique') {
      return items.filter(item => !drawnItems.has(item.id)).length;
    }
    return items.length;
  };

  const availableCount = getAvailableCount();
  const canDraw = drawMode === 'unique' ? availableCount >= drawCount : items.length >= drawCount;

  return (
    <div className="min-h-screen bg-[#000000] text-dropbox-gray-900 overflow-hidden relative selection:bg-white/20 transition-colors duration-500">
      {/* Background drifting light spot */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-mesh-blob bg-dropbox-blue animate-float-slow opacity-[0.03] pointer-events-none" />

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/70 backdrop-blur-xl border-b border-dropbox-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 sm:gap-2 text-dropbox-gray-400 hover:text-dropbox-gray-900 transition-colors active:scale-95 px-3 py-1.5 rounded bg-white/5 border border-dropbox-gray-100 hover:border-dropbox-gray-200"
          >
            <ArrowLeft className="w-5 h-5 text-dropbox-gray-900" />
            <span className="font-medium text-xs uppercase tracking-widest">返回</span>
          </button>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-display font-light text-dropbox-gray-900 text-base sm:text-lg tracking-[0.25em] uppercase">
              随机抽签 // DRAW
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded border border-dropbox-gray-100 bg-white/5 text-dropbox-gray-400 hover:text-dropbox-gray-900 transition-all duration-300 active:scale-95 flex items-center justify-center"
              title={isDarkMode ? "切换为白画廊模式" : "切换为曜石黑模式"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-black" />}
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className={`p-1.5 sm:p-2 rounded transition-all duration-300 border active:scale-95 ${
                soundEnabled 
                  ? 'bg-white/10 text-dropbox-gray-900 border-dropbox-gray-200 shadow-soft' 
                  : 'bg-white/5 text-dropbox-gray-300 border-dropbox-gray-100'
              }`}
              title={soundEnabled ? '关闭声音' : '开启声音'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            
            <button
              onClick={resetItems}
              className="flex items-center gap-1 sm:gap-2 text-dropbox-gray-400 hover:text-dropbox-gray-900 transition-colors active:scale-95 px-3 py-1.5 rounded bg-white/5 border border-dropbox-gray-100 hover:border-dropbox-gray-200"
            >
              <RotateCcw className="w-4 h-4 text-dropbox-gray-900" />
              <span className="text-xs uppercase tracking-widest hidden sm:inline">重置</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 sm:pt-24 pb-6 sm:pb-12 px-3 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-4 sm:gap-8">
            
            {/* Left Panel - Candidates */}
            <div className="lg:col-span-2 lusion-card rounded-xl p-4 sm:p-6 border-dropbox-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-dropbox-gray-900" />
                    <h2 className="font-display font-light text-sm uppercase tracking-widest text-dropbox-gray-900">
                      候选人列表
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {drawMode === 'unique' && drawnItems.size > 0 && (
                      <button
                        onClick={resetDrawnItems}
                        className="text-xs px-2.5 py-1 bg-white/5 text-dropbox-gray-900 border border-dropbox-gray-100 hover:border-dropbox-gray-200 rounded transition-all active:scale-95 uppercase tracking-wider"
                      >
                        重置已抽
                      </button>
                    )}
                    <span className="text-xs text-dropbox-gray-400 font-mono">
                      {drawMode === 'unique' ? `${availableCount}/${items.length}` : items.length} ITEMS
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2 mb-4 max-h-[240px] sm:max-h-[360px] overflow-y-auto pr-1">
                  <AnimatePresence mode="popLayout">
                    {items.map((item, index) => {
                      const isDrawn = drawnItems.has(item.id);
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: isDrawn ? 0.35 : 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`flex items-center gap-2 sm:gap-3 p-2 rounded border transition-all animate-fade-in-up ${
                            isDrawn 
                              ? 'bg-white/5 border-dropbox-gray-100/50' 
                              : 'bg-white/5 border-dropbox-gray-100 hover:border-dropbox-gray-200 hover:bg-[#121630]/5 dark:hover:bg-[#121630]/15'
                          }`}
                        >
                          <span className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-mono font-bold rounded ${
                            isDrawn 
                              ? 'bg-white/5 text-dropbox-gray-300' 
                              : 'bg-white/10 text-dropbox-gray-900'
                          }`}>
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => updateItem(item.id, e.target.value)}
                            disabled={isDrawn}
                            className="flex-1 bg-transparent border-none outline-none text-dropbox-gray-900 font-medium placeholder:text-dropbox-gray-300 text-xs sm:text-sm min-w-0 disabled:text-dropbox-gray-300"
                            placeholder={`项目 ${index + 1}`}
                          />
                          {isDrawn && (
                            <span className="text-[10px] text-dropbox-gray-400 bg-white/5 px-2 py-0.5 rounded border border-dropbox-gray-100 uppercase tracking-widest font-mono">已出</span>
                          )}
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={items.length <= 2}
                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded text-dropbox-gray-400 hover:text-dropbox-accent-coral hover:bg-[#ff4b4b]/10 disabled:opacity-20 disabled:hover:bg-transparent transition-colors active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Add Button */}
              <button
                onClick={addItem}
                className="w-full py-2.5 border border-dashed border-dropbox-gray-100 rounded text-dropbox-gray-400 text-xs sm:text-sm font-semibold hover:border-dropbox-gray-200 hover:text-dropbox-gray-900 transition-all flex items-center justify-center gap-2 active:scale-[0.98] bg-white/5 uppercase tracking-widest"
              >
                <Plus className="w-4 h-4 text-dropbox-gray-900" />
                添加项目 // ADD ITEM
              </button>
            </div>

            {/* Right Panel - Control & Display */}
            <div className="lg:col-span-3 space-y-4 sm:space-y-6">
              
              {/* Settings Card */}
              <div className="lusion-card rounded-xl p-4 sm:p-6 border-dropbox-gray-100">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <Settings2 className="w-4 h-4 sm:w-5 sm:h-5 text-dropbox-gray-900" />
                  <h2 className="font-display font-light text-sm uppercase tracking-widest text-dropbox-gray-900">
                    抽签配置 // OPTIONS
                  </h2>
                </div>

                {/* Draw Mode Switcher */}
                <div className="mb-6">
                  <span className="text-xs text-dropbox-gray-400 block mb-3 font-semibold uppercase tracking-wider">抽取模式 // MODE</span>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      onClick={() => setDrawMode('unique')}
                      className={`flex items-center gap-2 sm:gap-3 p-3.5 sm:p-4 rounded border-2 transition-all active:scale-[0.98] ${
                        drawMode === 'unique'
                          ? 'border-dropbox-gray-900 bg-white/10 dark:bg-white/10'
                          : 'border-dropbox-gray-100 bg-white/5 hover:border-dropbox-gray-200 hover:bg-[#121630]/5 dark:hover:bg-[#121630]/15'
                      }`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded flex items-center justify-center ${
                        drawMode === 'unique' ? 'bg-dropbox-gray-900 text-dropbox-black' : 'bg-white/5 text-dropbox-gray-400'
                      }`}>
                        <Ban className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className={`font-semibold text-xs sm:text-sm uppercase tracking-wider ${drawMode === 'unique' ? 'text-dropbox-gray-900' : 'text-dropbox-gray-400'}`}>
                          不重复
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-dropbox-gray-300 tracking-wide mt-0.5 uppercase">No duplicates</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setDrawMode('repeatable')}
                      className={`flex items-center gap-2 sm:gap-3 p-3.5 sm:p-4 rounded border-2 transition-all active:scale-[0.98] ${
                        drawMode === 'repeatable'
                          ? 'border-dropbox-gray-900 bg-white/10 dark:bg-white/10'
                          : 'border-dropbox-gray-100 bg-white/5 hover:border-dropbox-gray-200 hover:bg-[#121630]/5 dark:hover:bg-[#121630]/15'
                      }`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded flex items-center justify-center ${
                        drawMode === 'repeatable' ? 'bg-dropbox-gray-900 text-dropbox-black' : 'bg-white/5 text-dropbox-gray-400'
                      }`}>
                        <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className={`font-semibold text-xs sm:text-sm uppercase tracking-wider ${drawMode === 'repeatable' ? 'text-dropbox-gray-900' : 'text-dropbox-gray-400'}`}>
                          可重复
                        </p>
                        <p className="text-[9px] sm:text-[10px] text-dropbox-gray-300 tracking-wide mt-0.5 uppercase">With duplicates</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Draw Count & Go Button */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 bg-white/5 p-1 rounded border border-dropbox-gray-100">
                    <span className="text-xs uppercase tracking-wider text-dropbox-gray-400 px-2 font-semibold">抽取人数 // COUNT：</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => setDrawCount(num)}
                          disabled={num > availableCount && drawMode === 'unique'}
                          className={`px-3 py-1 rounded text-xs font-mono font-bold transition-all disabled:opacity-20 active:scale-95 ${
                            drawCount === num
                              ? 'bg-dropbox-gray-900 text-dropbox-black shadow-soft'
                              : 'text-dropbox-gray-400 hover:text-dropbox-gray-900'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1" />

                  <button
                    onClick={draw}
                    disabled={!canDraw || isDrawing}
                    className="w-full sm:w-auto px-8 py-3 bg-dropbox-blue text-dropbox-black font-display font-semibold rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-dropbox-blue text-xs uppercase tracking-widest"
                  >
                    <Play className="w-3.5 h-3.5 text-dropbox-black fill-dropbox-black" />
                    {isDrawing ? '抽签中...' : '开始抽签 // DRAW'}
                  </button>
                </div>

                {!canDraw && drawMode === 'unique' && (
                  <p className="mt-3 text-xs text-[#ff4b4b] flex items-center gap-1 font-light tracking-wide">
                    ⚠️ 提示：当前候补人数少于所需抽取人数，请重置已抽。
                  </p>
                )}
              </div>

              {/* Display Result Area */}
              <div className="lusion-card rounded-xl p-4 sm:p-6 border-dropbox-gray-100 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-dropbox-gray-900" />
                    <h2 className="font-display font-light text-sm uppercase tracking-widest text-dropbox-gray-900">
                      结果揭晓 // RESULTS
                    </h2>
                  </div>
                  {results.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-xs text-dropbox-gray-400 hover:text-dropbox-gray-900 transition-colors uppercase tracking-widest text-[10px]"
                    >
                      清空回溯
                    </button>
                  )}
                </div>

                {/* Holographic 3D Flip Card Container */}
                <div className="min-h-[160px] sm:min-h-[220px] flex items-center justify-center py-4">
                  <AnimatePresence mode="wait">
                    {isDrawing && animationIndex >= 0 ? (
                      <motion.div
                        key="shuffling"
                        initial={{ scale: 0.98, opacity: 0 }}
                        animate={{ scale: [0.99, 1.01, 0.99], opacity: 1 }}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                        className="text-center"
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3.5 bg-white/5 border border-dropbox-gray-100 rounded flex items-center justify-center shadow-lg">
                          <span className="text-xl sm:text-2xl font-display font-light text-dropbox-gray-900 uppercase tracking-wider">
                            {drawMode === 'unique' 
                              ? items.filter(item => !drawnItems.has(item.id))[animationIndex]?.text.slice(0, 2)
                              : items[animationIndex]?.text.slice(0, 2)
                            }
                          </span>
                        </div>
                        <p className="text-[10px] text-dropbox-gray-400 animate-pulse-soft font-mono uppercase tracking-widest">SHUFFLING...</p>
                      </motion.div>
                    ) : currentDraw.length > 0 ? (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full flex flex-col items-center"
                        onViewportEnter={() => {
                          synth.playWin();
                        }}
                      >
                        {/* 3D dealt cards grid */}
                        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 py-2">
                          {currentDraw.map((item, index) => (
                            <div 
                              key={`${item.id}-${index}`}
                              className="relative w-24 h-36 sm:w-32 sm:h-48"
                              style={{ perspective: '1000px' }}
                            >
                              <motion.div
                                initial={{ rotateY: 0, scale: 0.9 }}
                                animate={{ rotateY: 180, scale: 1 }}
                                transition={{ 
                                  delay: index * 0.2, 
                                  duration: 0.5, 
                                  type: 'spring',
                                  stiffness: 85
                                }}
                                onAnimationStart={(definition) => {
                                  if (definition && (definition as any).rotateY === 180) {
                                    synth.playFlip(index);
                                  }
                                }}
                                style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%' }}
                                className="relative w-full h-full"
                              >
                                {/* CARD FRONT (Revealed Winner - Theme Responsive) */}
                                <div 
                                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                  className="absolute inset-0 w-full h-full rounded bg-gradient-to-br from-[#ffffff] to-[#f5f5f7] dark:from-[#0c0d12] dark:to-[#040405] border-2 border-dropbox-gray-900 dark:border-white shadow-soft flex flex-col items-center justify-between p-3 sm:p-4 text-center"
                                >
                                  <div className="w-6 h-6 rounded-full border border-dropbox-gray-100 dark:border-white/10 flex items-center justify-center shadow-lg">
                                    <Trophy className="w-3.5 h-3.5 text-dropbox-gray-900 dark:text-white" />
                                  </div>
                                  <span className="text-xs sm:text-base font-bold text-dropbox-gray-900 dark:text-white block truncate max-w-full uppercase tracking-wider">
                                    {item.text}
                                  </span>
                                  <span className="text-[8px] sm:text-[9px] text-dropbox-gray-400 dark:text-neutral-400 font-mono uppercase tracking-widest font-bold">
                                    WINNER #{index + 1}
                                  </span>
                                </div>

                                {/* CARD BACK (Shrouded Hologram - Theme Responsive) */}
                                <div 
                                  style={{ backfaceVisibility: 'hidden' }}
                                  className="absolute inset-0 w-full h-full rounded bg-[#fafafa] dark:bg-[#060608] border border-dropbox-gray-100 dark:border-white/10 shadow-lg flex flex-col items-center justify-center p-3 text-center"
                                >
                                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-dropbox-gray-100 dark:border-white/10 bg-white/5 flex items-center justify-center animate-pulse-soft">
                                    <span className="text-sm sm:text-lg font-light text-dropbox-gray-900 dark:text-white font-mono">
                                      ?
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          ))}
                        </div>
                        <p className="text-center text-[10px] tracking-widest uppercase text-dropbox-gray-400 mt-4 sm:mt-6">
                          🎉 CONGRATULATIONS TO THE {currentDraw.length} WINNERS!
                          {drawMode === 'repeatable' && (
                            <span className="block text-[8px] mt-1 text-dropbox-gray-300 font-mono">（REPEATABLE MODE ACTIVE）</span>
                          )}
                        </p>
                      </motion.div>
                    ) : (
                      <div className="text-center text-dropbox-gray-300">
                        <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-30 text-dropbox-gray-900 dark:text-white animate-pulse-soft" />
                        <p className="text-xs uppercase tracking-widest">点击上方“开始抽签”揭晓</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* History Record */}
              {results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lusion-card rounded-xl p-4 sm:p-6 border-dropbox-gray-100"
                >
                  <h3 className="font-display font-light text-xs text-dropbox-gray-900 uppercase tracking-wider mb-3">
                    抽签历史回溯 // LOGS
                  </h3>
                  <div className="space-y-2 max-h-[160px] sm:max-h-[180px] overflow-y-auto pr-1">
                    {results.map((result, index) => (
                      <div
                        key={result.timestamp}
                        className="flex items-center gap-3 p-2 bg-white/5 border border-dropbox-gray-100 rounded hover:border-dropbox-gray-200 transition-all duration-300 animate-fade-in-up"
                      >
                        <span className="text-[9px] text-dropbox-gray-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-dropbox-gray-100 uppercase tracking-wider">
                          轮次 {results.length - index}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {result.items.map((item, itemIndex) => (
                            <span
                              key={`${item.id}-${itemIndex}`}
                              className="px-2.5 py-0.5 bg-white/5 border border-dropbox-gray-100 rounded text-xs text-dropbox-gray-900 font-medium animate-fade-in-up"
                            >
                              {item.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
