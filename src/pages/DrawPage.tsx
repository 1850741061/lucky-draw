import { useState, useCallback } from 'react';
import { ArrowLeft, Plus, Trash2, Play, RotateCcw, Sparkles, Users, Trophy, Settings2, Dices, Repeat, Ban, Volume2, VolumeX } from 'lucide-react';
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
}

export default function DrawPage({ onBack }: DrawPageProps) {
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
    <div className="min-h-screen bg-[#030308] text-white overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-400">
      {/* Background drifting light spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-mesh-blob bg-[#bd00ff] animate-float-slow opacity-[0.06] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-mesh-blob bg-[#ff007a] animate-float-slower opacity-[0.06] pointer-events-none" />

      {/* Header - 移动端优化 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070814]/75 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 sm:gap-2 text-dropbox-gray-400 hover:text-white transition-colors active:scale-95 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5"
          >
            <ArrowLeft className="w-5 h-5 text-dropbox-accent-purple" />
            <span className="font-medium text-sm sm:text-base">返回</span>
          </button>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-tr from-[#bd00ff] to-[#ff007a] rounded-lg flex items-center justify-center shadow-glow-purple">
              <Dices className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="font-display font-semibold bg-gradient-to-r from-white via-[#fcd4ff] to-white/70 bg-clip-text text-transparent text-base sm:text-lg tracking-wider">
              随机抽签
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 border active:scale-95 ${
                soundEnabled 
                  ? 'bg-dropbox-accent-purple/15 text-dropbox-accent-purple border-dropbox-accent-purple/20 shadow-glow-purple' 
                  : 'bg-white/5 text-dropbox-gray-400 border-white/5'
              }`}
              title={soundEnabled ? '关闭声音' : '开启声音'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            
            <button
              onClick={resetItems}
              className="flex items-center gap-1 sm:gap-2 text-dropbox-gray-400 hover:text-white transition-colors active:scale-95 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5"
            >
              <RotateCcw className="w-4 h-4 text-dropbox-accent-coral" />
              <span className="text-xs sm:text-sm hidden sm:inline">重置</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 sm:pt-24 pb-6 sm:pb-12 px-3 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-4 sm:gap-8">
            
            {/* Left Panel - Candidates */}
            <div className="lg:col-span-2 glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-dropbox-accent-purple" />
                    <h2 className="font-display font-semibold text-base sm:text-lg text-white">
                      候选人列表
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {drawMode === 'unique' && drawnItems.size > 0 && (
                      <button
                        onClick={resetDrawnItems}
                        className="text-xs px-2.5 py-1 bg-white/5 text-dropbox-accent-purple border border-white/5 hover:border-dropbox-accent-purple/20 rounded-lg transition-all active:scale-95"
                      >
                        重置已抽
                      </button>
                    )}
                    <span className="text-xs sm:text-sm text-dropbox-gray-400 font-mono">
                      {drawMode === 'unique' ? `${availableCount}/${items.length}` : items.length} 项
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
                          className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl border transition-all ${
                            isDrawn 
                              ? 'bg-white/5 border-white/5' 
                              : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-[#121630]/35'
                          }`}
                        >
                          <span className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-mono font-bold rounded-lg ${
                            isDrawn 
                              ? 'bg-white/5 text-dropbox-gray-400' 
                              : 'bg-white/10 text-[#bd00ff]'
                          }`}>
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => updateItem(item.id, e.target.value)}
                            disabled={isDrawn}
                            className="flex-1 bg-transparent border-none outline-none text-white font-medium placeholder:text-dropbox-gray-400 text-sm min-w-0 disabled:text-dropbox-gray-400"
                            placeholder={`项目 ${index + 1}`}
                          />
                          {isDrawn && (
                            <span className="text-xs text-[#bd00ff] bg-[#bd00ff]/10 px-2 py-0.5 rounded-md border border-[#bd00ff]/20 font-medium">已抽中</span>
                          )}
                          <button
                            onClick={() => removeItem(item.id)}
                            disabled={items.length <= 2}
                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg text-dropbox-gray-400 hover:text-dropbox-accent-coral hover:bg-dropbox-accent-coral/10 disabled:opacity-20 disabled:hover:bg-transparent transition-colors active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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
                className="w-full py-2.5 border border-dashed border-white/10 rounded-xl text-dropbox-gray-400 text-xs sm:text-sm font-medium hover:border-dropbox-accent-purple hover:text-dropbox-accent-purple transition-all flex items-center justify-center gap-2 active:scale-[0.98] bg-white/5"
              >
                <Plus className="w-4 h-4 text-[#bd00ff]" />
                添加候选项目
              </button>
            </div>

            {/* Right Panel - Control & Display */}
            <div className="lg:col-span-3 space-y-4 sm:space-y-6">
              
              {/* Settings Card */}
              <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-white/10">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <Settings2 className="w-4 h-4 sm:w-5 sm:h-5 text-dropbox-accent-purple" />
                  <h2 className="font-display font-semibold text-base sm:text-lg text-white">
                    抽签配置
                  </h2>
                </div>

                {/* Draw Mode Switcher */}
                <div className="mb-6">
                  <span className="text-xs sm:text-sm text-dropbox-gray-400 block mb-3 font-medium">抽取模式：</span>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      onClick={() => setDrawMode('unique')}
                      className={`flex items-center gap-2 sm:gap-3 p-3.5 sm:p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
                        drawMode === 'unique'
                          ? 'border-dropbox-accent-purple bg-[#bd00ff]/10 shadow-glow-purple'
                          : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-[#121630]/35'
                      }`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center ${
                        drawMode === 'unique' ? 'bg-[#bd00ff] text-white' : 'bg-white/5 text-dropbox-gray-400'
                      }`}>
                        <Ban className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className={`font-semibold text-sm ${drawMode === 'unique' ? 'text-white' : 'text-dropbox-gray-400'}`}>
                          不重复模式
                        </p>
                        <p className="text-[10px] text-dropbox-gray-400 truncate mt-0.5">每人最多抽中一次</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setDrawMode('repeatable')}
                      className={`flex items-center gap-2 sm:gap-3 p-3.5 sm:p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
                        drawMode === 'repeatable'
                          ? 'border-dropbox-accent-purple bg-[#bd00ff]/10 shadow-glow-purple'
                          : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-[#121630]/35'
                      }`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center ${
                        drawMode === 'repeatable' ? 'bg-[#bd00ff] text-white' : 'bg-white/5 text-dropbox-gray-400'
                      }`}>
                        <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className={`font-semibold text-sm ${drawMode === 'repeatable' ? 'text-white' : 'text-dropbox-gray-400'}`}>
                          可重复模式
                        </p>
                        <p className="text-[10px] text-dropbox-gray-400 truncate mt-0.5">候选人可能会重复中奖</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Draw Count & Go Button */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-4">
                  <div className="flex items-center gap-2 sm:gap-3 bg-white/5 p-1 rounded-xl border border-white/5">
                    <span className="text-xs sm:text-sm text-dropbox-gray-400 whitespace-nowrap px-2 font-medium">抽取人数：</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => setDrawCount(num)}
                          disabled={num > availableCount && drawMode === 'unique'}
                          className={`px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-mono font-bold transition-all disabled:opacity-20 active:scale-95 ${
                            drawCount === num
                              ? 'bg-[#bd00ff] text-white shadow-soft'
                              : 'text-dropbox-gray-400 hover:text-white'
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
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-dropbox-accent-purple to-purple-800 text-white font-display font-semibold rounded-xl hover:shadow-glow-purple disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2 border border-white/10"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    {isDrawing ? '抽签中...' : '开始抽签'}
                  </button>
                </div>

                {!canDraw && drawMode === 'unique' && (
                  <p className="mt-3 text-xs sm:text-sm text-dropbox-accent-coral flex items-center gap-1">
                    ⚠️ 提示：剩余候选人不足以抽取 {drawCount} 人，请点击“重置已抽”或“重置”！
                  </p>
                )}
              </div>

              {/* Display Result Area */}
              <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-white/10 relative overflow-hidden">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-dropbox-blue" />
                    <h2 className="font-display font-semibold text-base sm:text-lg text-white">
                      抽签揭晓
                    </h2>
                  </div>
                  {results.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-xs sm:text-sm text-dropbox-gray-400 hover:text-dropbox-accent-coral transition-colors"
                    >
                      清空结果
                    </button>
                  )}
                </div>

                {/* Holographic 3D Flip Card Container */}
                <div className="min-h-[160px] sm:min-h-[220px] flex items-center justify-center py-4">
                  <AnimatePresence mode="wait">
                    {isDrawing && animationIndex >= 0 ? (
                      <motion.div
                        key="shuffling"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: [0.95, 1.05, 0.95], opacity: 1 }}
                        transition={{ repeat: Infinity, duration: 0.6 }}
                        className="text-center"
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3.5 bg-dropbox-accent-purple/15 border border-[#bd00ff]/30 shadow-glow-purple rounded-2xl flex items-center justify-center">
                          <span className="text-2xl sm:text-3xl font-display font-bold text-dropbox-accent-purple">
                            {drawMode === 'unique' 
                              ? items.filter(item => !drawnItems.has(item.id))[animationIndex]?.text.slice(0, 2)
                              : items[animationIndex]?.text.slice(0, 2)
                            }
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-dropbox-gray-400 animate-pulse-soft font-medium">正在急速切牌...</p>
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
                                initial={{ rotateY: 0, scale: 0.8 }}
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
                                {/* CARD FRONT (Revealed Winner) */}
                                <div 
                                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                  className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-[#11132e] to-[#0a0b16] border-2 border-dropbox-accent-purple shadow-glow-purple flex flex-col items-center justify-between p-3.5 text-center"
                                >
                                  <div className="w-7 h-7 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center shadow-lg animate-bounce-soft">
                                    <Trophy className="w-4 h-4 text-yellow-400" />
                                  </div>
                                  <span className="text-sm sm:text-lg font-bold bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent block truncate max-w-full">
                                    {item.text}
                                  </span>
                                  <span className="text-[9px] sm:text-[10px] text-dropbox-accent-purple font-mono uppercase tracking-widest font-bold">
                                    #{index + 1} 赢家
                                  </span>
                                </div>

                                {/* CARD BACK (Shrouded Hologram) */}
                                <div 
                                  style={{ backfaceVisibility: 'hidden' }}
                                  className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-[#0c0d1c] to-[#070814] border border-white/10 shadow-lg flex flex-col items-center justify-center p-3 text-center"
                                >
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-dropbox-accent-purple/30 bg-dropbox-accent-purple/5 flex items-center justify-center animate-pulse-soft">
                                    <span className="text-lg sm:text-2xl font-bold bg-gradient-to-tr from-dropbox-blue to-[#ff007a] bg-clip-text text-transparent font-mono">
                                      ?
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          ))}
                        </div>
                        <p className="text-center text-xs sm:text-sm text-dropbox-gray-400 mt-4 sm:mt-6">
                          🎉 恭喜以上 {currentDraw.length} 位幸运赢家！
                          {drawMode === 'repeatable' && (
                            <span className="block text-[10px] mt-1 text-[#bd00ff] font-mono">（当前为可重复模式）</span>
                          )}
                        </p>
                      </motion.div>
                    ) : (
                      <div className="text-center text-dropbox-gray-500">
                        <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30 text-[#bd00ff] animate-pulse-soft" />
                        <p className="text-sm">点击上方“开始抽签”揭晓答案</p>
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
                  className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-white/10"
                >
                  <h3 className="font-display font-semibold text-xs text-[#bd00ff] uppercase tracking-wider mb-3">
                    抽签历史回溯
                  </h3>
                  <div className="space-y-2 max-h-[160px] sm:max-h-[180px] overflow-y-auto pr-1">
                    {results.map((result, index) => (
                      <div
                        key={result.timestamp}
                        className="flex items-center gap-3 p-2 bg-white/5 border border-white/5 rounded-xl hover:border-white/10"
                      >
                        <span className="text-[10px] text-dropbox-gray-400 font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          第 {results.length - index} 轮
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {result.items.map((item, itemIndex) => (
                            <span
                              key={`${item.id}-${itemIndex}`}
                              className="px-2.5 py-0.5 bg-white/5 border border-white/5 rounded-lg text-xs text-white font-medium"
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
