import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, RotateCcw, Settings2, Sparkles, BarChart3, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WheelOption {
  id: string;
  text: string;
  color: string;
  weight: number;
}

const PRESET_COLORS = [
  '#00F0FF', '#BD00FF', '#FF007A', '#FF0055',
  '#FF9E00', '#FFEE00', '#00FF85', '#00FFD2',
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

const PRESETS: WheelPreset[] = [
  {
    id: 'game',
    name: '游戏大作',
    emoji: '🎮',
    options: [
      { text: '无畏契约', color: '#FF4655', weight: 1 },
      { text: '英雄联盟', color: '#C8AA6E', weight: 1 },
      { text: '绝地求生', color: '#E5A93C', weight: 1 },
      { text: '黑神话：悟空', color: '#8E7355', weight: 1 },
      { text: '赛博朋克 2077', color: '#FCE300', weight: 1 },
    ],
  },
  {
    id: 'food',
    name: '今天吃啥',
    emoji: '🍔',
    options: [
      { text: '热辣火锅', color: '#FF0055', weight: 1 },
      { text: '自助烧烤', color: '#FF9E00', weight: 1 },
      { text: '麦当劳', color: '#FFEE00', weight: 1 },
      { text: '日料寿司', color: '#00FFD2', weight: 1 },
      { text: '椰子鸡', color: '#00FF85', weight: 1 },
      { text: '减脂沙拉', color: '#00F0FF', weight: 1 },
    ],
  },
  {
    id: 'decision',
    name: '决定助手',
    emoji: '🔮',
    options: [
      { text: '放手去做', color: '#00FF85', weight: 1 },
      { text: '听天由命', color: '#bd00ff', weight: 1 },
      { text: '再想一想', color: '#FFEE00', weight: 1 },
      { text: '果断放弃', color: '#FF0055', weight: 1 },
      { text: '睡一觉再说', color: '#00F0FF', weight: 1 },
    ],
  },
];

// Hex Color Brightness Adjuster for 3D metallic rim depth
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

export default function WheelPage({ onBack }: WheelPageProps) {
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

  // Synced audio toggle
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

  // Premium Canvas Renderer with Glass gradients & 3D bevels
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

    // 1. Draw outer neon ambient ring shadow
    ctx.shadowColor = 'rgba(0, 240, 255, 0.25)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRingRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f1225';
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow

    // 2. Draw metallic outer ring boundary
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRingRadius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.stroke();

    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    let currentAngle = -Math.PI / 2;

    // 3. Draw radial crystal slices
    options.forEach((option) => {
      const segmentAngle = (option.weight / totalWeight) * 2 * Math.PI;
      const endAngle = currentAngle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
      ctx.closePath();

      // Create rich radial metallic/glass gradient
      const sliceGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius);
      sliceGrad.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      sliceGrad.addColorStop(0.3, option.color);
      sliceGrad.addColorStop(1, adjustColorBrightness(option.color, -38));
      
      ctx.fillStyle = sliceGrad;
      ctx.fill();

      // Cyber division boundary line
      ctx.strokeStyle = 'rgba(10, 11, 22, 0.55)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Option label positioning
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(currentAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${canvasSize < 350 ? 12 : 14}px Inter, -apple-system, sans-serif`;
      
      // Shadow behind text for cyber neon readability
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;

      let displayText = option.text;
      const maxLen = canvasSize < 350 ? 5 : 6;
      if (displayText.length > maxLen) {
        displayText = displayText.substring(0, maxLen) + '..';
      }
      
      ctx.fillText(displayText, radius - 18, 4);
      
      // Weight indicator
      ctx.font = `500 ${canvasSize < 350 ? 8 : 9}px JetBrains Mono, monospace`;
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(`x${option.weight}`, radius - 18, 16);
      
      ctx.restore();

      currentAngle = endAngle;
    });

    // 4. Central polished 3D metallic hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, canvasSize < 350 ? 22 : 28, 0, 2 * Math.PI);
    const centerGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvasSize < 350 ? 22 : 28);
    centerGrad.addColorStop(0, '#ffffff');
    centerGrad.addColorStop(0.15, '#b4f4ff');
    centerGrad.addColorStop(0.75, '#0b0f19');
    centerGrad.addColorStop(1, '#030307');
    ctx.fillStyle = centerGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Central target core dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, 2 * Math.PI);
    ctx.fillStyle = '#00F0FF';
    ctx.fill();

  }, [options, canvasSize]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel, canvasSize]);

  // Master-level Easing Physics Loop for Perfect Sound Synchronization
  const spin = () => {
    if (isSpinning || options.length < 2) return;

    setIsSpinning(true);
    setWinner(null);
    setShowConfetti(false);

    const targetIndex = weightedRandomIndex(options);
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);

    // Calculate angles based on weights
    const cumulativeAngles: number[] = [];
    let angleSum = 0;
    options.forEach(opt => {
      angleSum += (opt.weight / totalWeight) * 360;
      cumulativeAngles.push(angleSum);
    });

    let currentAngle = -90; // Starting from pointer top
    let targetCenterAngle = 0;

    for (let i = 0; i < options.length; i++) {
      const segmentAngle = (options[i].weight / totalWeight) * 360;
      if (i === targetIndex) {
        // Subtle offset from perfect center to avoid robotic accuracy
        const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.7;
        targetCenterAngle = currentAngle + segmentAngle / 2 + randomOffset;
        break;
      }
      currentAngle += segmentAngle;
    }

    const spins = 6 + Math.floor(Math.random() * 3);
    const targetRotation = rotation + spins * 360 + (270 - targetCenterAngle) - (rotation % 360);

    const startTime = performance.now();
    const duration = 3800; // 3.8s for premium tension buildup
    const startRotation = rotation;

    let lastSegmentIndex = -1;

    // Perfect tick-synced frame loop
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Quartic Ease Out curve
      const ease = 1 - Math.pow(1 - progress, 4);
      const currentRot = startRotation + (targetRotation - startRotation) * ease;
      setRotation(currentRot);

      // Calculate relative dial pointer angle (270 deg at top)
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
        
        // Haptic feedback
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
    <div className="min-h-screen bg-[#030308] text-white overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-400">
      {/* Background drifting light spots */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-mesh-blob bg-[#00f0ff] animate-float-slow opacity-[0.06] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-mesh-blob bg-[#bd00ff] animate-float-slower opacity-[0.07] pointer-events-none" />

      {/* Header - 移动端优化 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070814]/75 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 sm:gap-2 text-dropbox-gray-400 hover:text-white transition-colors active:scale-95 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5"
          >
            <ArrowLeft className="w-5 h-5 text-dropbox-blue" />
            <span className="font-medium text-sm sm:text-base">返回</span>
          </button>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-tr from-dropbox-blue to-dropbox-accent-purple rounded-lg flex items-center justify-center shadow-glow-blue">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="font-display font-semibold bg-gradient-to-r from-white via-[#b4f4ff] to-white/70 bg-clip-text text-transparent text-base sm:text-lg tracking-wider">
              幸运转盘
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle button */}
            <button
              onClick={toggleSound}
              className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 border active:scale-95 ${
                soundEnabled 
                  ? 'bg-dropbox-blue/15 text-dropbox-blue border-dropbox-blue/20 shadow-glow-blue' 
                  : 'bg-white/5 text-dropbox-gray-400 border-white/5'
              }`}
              title={soundEnabled ? '关闭声音' : '开启声音'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            
            <button
              onClick={resetOptions}
              className="flex items-center gap-1 sm:gap-2 text-dropbox-gray-400 hover:text-white transition-colors active:scale-95 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5"
            >
              <RotateCcw className="w-4 h-4 text-dropbox-accent-purple" />
              <span className="text-xs sm:text-sm hidden sm:inline">重置</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 sm:pt-24 pb-6 sm:pb-12 px-3 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Wheel Section */}
            <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 flex flex-col justify-between border-white/10">
              <div className="relative flex items-center justify-center py-6 sm:py-10">
                {/* Visual Pointer Pin with Neon Glow */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]">
                  <div className="w-0 h-0 border-l-[12px] sm:border-l-[16px] border-r-[12px] sm:border-r-[16px] border-t-[22px] sm:border-t-[30px] border-l-transparent border-r-transparent border-t-dropbox-blue" />
                </div>
                
                {/* Canvas Wheel Container */}
                <div 
                  className="relative drop-shadow-[0_0_40px_rgba(0,0,0,0.6)]"
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
                          className="absolute w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full"
                          style={{
                            backgroundColor: PRESET_COLORS[i % PRESET_COLORS.length],
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
                className="w-full mt-4 py-3.5 sm:py-4 bg-gradient-to-r from-dropbox-blue to-dropbox-blue-dark text-white font-display font-semibold text-base sm:text-lg rounded-xl sm:rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-glow-blue border border-white/10 active:scale-[0.98]"
              >
                {isSpinning ? '转盘中...' : '开始转盘'}
              </button>

              {/* Winner Display with spring bounce scale */}
              <AnimatePresence>
                {winner && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: -15 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="mt-6 p-4 sm:p-5 bg-gradient-to-r from-dropbox-blue/15 to-dropbox-accent-purple/15 rounded-xl sm:rounded-2xl border border-dropbox-blue/20 text-center"
                  >
                    <p className="text-xs sm:text-sm text-dropbox-blue font-medium mb-1 tracking-wider">🎉 恭喜！结果是</p>
                    <p className="text-2xl sm:text-3xl font-display font-bold text-white bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
                      {winner.text}
                    </p>
                    <p className="text-xs text-dropbox-gray-400 mt-2 font-mono">
                      中奖权重: x{winner.weight} ({getProbability(winner.weight)}%)
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Options Section */}
            <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 flex flex-col border-white/10">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Settings2 className="w-4 h-4 sm:w-5 sm:h-5 text-dropbox-blue" />
                  <h2 className="font-display font-semibold text-base sm:text-xl text-white">
                    转盘选项
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setShowWeightPanel(!showWeightPanel)}
                    className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 border ${
                      showWeightPanel 
                        ? 'bg-dropbox-blue/20 text-dropbox-blue border-dropbox-blue/30 shadow-glow-blue' 
                        : 'bg-white/5 text-dropbox-gray-400 border-white/5 hover:bg-white/10'
                    }`}
                    title="设置权重"
                  >
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <span className="text-xs sm:text-sm text-dropbox-gray-400 font-mono">
                    {options.length} / 12 项
                  </span>
                </div>
              </div>

              {/* Preset Selector */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-dropbox-accent-purple" />
                  <span className="text-xs sm:text-sm font-medium text-dropbox-gray-400">选择预设</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyPreset(null)}
                    className={`px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all active:scale-95 border ${
                      activePreset === null
                        ? 'bg-gradient-to-r from-dropbox-blue to-dropbox-blue-dark text-white border-dropbox-blue/20 shadow-glow-blue'
                        : 'bg-white/5 text-dropbox-gray-400 border-white/5 hover:bg-white/10'
                    }`}
                  >
                    自定义
                  </button>
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset.id)}
                      className={`px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all active:scale-95 border ${
                        activePreset === preset.id
                          ? 'bg-gradient-to-r from-dropbox-accent-purple to-purple-800 text-white border-dropbox-accent-purple/20 shadow-glow-purple'
                          : 'bg-white/5 text-dropbox-gray-400 border-white/5 hover:bg-white/10'
                      }`}
                    >
                      {preset.emoji} {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options List */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 max-h-[260px] sm:max-h-[380px] overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {options.map((option, index) => (
                    <motion.div
                      key={option.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 bg-white/5 border border-white/5 rounded-xl group hover:border-white/10 transition-colors"
                    >
                      {/* Interactive Color Indicator */}
                      <div
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: option.color, boxShadow: `0 0 10px ${option.color}80` }}
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(option.id, e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-white font-medium placeholder:text-dropbox-gray-400 text-sm sm:text-base min-w-0"
                        placeholder={`选项 ${index + 1}`}
                      />
                      
                      {/* Weight Control */}
                      {showWeightPanel ? (
                        <div className="flex items-center gap-1 sm:gap-2 bg-black/30 px-2 py-1 rounded-lg border border-white/5">
                          <span className="text-[10px] sm:text-xs text-dropbox-gray-400">权重</span>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={option.weight}
                            onChange={(e) => updateWeight(option.id, parseInt(e.target.value) || 1)}
                            className="w-8 sm:w-10 text-center text-xs bg-transparent border-none focus:outline-none text-dropbox-blue font-mono font-bold"
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
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-dropbox-gray-400 hover:text-dropbox-accent-coral hover:bg-dropbox-accent-coral/10 disabled:opacity-20 disabled:hover:bg-transparent transition-colors active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add Button */}
              <button
                onClick={addOption}
                disabled={options.length >= 12}
                className="w-full py-2.5 sm:py-3.5 border border-dashed border-white/10 rounded-xl text-dropbox-gray-400 font-medium text-sm sm:text-base hover:border-dropbox-blue hover:text-dropbox-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] bg-white/5"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-dropbox-blue" />
                添加选项
              </button>

              {/* Tips */}
              <div className="mt-4 p-3.5 bg-white/5 border border-white/5 rounded-xl">
                <p className="text-xs sm:text-sm text-dropbox-gray-400 leading-relaxed">
                  <span className="font-semibold text-dropbox-blue">💡 提示：</span>
                  {showWeightPanel 
                    ? "通过调节权重（1-10）让转盘中不同选项占有不同扇面大小。数值越大，概率越高。"
                    : "点击右上角图表图标开启权重调节功能，可自由设定每个选项的抽中概率比例。"
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
