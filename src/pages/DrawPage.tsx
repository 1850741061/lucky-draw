import { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Play, RotateCcw, Sparkles, Users, Trophy, Settings2, Repeat, Ban, Volume2, VolumeX, Sun, Moon, Crown } from 'lucide-react';
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

class SynthAudio {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
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

function StardustBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const handleResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    const count = Math.min(45, Math.floor((w * h) / 40000));
    const particles: Array<{x:number,y:number,vx:number,vy:number,r:number,ph:number}> = [];
    for (let i = 0; i < count; i++) particles.push({ x:Math.random()*w, y:Math.random()*h, vx:(Math.random()-0.5)*0.12, vy:(Math.random()-0.5)*0.12, r:Math.random()*1+0.3, ph:Math.random()*Math.PI*2 });
    let animId: number;
    const draw = (time: number) => {
      ctx.clearRect(0,0,w,h);
      const isDark = document.documentElement.classList.contains('dark');
      const dotC = isDark ? 'rgba(212,184,150,' : 'rgba(10,10,15,';
      const lineB = isDark ? '212,184,150' : '10,10,15';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx + Math.sin(time*0.0003+p.ph)*0.03;
        p.y += p.vy + Math.cos(time*0.0002+p.ph)*0.03;
        if (p.x<0) p.x=w; if (p.x>w) p.x=0; if (p.y<0) p.y=h; if (p.y>h) p.y=0;
        const br = 0.5 + Math.sin(time*0.001+p.ph)*0.25;
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle = `${dotC}${(0.1*br).toFixed(3)})`; ctx.fill();
        for (let j=i+1; j<particles.length; j++) {
          const p2 = particles[j]; const dx=p.x-p2.x, dy=p.y-p2.y; const d=Math.sqrt(dx*dx+dy*dy);
          if (d<120) { ctx.strokeStyle=`rgba(${lineB},${((1-d/120)*0.035).toFixed(3)})`; ctx.lineWidth=0.5; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p2.x,p2.y); ctx.stroke(); }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);
    return () => { window.removeEventListener('resize',handleResize); cancelAnimationFrame(animId); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none w-full h-full z-0" style={{opacity:0.8}} />;
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

  const toggleSound = () => { synth.enabled = !soundEnabled; setSoundEnabled(!soundEnabled); };

  const addItem = () => {
    const newItem: DrawItem = { id: Date.now().toString(), text: `项目 ${items.length + 1}` };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 2) return;
    setItems(items.filter(item => item.id !== id));
    setDrawnItems(prev => { const next = new Set(prev); next.delete(id); return next; });
  };

  const updateItem = (id: string, text: string) => {
    setItems(items.map(item => item.id === id ? { ...item, text } : item));
  };

  const resetItems = () => {
    setItems(DEFAULT_ITEMS); setResults([]); setCurrentDraw([]); setDrawnItems(new Set());
  };

  const resetDrawnItems = () => { setDrawnItems(new Set()); };

  const draw = useCallback(() => {
    if (isDrawing) return;
    if (drawMode === 'unique') {
      const availableItems = items.filter(item => !drawnItems.has(item.id));
      if (availableItems.length < drawCount) return;
    } else { if (items.length < drawCount) return; }

    setIsDrawing(true); setCurrentDraw([]);
    let counter = 0;
    const animationInterval = setInterval(() => {
      if (drawMode === 'unique') {
        const availableItems = items.filter(item => !drawnItems.has(item.id));
        setAnimationIndex(Math.floor(Math.random() * availableItems.length));
      } else { setAnimationIndex(Math.floor(Math.random() * items.length)); }
      counter++;
      synth.playShuffle();
      if (counter > 20) {
        clearInterval(animationInterval);
        let selected: DrawItem[] = [];
        if (drawMode === 'unique') {
          const availableItems = items.filter(item => !drawnItems.has(item.id));
          const shuffled = [...availableItems].sort(() => Math.random() - 0.5);
          selected = shuffled.slice(0, drawCount);
          setDrawnItems(prev => { const next = new Set(prev); selected.forEach(item => next.add(item.id)); return next; });
        } else {
          selected = [];
          for (let i = 0; i < drawCount; i++) { selected.push(items[Math.floor(Math.random() * items.length)]); }
        }
        setCurrentDraw(selected);
        setResults(prev => [{ items: selected, timestamp: Date.now() }, ...prev]);
        setAnimationIndex(-1); setIsDrawing(false);
        if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
      }
    }, 90);
  }, [isDrawing, items, drawCount, drawMode, drawnItems]);

