import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, RotateCcw, Settings2, BarChart3, BookOpen, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WheelOption {
  id: string;
  text: string;
  color: string;
  weight: number;
}

// Curated high-contrast art-gallery luxury default colors (Cohesive alternating desaturated palettes)
const PRESET_COLORS = [
  '#1b263b', // Deep Navy Blue (深邃靛蓝)
  '#d8c3a5', // Champagne Sand (香槟暖沙)
  '#5a6b5c', // Sophisticated Sage Green (雅致鼠尾草)
  '#e9ecef', // Crisp Alabaster Silver (极简铂银)
  '#c08a70', // Dusty Terracotta Rose (暮色陶土)
  '#415a77', // Cold Slate Blue (冷淬钢蓝)
  '#2e3033', // Basalt Charcoal (深曜火山灰)
  '#c8b195', // Warm Gold Sand (流沙哑金)
];

const DEFAULT_OPTIONS: WheelOption[] = [
  { id: '1', text: '选项 1', color: PRESET_COLORS[0], weight: 1 },
  { id: '2', text: '选项 2', color: PRESET_COLORS[1], weight: 1 },
  { id: '3', text: '选项 3', color: PRESET_COLORS[2], weight: 1 },
  { id: '4', text: '选项 4', color: PRESET_COLORS[3], weight: 1 },
];

interface WheelPreset {
  id: string;
  name: string;
  emoji: string;
  options: Omit<WheelOption, 'id'>[];
}

// Restored exactly to original preset style as requested
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

// Hex Color Brightness Adjuster for 3D depth and metallic rendering
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

// YIQ Brightness Formula to determine if text should be white or black for maximum contrast legibility
function getContrastColor(hex: string): string {
  if (!hex.startsWith('#')) return '#ffffff';
  const R = parseInt(hex.substring(1, 3), 16);
  const G = parseInt(hex.substring(3, 5), 16);
  const B = parseInt(hex.substring(5, 7), 16);
  
  // YIQ luminance formula
  const yiq = (R * 299 + G * 587 + B * 114) / 1000;
  return yiq >= 128 ? '#000000' : '#ffffff';
}

