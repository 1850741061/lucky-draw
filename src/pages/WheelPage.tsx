import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, RotateCcw, Settings2, BarChart3, BookOpen, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WheelOption {
  id: string;
  text: string;
  color: string;
  weight: number;
}

// Refined gallery palette — muted, sophisticated, harmonious
const PRESET_COLORS = [
  '#2c3e50', // Midnight Blue
  '#d4a574', // Warm Sand
  '#5d7a68', // Sage
  '#e8e0d5', // Alabaster
  '#b8735a', // Terracotta
  '#4a6fa5', // Steel Blue
  '#3d3d3d', // Charcoal
  '#c9b99a', // Pale Gold
];

const DEFAULT_OPTIONS: WheelOption[] = [
  { id: '1', text: '选项 A', color: PRESET_COLORS[0], weight: 1 },
  { id: '2', text: '选项 B', color: PRESET_COLORS[1], weight: 1 },
  { id: '3', text: '选项 C', color: PRESET_COLORS[2], weight: 1 },
  { id: '4', text: '选项 D', color: PRESET_COLORS[3], weight: 1 },
];

interface WheelPreset {
  id: string;
  name: string;
  emoji: string;
  options: Omit<WheelOption, 'id'>[];
}

const PRESETS: WheelPreset[] = [
  {
    id: 'game',
    name: '游戏转盘',
    emoji: '🎮',
    options: [
      { text: '无畏契约', color: '#FF4655', weight: 1 },
      { text: '英雄联盟', color: '#C8AA6E', weight: 1 },
    ],
  },
];

function adjustColorBrightness(hex: string, percent: number): string {
  if (!hex.startsWith('#')) return hex;
  let R = parseInt(hex.substring(1, 3), 16);
  let G = parseInt(hex.substring(3, 5), 16);
  let B = parseInt(hex.substring(5, 7), 16);
  R = Math.max(0, Math.min(255, R + (R * percent) / 100));
  G = Math.max(0, Math.min(255, G + (G * percent) / 100));
  B = Math.max(0, Math.min(255, B + (B * percent) / 100));
  const rHex = Math.round(R).toString(16).padStart(2, '0');
  const gHex = Math.round(G).toString(16).padStart(2, '0');
  const bHex = Math.round(B).toString(16).padStart(2, '0');
  return `#${rHex}${gHex}${bHex}`;
}

function getContrastColor(hex: string): string {
  if (!hex.startsWith('#')) return '#ffffff';
  const R = parseInt(hex.substring(1, 3), 16);
  const G = parseInt(hex.substring(3, 5), 16);
  const B = parseInt(hex.substring(5, 7), 16);
  const yiq = (R * 299 + G * 587 + B * 114) / 1000;
  return yiq >= 128 ? '#0a0a0f' : '#f5f0e8';
}

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

  public playTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playWin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 987.77, 1174.66];
    freqs.forEach((freq, index) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + index * 0.07);
      gain.gain.setValueAtTime(0, now + index * 0.07);
      gain.gain.linearRampToValueAtTime(0.08, now + index * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.07 + 0.7);
      osc.start(now + index * 0.07);
      osc.stop(now + index * 0.07 + 0.7);
    });
  }
}

const synth = new SynthAudio();

interface WheelPageProps {
  onBack: () => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

function weightedRandomIndex(options: WheelOption[]): number {
  const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < options.length; i++) {
    random -= options[i].weight;
    if (random <= 0) return i;
  }
  return options.length - 1;
}

/* ═══════════════════════════════════════════════
   STARDUST BACKGROUND (shared visual language)
   ═══════════════════════════════════════════════ */
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