  const clearHistory = () => { setResults([]); setCurrentDraw([]); setDrawnItems(new Set()); };

  const getAvailableCount = () => {
    if (drawMode === 'unique') return items.filter(item => !drawnItems.has(item.id)).length;
    return items.length;
  };

  const availableCount = getAvailableCount();
  const canDraw = drawMode === 'unique' ? availableCount >= drawCount : items.length >= drawCount;

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <StardustBackground />

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 surface border-b" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="container-wide section-padding h-16 flex items-center justify-between">
          <button onClick={onBack} className="btn-ghost flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">返回</span>
          </button>

          <span className="font-display text-sm tracking-[0.15em] uppercase" style={{ color: 'var(--text-primary)' }}>
            随机抽签
          </span>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="btn-ghost w-9 h-9 p-0 flex items-center justify-center" title={isDarkMode ? '日间模式' : '夜间模式'}>
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={toggleSound} className={`btn-ghost w-9 h-9 p-0 flex items-center justify-center ${soundEnabled ? '' : 'opacity-50'}`} title={soundEnabled ? '关闭音效' : '开启音效'}>
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button onClick={resetItems} className="btn-ghost hidden sm:flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 pt-24 sm:pt-28 pb-10 sm:pb-14 section-padding">
        <div className="container-wide">
          <div className="grid lg:grid-cols-5 gap-5 sm:gap-7">