// Web Audio API Synthesizer for pure high-fidelity ticking & chime sounds
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

  public playTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    // High frequency short click representing wooden dial peg
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
    // Beautiful futuristic Major 7th arpeggio chord (C5, E5, G5, B5, D6)
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
    if (random <= 0) {
      return i;
    }
  }
  return options.length - 1;
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
  const [canvasSize, setCanvasSize] = useState(320);

  const toggleSound = () => {
    synth.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const applyPreset = (presetId: string | null) => {
    if (presetId === null) {
      setOptions(DEFAULT_OPTIONS);
      setActivePreset(null);
    } else {
      const preset = PRESETS.find(p => p.id === presetId);
      if (!preset) return;
      setOptions(preset.options.map((opt, i) => ({
        ...opt,
        id: `preset-${presetId}-${i}`,
      })));
      setActivePreset(presetId);
    }
    setRotation(0);
    setWinner(null);
  };

  // 响应式画布大小
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 380) setCanvasSize(280);
      else if (width < 640) setCanvasSize(320);
      else setCanvasSize(400);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Premium High-Contrast Art Canvas Renderer (Dynamically adjusts colors based on Light/Dark active theme)
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRingRadius = Math.min(centerX, centerY) - 8;
    const radius = outerRingRadius - 8;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw outer sleek slate ring backing (Adapts based on theme)
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRingRadius, 0, 2 * Math.PI);
    ctx.fillStyle = isDarkMode ? '#08080c' : '#f1f1f5';
    ctx.fill();

    // 2. Draw metallic outer ring wire border with gradient representing a physical polished bezel
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRingRadius - 1.5, 0, 2 * Math.PI);
    const borderGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (isDarkMode) {
      borderGrad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
      borderGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.03)');
      borderGrad.addColorStop(1, 'rgba(255, 255, 255, 0.22)');
    } else {
      borderGrad.addColorStop(0, 'rgba(0, 0, 0, 0.14)');
      borderGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.02)');
      borderGrad.addColorStop(1, 'rgba(0, 0, 0, 0.14)');
    }
    ctx.strokeStyle = borderGrad;
    ctx.lineWidth = 2;
    ctx.stroke();

    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    let currentAngle = -Math.PI / 2;

    // 3. Draw luxury sectors with radial metallic gradients
    options.forEach((option) => {
      const segmentAngle = (option.weight / totalWeight) * 2 * Math.PI;
      const endAngle = currentAngle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
      ctx.closePath();

      // Premium brushed steel sectors fading outwards (dynamic edge shadow based on active theme)
      const sliceGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius);
      sliceGrad.addColorStop(0, isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.35)');
      sliceGrad.addColorStop(0.35, option.color);
      sliceGrad.addColorStop(1, adjustColorBrightness(option.color, isDarkMode ? -35 : -18));
      
      ctx.fillStyle = sliceGrad;
      ctx.fill();

      // Sharp wire dividing lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Text rendering (Auto contrast based on slice color brightness!)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(currentAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      
      const contrastColor = getContrastColor(option.color);
      ctx.fillStyle = contrastColor;
      ctx.font = `bold ${canvasSize < 350 ? 11 : 13}px Inter, -apple-system, sans-serif`;
      
      let displayText = option.text;
      const maxLen = canvasSize < 350 ? 5 : 6;
      if (displayText.length > maxLen) {
        displayText = displayText.substring(0, maxLen) + '..';
      }
      
      ctx.fillText(displayText, radius - 16, 4);
      
      // Muted mono weight
      ctx.font = `500 ${canvasSize < 350 ? 7.5 : 8.5}px JetBrains Mono, monospace`;
      ctx.fillStyle = contrastColor === '#ffffff' ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.45)';
      ctx.fillText(`w:${option.weight}`, radius - 16, 15);
      
      ctx.restore();

      currentAngle = endAngle;
    });

    // 4. Central polished graphite/silver center dial (Adapts based on theme)
    ctx.beginPath();
    ctx.arc(centerX, centerY, canvasSize < 350 ? 20 : 25, 0, 2 * Math.PI);
    const centerGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvasSize < 350 ? 20 : 25);
    
    if (isDarkMode) {
      centerGrad.addColorStop(0, '#121318');
      centerGrad.addColorStop(0.8, '#060608');
      centerGrad.addColorStop(1, '#000000');
    } else {
      centerGrad.addColorStop(0, '#ffffff');
      centerGrad.addColorStop(0.8, '#e2e8f0');
      centerGrad.addColorStop(1, '#cbd5e1');
    }
    
    ctx.fillStyle = centerGrad;
    ctx.fill();
    ctx.strokeStyle = isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center micro core
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = isDarkMode ? '#ffffff' : '#05050c';
    ctx.fill();

  }, [options, canvasSize, isDarkMode]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel, canvasSize, isDarkMode]);

  // Master Easing Frame Loop
  const spin = () => {
    if (isSpinning || options.length < 2) return;

    setIsSpinning(true);
    setWinner(null);
    setShowConfetti(false);

    const targetIndex = weightedRandomIndex(options);
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);

    const cumulativeAngles: number[] = [];
    let angleSum = 0;
    options.forEach(opt => {
      angleSum += (opt.weight / totalWeight) * 360;
      cumulativeAngles.push(angleSum);
    });

    let currentAngle = -90;
    let targetCenterAngle = 0;

    for (let i = 0; i < options.length; i++) {
      const segmentAngle = (options[i].weight / totalWeight) * 360;
      if (i === targetIndex) {
        const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.7;
        targetCenterAngle = currentAngle + segmentAngle / 2 + randomOffset;
        break;
      }
      currentAngle += segmentAngle;
    }

    const spins = 6 + Math.floor(Math.random() * 3);
    const targetRotation = rotation + spins * 360 + (270 - targetCenterAngle) - (rotation % 360);

    const startTime = performance.now();
    const duration = 3800;
    const startRotation = rotation;

    let lastSegmentIndex = -1;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Quartic Easing Out
      const ease = 1 - Math.pow(1 - progress, 4);
      const currentRot = startRotation + (targetRotation - startRotation) * ease;
      setRotation(currentRot);

      const relativePointerAngle = (360 - (currentRot % 360) + 270) % 360;
      
      let activeIndex = 0;
      for (let i = 0; i < cumulativeAngles.length; i++) {
        if (relativePointerAngle < cumulativeAngles[i]) {
          activeIndex = i;
          break;
        }
      }

      if (activeIndex !== lastSegmentIndex) {
        if (lastSegmentIndex !== -1) {
          synth.playTick();
        }
        lastSegmentIndex = activeIndex;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setWinner(options[targetIndex]);
        setShowConfetti(true);
        synth.playWin();
        
        if (navigator.vibrate) {
          navigator.vibrate([50, 100, 50]);
        }
        setTimeout(() => setShowConfetti(false), 3000);
      }
    };

    requestAnimationFrame(animate);
  };

  const addOption = () => {
    if (options.length >= 12) return;
    const newOption: WheelOption = {
      id: Date.now().toString(),
      text: `选项 ${options.length + 1}`,
      color: PRESET_COLORS[options.length % PRESET_COLORS.length],
      weight: 1,
    };
    setOptions([...options, newOption]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) return;
    setOptions(options.filter(opt => opt.id !== id));
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt));
  };

  const updateWeight = (id: string, weight: number) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, weight: Math.max(1, Math.min(10, weight)) } : opt));
  };

  const resetOptions = () => {
    setOptions(DEFAULT_OPTIONS);
    setRotation(0);
    setWinner(null);
  };

  const getProbability = (weight: number) => {
    const total = options.reduce((sum, opt) => sum + opt.weight, 0);
    return ((weight / total) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-dropbox-gray-50 text-dropbox-gray-900 overflow-hidden relative selection:bg-white/20 transition-colors duration-500">
      {/* Background drifting light spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-mesh-blob bg-dropbox-blue animate-float-slow opacity-[0.03] pointer-events-none" />

      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dropbox-gray-50/70 backdrop-blur-xl border-b border-dropbox-gray-100">
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
              幸运转盘 // WHEEL
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
              onClick={resetOptions}
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
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
            
            {/* Wheel Section */}
            <div className="lusion-card rounded-xl p-6 sm:p-8 flex flex-col justify-between border-dropbox-gray-100">
              <div className="relative flex items-center justify-center py-6 sm:py-10">
                {/* Minimal Elegant Pointer Needle (Theme Adaptive color) */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-[0_4px_10px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]">
                  <div className="w-0 h-0 border-l-[10px] sm:border-l-[13px] border-r-[10px] sm:border-r-[13px] border-t-[20px] sm:border-t-[26px] border-l-transparent border-r-transparent border-t-black dark:border-t-white" />
                </div>
                
                {/* Canvas Wheel Container */}
                <div 
                  className="relative drop-shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_12px_40px_rgba(0,0,0,0.8)]"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    width={canvasSize}
                    height={canvasSize}
                    className="max-w-full h-auto rounded-full"
                  />
                </div>

                {/* Confetti Particle Effect */}
                <AnimatePresence>
                  {showConfetti && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 pointer-events-none"
                    >
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: isDarkMode ? '#ffffff' : '#000000',
                            left: '50%',
                            top: '50%',
                          }}
                          animate={{
                            x: (Math.random() - 0.5) * (canvasSize * 0.95),
                            y: (Math.random() - 0.5) * (canvasSize * 0.95),
                            scale: [1.2, 0],
                            rotate: Math.random() * 720,
                          }}
                          transition={{
                            duration: 1.2 + Math.random(),
                            ease: 'easeOut',
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Spin Button */}
              <button
                onClick={spin}
                disabled={isSpinning || options.length < 2}
                className="w-full mt-4 py-3.5 bg-dropbox-blue text-dropbox-black font-display font-semibold text-xs uppercase tracking-widest rounded disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 hover:opacity-90 active:scale-[0.98] border border-dropbox-blue"
              >
                {isSpinning ? '转盘中...' : '开始转盘 // SPIN'}
              </button>

              {/* Winner Display */}
              <AnimatePresence>
                {winner && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -15 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="mt-6 p-4 sm:p-5 bg-white/5 border border-dropbox-gray-100 rounded-lg text-center"
                  >
                    <p className="text-[10px] uppercase text-dropbox-gray-400 font-medium mb-2 tracking-widest">🎉 恭喜！结果是 // WINNER</p>
                    <p className="text-xl sm:text-2xl font-display font-light text-dropbox-gray-900 uppercase tracking-wider">
                      {winner.text}
                    </p>
                    <p className="text-[10px] text-dropbox-gray-400 mt-2 font-mono">
                      WEIGHT: x{winner.weight} ({getProbability(winner.weight)}%)
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Options Section */}
            <div className="lusion-card rounded-xl p-6 sm:p-8 flex flex-col border-dropbox-gray-100">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Settings2 className="w-4 h-4 sm:w-5 sm:h-5 text-dropbox-gray-900" />
                  <h2 className="font-display font-light text-sm uppercase tracking-widest text-dropbox-gray-900">
                    配置面板 // CONFIG
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setShowWeightPanel(!showWeightPanel)}
                    className={`p-1.5 sm:p-2 rounded border transition-all duration-300 ${
                      showWeightPanel 
                        ? 'bg-white/10 text-dropbox-gray-900 border-dropbox-gray-200 shadow-soft' 
                        : 'bg-white/5 text-dropbox-gray-400 border-dropbox-gray-100 hover:bg-white/10 hover:border-dropbox-gray-200'
                    }`}
                    title="设置权重"
                  >
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <span className="text-xs text-dropbox-gray-400 font-mono">
                    {options.length} / 12 ITEMS
                  </span>
                </div>
              </div>

              {/* Restored Presets Selector - exactly original style (Valorant/LOL) */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-dropbox-gray-900" />
                  <span className="text-xs uppercase tracking-widest text-dropbox-gray-400">选择预设 // PRESETS</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyPreset(null)}
                    className={`px-3 py-1.5 sm:py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 border ${
                      activePreset === null
                        ? 'bg-dropbox-blue text-dropbox-black border-dropbox-blue'
                        : 'bg-white/5 text-dropbox-gray-400 border-dropbox-gray-100 hover:bg-white/10 hover:border-dropbox-gray-200'
                    }`}
                  >
                    自定义
                  </button>
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset.id)}
                      className={`px-3 py-1.5 sm:py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 border ${
                        activePreset === preset.id
                          ? 'bg-dropbox-blue text-dropbox-black border-dropbox-blue'
                          : 'bg-white/5 text-dropbox-gray-400 border-dropbox-gray-100 hover:bg-white/10 hover:border-dropbox-gray-200'
                      }`}
                    >
                      {preset.emoji} {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options List */}
              <div className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-6 max-h-[260px] sm:max-h-[360px] overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {options.map((option, index) => (
                    <div
                      key={option.id}
                      className="flex items-center gap-2 sm:gap-3 p-2 bg-white/5 border border-dropbox-gray-100 rounded hover:border-dropbox-gray-200 transition-colors animate-fade-in-up"
                    >
                      {/* Grey Scale Dot Indicator */}
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0 border border-dropbox-gray-100"
                        style={{ backgroundColor: option.color }}
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(option.id, e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-dropbox-gray-900 font-medium placeholder:text-dropbox-gray-300 text-xs sm:text-sm min-w-0"
                        placeholder={`选项 ${index + 1}`}
                      />
                      
                      {/* Weight Control */}
                      {showWeightPanel ? (
                        <div className="flex items-center gap-1 sm:gap-2 bg-black/5 dark:bg-black/40 px-2 py-0.5 rounded border border-dropbox-gray-100">
                          <span className="text-[10px] text-dropbox-gray-400 uppercase tracking-widest">权重</span>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={option.weight}
                            onChange={(e) => updateWeight(option.id, parseInt(e.target.value) || 1)}
                            className="w-7 text-center text-xs bg-transparent border-none focus:outline-none text-dropbox-gray-900 font-mono font-bold"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-dropbox-gray-400 font-mono px-1 sm:px-2">
                          {getProbability(option.weight)}%
                        </span>
                      )}
                      
                      <button
                        onClick={() => removeOption(option.id)}
                        disabled={options.length <= 2}
                        className="w-7 h-7 flex items-center justify-center rounded text-dropbox-gray-400 hover:text-dropbox-accent-coral hover:bg-dropbox-accent-coral/10 disabled:opacity-20 disabled:hover:bg-transparent transition-colors active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add Button */}
              <button
                onClick={addOption}
                disabled={options.length >= 12}
                className="w-full py-2.5 sm:py-3 border border-dashed border-dropbox-gray-100 rounded text-dropbox-gray-400 font-medium text-xs sm:text-sm hover:border-dropbox-gray-200 hover:text-dropbox-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] bg-white/5 uppercase tracking-widest font-semibold"
              >
                <Plus className="w-4 h-4 text-dropbox-gray-900" />
                添加选项 // ADD ITEM
              </button>

              {/* Tips */}
              <div className="mt-4 p-3 bg-white/5 border border-dropbox-gray-100 rounded">
                <p className="text-xs text-dropbox-gray-400 leading-relaxed font-light">
                  <span className="font-semibold text-dropbox-gray-900">💡 提示：</span>
                  {showWeightPanel 
                    ? "通过输入 1 到 10 之间的数字来设置该选项的权重。权重越大，在转盘中所占用的弧度和中奖几率越大。"
                    : "点击控制栏的图表图标，即可开启权重调整滑块。等比例时所有选项中奖几率均等。"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