export default function WheelPage({ onBack, isDarkMode, toggleTheme }: WheelPageProps) {
  const [options, setOptions] = useState<WheelOption[]>(DEFAULT_OPTIONS);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<WheelOption | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showWeightPanel, setShowWeightPanel] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState(360);

  const toggleSound = () => { synth.enabled = !soundEnabled; setSoundEnabled(!soundEnabled); };

  const applyPreset = (presetId: string | null) => {
    if (presetId === null) { setOptions(DEFAULT_OPTIONS); setActivePreset(null); }
    else {
      const preset = PRESETS.find(p => p.id === presetId);
      if (!preset) return;
      setOptions(preset.options.map((opt, i) => ({ ...opt, id: `preset-${presetId}-${i}` })));
      setActivePreset(presetId);
    }
    setRotation(0); setWinner(null);
  };

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 380) setCanvasSize(260);
      else if (width < 640) setCanvasSize(300);
      else setCanvasSize(380);
    };
    updateSize(); window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRingRadius = Math.min(centerX, centerY) - 6;
    const radius = outerRingRadius - 6;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Outer ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRingRadius, 0, 2 * Math.PI);
    ctx.fillStyle = isDarkMode ? '#0a0a12' : '#f0ede8';
    ctx.fill();

    // Metallic border gradient
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRingRadius - 0.5, 0, 2 * Math.PI);
    const borderGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (isDarkMode) {
      borderGrad.addColorStop(0, 'rgba(212,184,150,0.3)');
      borderGrad.addColorStop(0.5, 'rgba(212,184,150,0.05)');
      borderGrad.addColorStop(1, 'rgba(212,184,150,0.3)');
    } else {
      borderGrad.addColorStop(0, 'rgba(10,10,15,0.18)');
      borderGrad.addColorStop(0.5, 'rgba(10,10,15,0.03)');
      borderGrad.addColorStop(1, 'rgba(10,10,15,0.18)');
    }
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    let currentAngle = -Math.PI / 2;

    options.forEach((option) => {
      const segmentAngle = (option.weight / totalWeight) * 2 * Math.PI;
      const endAngle = currentAngle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
      ctx.closePath();

      const sliceGrad = ctx.createRadialGradient(centerX, centerY, 2, centerX, centerY, radius);
      sliceGrad.addColorStop(0, isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.4)');
      sliceGrad.addColorStop(0.4, option.color);
      sliceGrad.addColorStop(1, adjustColorBrightness(option.color, isDarkMode ? -30 : -15));
      ctx.fillStyle = sliceGrad;
      ctx.fill();

      // Divider line
      ctx.strokeStyle = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(currentAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      const contrastColor = getContrastColor(option.color);
      ctx.fillStyle = contrastColor;
      ctx.font = `bold ${canvasSize < 340 ? 10 : 12}px "Space Grotesk", sans-serif`;
      let displayText = option.text;
      const maxLen = canvasSize < 340 ? 5 : 6;
      if (displayText.length > maxLen) displayText = displayText.substring(0, maxLen) + '..';
      ctx.fillText(displayText, radius - 14, 3);
      ctx.font = `500 ${canvasSize < 340 ? 7 : 8}px "JetBrains Mono", monospace`;
      ctx.fillStyle = contrastColor === '#f5f0e8' ? 'rgba(245,240,232,0.4)' : 'rgba(10,10,15,0.4)';
      ctx.fillText(`w:${option.weight}`, radius - 14, 14);
      ctx.restore();
      currentAngle = endAngle;
    });

    // Center dial
    ctx.beginPath();
    ctx.arc(centerX, centerY, canvasSize < 340 ? 18 : 22, 0, 2 * Math.PI);
    const centerGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvasSize < 340 ? 18 : 22);
    if (isDarkMode) {
      centerGrad.addColorStop(0, '#12121a'); centerGrad.addColorStop(0.8, '#0a0a12'); centerGrad.addColorStop(1, '#06060a');
    } else {
      centerGrad.addColorStop(0, '#ffffff'); centerGrad.addColorStop(0.8, '#f0ede8'); centerGrad.addColorStop(1, '#e2ddd4');
    }
    ctx.fillStyle = centerGrad; ctx.fill();
    ctx.strokeStyle = isDarkMode ? 'rgba(212,184,150,0.15)' : 'rgba(10,10,15,0.1)';
    ctx.lineWidth = 1.5; ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
    ctx.fillStyle = isDarkMode ? '#d4b896' : '#0a0a0f';
    ctx.fill();
  }, [options, canvasSize, isDarkMode]);

  useEffect(() => { drawWheel(); }, [drawWheel, canvasSize, isDarkMode]);

  const spin = () => {
    if (isSpinning || options.length < 2) return;
    setIsSpinning(true); setWinner(null); setShowConfetti(false);
    const targetIndex = weightedRandomIndex(options);
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    const cumulativeAngles: number[] = [];
    let angleSum = 0;
    options.forEach(opt => { angleSum += (opt.weight / totalWeight) * 360; cumulativeAngles.push(angleSum); });
    let currentAngle = -90; let targetCenterAngle = 0;
    for (let i = 0; i < options.length; i++) {
      const segmentAngle = (options[i].weight / totalWeight) * 360;
      if (i === targetIndex) { targetCenterAngle = currentAngle + segmentAngle / 2 + (Math.random() - 0.5) * segmentAngle * 0.6; break; }
      currentAngle += segmentAngle;
    }
    const spins = 7 + Math.floor(Math.random() * 3);
    const targetRotation = rotation + spins * 360 + (270 - targetCenterAngle) - (rotation % 360);
    const startTime = performance.now();
    const duration = 4000;
    const startRotation = rotation;
    let lastSegmentIndex = -1;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      const currentRot = startRotation + (targetRotation - startRotation) * ease;
      setRotation(currentRot);
      const relativePointerAngle = (360 - (currentRot % 360) + 270) % 360;
      let activeIndex = 0;
      for (let i = 0; i < cumulativeAngles.length; i++) { if (relativePointerAngle < cumulativeAngles[i]) { activeIndex = i; break; } }
      if (activeIndex !== lastSegmentIndex) { if (lastSegmentIndex !== -1) synth.playTick(); lastSegmentIndex = activeIndex; }
      if (progress < 1) { requestAnimationFrame(animate); }
      else {
        setIsSpinning(false); setWinner(options[targetIndex]); setShowConfetti(true); synth.playWin();
        if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
        setTimeout(() => setShowConfetti(false), 3500);
      }
    };
    requestAnimationFrame(animate);
  };

  const addOption = () => {
    if (options.length >= 12) return;
    const newOption: WheelOption = { id: Date.now().toString(), text: `选项 ${String.fromCharCode(65 + options.length)}`, color: PRESET_COLORS[options.length % PRESET_COLORS.length], weight: 1 };
    setOptions([...options, newOption]);
  };

  const removeOption = (id: string) => { if (options.length <= 2) return; setOptions(options.filter(opt => opt.id !== id)); };
  const updateOption = (id: string, text: string) => { setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt)); };
  const updateWeight = (id: string, weight: number) => { setOptions(options.map(opt => opt.id === id ? { ...opt, weight: Math.max(1, Math.min(10, weight)) } : opt)); };
  const resetOptions = () => { setOptions(DEFAULT_OPTIONS); setRotation(0); setWinner(null); setActivePreset(null); };
  const getProbability = (weight: number) => { const total = options.reduce((sum, opt) => sum + opt.weight, 0); return ((weight / total) * 100).toFixed(1); };

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
            幸运转盘
          </span>

          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="btn-ghost w-9 h-9 p-0 flex items-center justify-center" title={isDarkMode ? '日间模式' : '夜间模式'}>
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={toggleSound} className={`btn-ghost w-9 h-9 p-0 flex items-center justify-center ${soundEnabled ? '' : 'opacity-50'}`} title={soundEnabled ? '关闭音效' : '开启音效'}>
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button onClick={resetOptions} className="btn-ghost hidden sm:flex items-center gap-2">
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

            {/* Wheel Panel */}
            <div className="lg:col-span-3 card p-6 sm:p-10 flex flex-col items-center">
              <div className="relative flex items-center justify-center py-4 sm:py-8">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                  <div className="w-0 h-0 border-l-[10px] sm:border-l-[12px] border-r-[10px] sm:border-r-[12px] border-t-[20px] sm:border-t-[24px] border-l-transparent border-r-transparent"
                    style={{ borderTopColor: 'var(--accent-gold)' }} />
                </div>

                {/* Wheel */}
                <motion.div
                  className="relative"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    filter: 'drop-shadow(0 12px 40px var(--shadow-color))',
                  }}
                >
                  <canvas ref={canvasRef} width={canvasSize} height={canvasSize} className="max-w-full h-auto rounded-full" />
                </motion.div>

                {/* Confetti */}
                <AnimatePresence>
                  {showConfetti && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 pointer-events-none">
                      {[...Array(24)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: i % 3 === 0 ? 'var(--accent-gold)' : (i % 3 === 1 ? 'var(--text-primary)' : 'var(--text-secondary)'), left: '50%', top: '50%' }}
                          animate={{
                            x: (Math.random() - 0.5) * canvasSize * 0.9,
                            y: (Math.random() - 0.5) * canvasSize * 0.9 - 30,
                            scale: [1, 0],
                            rotate: Math.random() * 720,
                          }}
                          transition={{ duration: 1.2 + Math.random() * 0.6, ease: 'easeOut' }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Spin Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={spin}
                disabled={isSpinning || options.length < 2}
                className="w-full max-w-xs btn-primary py-4 text-sm tracking-[0.15em] disabled:opacity-30 mt-2"
              >
                {isSpinning ? '转动中...' : '开始转盘'}
              </motion.button>

              {/* Winner */}
              <AnimatePresence>
                {winner && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ type: 'spring', damping: 20 }}
                    className="mt-6 w-full max-w-sm card p-5 text-center"
                    style={{ borderColor: 'var(--accent-gold)', boxShadow: '0 0 40px var(--glow-color)' }}
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] mb-2 font-medium" style={{ color: 'var(--accent-gold)' }}>
                      恭喜中奖
                    </p>
                    <p className="text-xl sm:text-2xl font-display font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                      {winner.text}
                    </p>
                    <p className="text-[10px] mt-1.5 font-mono" style={{ color: 'var(--text-muted)' }}>
                      权重 x{winner.weight} · {getProbability(winner.weight)}%
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Config Panel */}
            <div className="lg:col-span-2 card p-5 sm:p-7 flex flex-col">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <Settings2 className="w-4 h-4" style={{ color: 'var(--accent-gold)' }} />
                  <h2 className="font-display text-xs uppercase tracking-[0.15em]" style={{ color: 'var(--text-primary)' }}>
                    配置面板
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowWeightPanel(!showWeightPanel)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${showWeightPanel ? 'surface' : 'hover:surface'}`}
                    style={{ border: `1px solid ${showWeightPanel ? 'var(--border-light)' : 'var(--border-subtle)'}` }}
                    title="权重设置"
                  >
                    <BarChart3 className="w-4 h-4" style={{ color: showWeightPanel ? 'var(--accent-gold)' : 'var(--text-muted)' }} />
                  </button>
                  <span className="font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {options.length}/12
                  </span>
                </div>
              </div>

              {/* Presets */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2.5">
                  <BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  <span className="text-[10px] uppercase tracking-[0.15em] font-medium" style={{ color: 'var(--text-muted)' }}>预设</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyPreset(null)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all active:scale-95 border ${
                      activePreset === null
                        ? 'border-transparent' : ''
                    }`}
                    style={{
                      background: activePreset === null ? 'var(--accent-ink)' : 'var(--bg-card)',
                      color: activePreset === null ? 'var(--bg-primary)' : 'var(--text-tertiary)',
                      borderColor: activePreset === null ? 'transparent' : 'var(--border-subtle)',
                    }}
                  >
                    自定义
                  </button>
                  {PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset.id)}
                      className="px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all active:scale-95 border"
                      style={{
                        background: activePreset === preset.id ? 'var(--accent-ink)' : 'var(--bg-card)',
                        color: activePreset === preset.id ? 'var(--bg-primary)' : 'var(--text-tertiary)',
                        borderColor: activePreset === preset.id ? 'transparent' : 'var(--border-subtle)',
                      }}
                    >
                      {preset.emoji} {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options List */}
              <div className="space-y-2 mb-4 max-h-[240px] sm:max-h-[340px] overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {options.map((option, index) => (
                    <motion.div
                      key={option.id}
                      layout
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-2.5 p-2 rounded-xl transition-colors"
                      style={{ background: 'var(--bg-card)', border: `1px solid var(--border-subtle)` }}
                    >
                      <div className="w-3 h-3 rounded-full flex-shrink-0 border" style={{ backgroundColor: option.color, borderColor: 'var(--border-subtle)' }} />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(option.id, e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm font-medium min-w-0"
                        style={{ color: 'var(--text-primary)' }}
                        placeholder={`选项 ${String.fromCharCode(65 + index)}`}
                      />
                      {showWeightPanel ? (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg" style={{ background: 'var(--bg-primary)', border: `1px solid var(--border-subtle)` }}>
                          <span className="text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>权重</span>
                          <input
                            type="number" min={1} max={10} value={option.weight}
                            onChange={(e) => updateWeight(option.id, parseInt(e.target.value) || 1)}
                            className="w-6 text-center text-xs bg-transparent border-none outline-none font-mono font-bold"
                            style={{ color: 'var(--text-primary)' }}
                          />
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono px-1.5" style={{ color: 'var(--text-muted)' }}>
                          {getProbability(option.weight)}%
                        </span>
                      )}
                      <button
                        onClick={() => removeOption(option.id)}
                        disabled={options.length <= 2}
                        className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors active:scale-95 disabled:opacity-20"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-coral)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add Button */}
              <button
                onClick={addOption}
                disabled={options.length >= 12}
                className="w-full py-2.5 rounded-xl text-xs font-semibold uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-2"
                style={{ background: 'var(--bg-card)', color: 'var(--text-tertiary)', border: `1px dashed var(--border-subtle)` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
              >
                <Plus className="w-4 h-4" />
                添加选项
              </button>

              {/* Tip */}
              <div className="mt-4 p-3.5 rounded-xl" style={{ background: 'var(--bg-card)', border: `1px solid var(--border-subtle)` }}>
                <p className="text-[10px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {showWeightPanel
                    ? '输入 1-10 设置权重。权重越大，扇区面积和中奖概率越高。'
                    : '点击上方图表图标开启权重调节。等权重时所有选项概率均等。'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