            {/* Left Panel - Candidates */}
            <div className="lg:col-span-2 card p-5 sm:p-7 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" style={{ color: 'var(--accent-gold)' }} />
                  <h2 className="font-display text-xs uppercase tracking-[0.15em]" style={{ color: 'var(--text-primary)' }}>
                    候选人
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  {drawMode === 'unique' && drawnItems.size > 0 && (
                    <button
                      onClick={resetDrawnItems}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all active:scale-95"
                      style={{ background: 'var(--bg-card)', color: 'var(--text-tertiary)', border: `1px solid var(--border-subtle)` }}
                    >
                      重置已抽
                    </button>
                  )}
                  <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {drawMode === 'unique' ? `${availableCount}/${items.length}` : items.length}
                  </span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2 mb-4 max-h-[260px] sm:max-h-[380px] overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => {
                    const isDrawn = drawnItems.has(item.id);
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: isDrawn ? 0.4 : 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.25 }}
                        className="flex items-center gap-2.5 p-2 rounded-xl transition-colors"
                        style={{
                          background: isDrawn ? 'var(--bg-primary)' : 'var(--bg-card)',
                          border: `1px solid ${isDrawn ? 'var(--border-subtle)' : 'var(--border-subtle)'}`,
                        }}
                      >
                        <span className="w-6 h-6 flex items-center justify-center text-[10px] font-mono font-bold rounded-lg flex-shrink-0"
                          style={{ background: isDrawn ? 'var(--bg-primary)' : 'var(--bg-elevated)', color: isDrawn ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                          {index + 1}
                        </span>
                        <input
                          type="text" value={item.text}
                          onChange={(e) => updateItem(item.id, e.target.value)}
                          disabled={isDrawn}
                          className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm font-medium min-w-0"
                          style={{ color: isDrawn ? 'var(--text-muted)' : 'var(--text-primary)' }}
                          placeholder={`项目 ${index + 1}`}
                        />
                        {isDrawn && (
                          <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)', border: `1px solid var(--border-subtle)` }}>
                            已出
                          </span>
                        )}
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={items.length <= 2}
                          className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors active:scale-95 disabled:opacity-20"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-coral)')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <button
                onClick={addItem}
                className="w-full py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                style={{ background: 'var(--bg-card)', color: 'var(--text-tertiary)', border: `1px dashed var(--border-subtle)` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
              >
                <Plus className="w-4 h-4" />
                添加项目
              </button>
            </div>

            {/* Right Panel - Control & Results */}
            <div className="lg:col-span-3 space-y-5">

              {/* Settings */}
              <div className="card p-5 sm:p-7">
                <div className="flex items-center gap-2.5 mb-5">
                  <Settings2 className="w-4 h-4" style={{ color: 'var(--accent-gold)' }} />
                  <h2 className="font-display text-xs uppercase tracking-[0.15em]" style={{ color: 'var(--text-primary)' }}>
                    抽签设置
                  </h2>
                </div>

                {/* Mode Selection */}
                <div className="mb-6">
                  <span className="text-[10px] uppercase tracking-[0.15em] font-medium block mb-3" style={{ color: 'var(--text-muted)' }}>抽取模式</span>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { mode: 'unique' as DrawMode, icon: Ban, label: '不重复', sub: '已抽项目不再出现' },
                      { mode: 'repeatable' as DrawMode, icon: Repeat, label: '可重复', sub: '每次独立随机抽取' },
                    ].map(({ mode, icon: Icon, label, sub }) => (
                      <button
                        key={mode}
                        onClick={() => setDrawMode(mode)}
                        className="flex items-center gap-3 p-3.5 rounded-xl transition-all active:scale-[0.98] text-left border-2"
                        style={{
                          background: drawMode === mode ? 'var(--bg-elevated)' : 'var(--bg-card)',
                          borderColor: drawMode === mode ? 'var(--accent-gold)' : 'var(--border-subtle)',
                        }}
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: drawMode === mode ? 'var(--accent-gold)' : 'var(--bg-primary)', color: drawMode === mode ? 'var(--bg-primary)' : 'var(--text-muted)' }}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs uppercase tracking-wider" style={{ color: drawMode === mode ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{label}</p>
                          <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Count & Draw */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 p-1 rounded-xl" style={{ background: 'var(--bg-card)', border: `1px solid var(--border-subtle)` }}>
                    <span className="text-[10px] uppercase tracking-wider font-medium px-2" style={{ color: 'var(--text-muted)' }}>抽取人数</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 5].map(num => (
                        <button
                          key={num}
                          onClick={() => setDrawCount(num)}
                          disabled={num > availableCount && drawMode === 'unique'}
                          className="w-9 h-8 rounded-lg text-xs font-mono font-bold transition-all disabled:opacity-20 active:scale-95"
                          style={{
                            background: drawCount === num ? 'var(--accent-ink)' : 'transparent',
                            color: drawCount === num ? 'var(--bg-primary)' : 'var(--text-tertiary)',
                          }}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1" />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={draw}
                    disabled={!canDraw || isDrawing}
                    className="btn-primary px-8 py-3.5 flex items-center justify-center gap-2 disabled:opacity-30"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {isDrawing ? '抽签中...' : '开始抽签'}
                  </motion.button>
                </div>

                {!canDraw && drawMode === 'unique' && (
                  <p className="mt-3 text-xs flex items-center gap-1.5" style={{ color: 'var(--accent-coral)' }}>
                    <span className="w-1 h-1 rounded-full" style={{ background: 'var(--accent-coral)' }} />
                    可用候选人不足，请重置已抽列表或增加候选人
                  </p>
                )}
              </div>

              {/* Results */}
              <div className="card p-5 sm:p-7 relative overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <Trophy className="w-4 h-4" style={{ color: 'var(--accent-gold)' }} />
                    <h2 className="font-display text-xs uppercase tracking-[0.15em]" style={{ color: 'var(--text-primary)' }}>
                      结果揭晓
                    </h2>
                  </div>
                  {results.length > 0 && (
                    <button onClick={clearHistory} className="text-[10px] uppercase tracking-widest transition-colors hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
                      清空记录
                    </button>
                  )}
                </div>

                <div className="min-h-[180px] sm:min-h-[240px] flex items-center justify-center py-4">
                  <AnimatePresence mode="wait">
                    {isDrawing && animationIndex >= 0 ? (
                      <motion.div
                        key="shuffling"
                        initial={{ scale: 0.96, opacity: 0 }}
                        animate={{ scale: [0.98, 1.02, 0.98], opacity: 1 }}
                        transition={{ repeat: Infinity, duration: 0.5 }}
                        className="text-center"
                      >
                        <div className="w-20 h-28 sm:w-24 sm:h-32 mx-auto mb-4 rounded-xl flex items-center justify-center"
                          style={{ background: 'var(--bg-card)', border: `1px solid var(--border-subtle)`, boxShadow: '0 8px 32px var(--shadow-color)' }}>
                          <span className="text-2xl font-display font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {drawMode === 'unique'
                              ? items.filter(item => !drawnItems.has(item.id))[animationIndex]?.text.slice(0, 2)
                              : items[animationIndex]?.text.slice(0, 2)
                            }
                          </span>
                        </div>
                        <p className="text-[10px] font-mono uppercase tracking-[0.2em] animate-pulse-subtle" style={{ color: 'var(--text-muted)' }}>抽取中...</p>
                      </motion.div>
                    ) : currentDraw.length > 0 ? (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full flex flex-col items-center"
                      >
                        <div className="flex flex-wrap justify-center gap-4 sm:gap-5 py-2">
                          {currentDraw.map((item, index) => (
                            <div key={`${item.id}-${index}`} className="relative w-24 h-36 sm:w-28 sm:h-40" style={{ perspective: '1000px' }}>
                              <motion.div
                                initial={{ rotateY: 0, scale: 0.9 }}
                                animate={{ rotateY: 180, scale: 1 }}
                                transition={{ delay: index * 0.25, duration: 0.55, type: 'spring', stiffness: 90 }}
                                onAnimationStart={() => synth.playFlip(index)}
                                style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%' }}
                                className="relative w-full h-full"
                              >
                                {/* Front (revealed) */}
                                <div
                                  className="absolute inset-0 w-full h-full rounded-xl flex flex-col items-center justify-between p-3 sm:p-4 text-center"
                                  style={{
                                    backfaceVisibility: 'hidden',
                                    transform: 'rotateY(180deg)',
                                    background: 'var(--bg-elevated)',
                                    border: `2px solid var(--accent-gold)`,
                                    boxShadow: '0 0 40px var(--glow-color)',
                                  }}
                                >
                                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-gold)', color: 'var(--bg-primary)' }}>
                                    <Crown className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-sm sm:text-base font-display font-semibold block truncate max-w-full" style={{ color: 'var(--text-primary)' }}>
                                    {item.text}
                                  </span>
                                  <span className="text-[8px] font-mono uppercase tracking-[0.15em] font-bold" style={{ color: 'var(--accent-gold)' }}>
                                    第 {index + 1} 名
                                  </span>
                                </div>

                                {/* Back (hidden) */}
                                <div
                                  className="absolute inset-0 w-full h-full rounded-xl flex items-center justify-center p-3"
                                  style={{ backfaceVisibility: 'hidden', background: 'var(--bg-card)', border: `1px solid var(--border-subtle)`, boxShadow: '0 8px 32px var(--shadow-color)' }}
                                >
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center animate-pulse-subtle"
                                    style={{ background: 'var(--bg-primary)', border: `1px solid var(--border-subtle)` }}>
                                    <span className="text-lg font-light font-display" style={{ color: 'var(--text-primary)' }}>?</span>
                                  </div>
                                </div>
                              </motion.div>
                            </div>
                          ))}
                        </div>
                        <motion.p
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: currentDraw.length * 0.25 + 0.3 }}
                          className="text-center text-[10px] uppercase tracking-[0.2em] mt-5 font-medium"
                          style={{ color: 'var(--accent-gold)' }}
                        >
                          恭喜 {currentDraw.length} 位中奖者
                        </motion.p>
                      </motion.div>
                    ) : (
                      <div className="text-center">
                        <Sparkles className="w-8 h-8 mx-auto mb-3 animate-pulse-subtle" style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                        <p className="text-xs uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>点击开始抽签揭晓结果</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* History */}
              <AnimatePresence>
                {results.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card p-5 sm:p-7"
                  >
                    <h3 className="font-display text-[10px] uppercase tracking-[0.15em] mb-3" style={{ color: 'var(--text-primary)' }}>
                      历史记录
                    </h3>
                    <div className="space-y-2 max-h-[160px] sm:max-h-[180px] overflow-y-auto pr-1">
                      {results.map((result, index) => (
                        <div
                          key={result.timestamp}
                          className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
                          style={{ background: 'var(--bg-card)', border: `1px solid var(--border-subtle)` }}
                        >
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded-lg flex-shrink-0"
                            style={{ background: 'var(--bg-primary)', color: 'var(--text-muted)', border: `1px solid var(--border-subtle)` }}>
                            #{results.length - index}
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {result.items.map((item, itemIndex) => (
                              <span
                                key={`${item.id}-${itemIndex}`}
                                className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium"
                                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: `1px solid var(--border-subtle)` }}
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
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
