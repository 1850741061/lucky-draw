import { useState, useRef, useCallback, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, Play, RotateCcw, Settings2, Sparkles, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WheelOption {
  id: string;
  text: string;
  color: string;
  weight: number;
}

const PRESET_COLORS = [
  '#0061FF', '#7B61FF', '#FF6B9D', '#FF6B6B',
  '#FF9F43', '#FFD93D', '#6BCB77', '#4ECDC4',
];

const DEFAULT_OPTIONS: WheelOption[] = [
  { id: '1', text: '选项 1', color: PRESET_COLORS[0], weight: 1 },
  { id: '2', text: '选项 2', color: PRESET_COLORS[1], weight: 1 },
  { id: '3', text: '选项 3', color: PRESET_COLORS[2], weight: 1 },
  { id: '4', text: '选项 4', color: PRESET_COLORS[3], weight: 1 },
];

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState(320);

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

  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 8;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    let currentAngle = -Math.PI / 2;

    options.forEach((option) => {
      const segmentAngle = (option.weight / totalWeight) * 2 * Math.PI;
      const endAngle = currentAngle + segmentAngle;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = option.color;
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(currentAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${canvasSize < 350 ? 12 : 14}px Inter, sans-serif`;
      
      let displayText = option.text;
      const maxLen = canvasSize < 350 ? 5 : 6;
      if (displayText.length > maxLen) {
        displayText = displayText.substring(0, maxLen) + '..';
      }
      
      ctx.fillText(displayText, radius - 12, 4);
      
      ctx.font = `${canvasSize < 350 ? 8 : 10}px Inter, sans-serif`;
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(`x${option.weight}`, radius - 12, 16);
      
      ctx.restore();

      currentAngle = endAngle;
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, canvasSize < 350 ? 20 : 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#0061FF';
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [options, canvasSize]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel, canvasSize]);

  const spin = () => {
    if (isSpinning || options.length < 2) return;

    setIsSpinning(true);
    setWinner(null);
    setShowConfetti(false);

    const targetIndex = weightedRandomIndex(options);
    
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    let currentAngle = -90;
    
    for (let i = 0; i < options.length; i++) {
      const segmentAngle = (options[i].weight / totalWeight) * 360;
      if (i === targetIndex) {
        const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
        const targetCenterAngle = currentAngle + segmentAngle / 2 + randomOffset;
        const spins = 5 + Math.floor(Math.random() * 3);
        const newRotation = rotation + spins * 360 + (270 - targetCenterAngle) - (rotation % 360);
        
        setRotation(newRotation);
        break;
      }
      currentAngle += segmentAngle;
    }

    setTimeout(() => {
      setWinner(options[targetIndex]);
      setIsSpinning(false);
      setShowConfetti(true);
      
      // 移动端振动反馈
      if (navigator.vibrate) {
        navigator.vibrate([50, 100, 50]);
      }
      
      setTimeout(() => setShowConfetti(false), 3000);
    }, 3000);
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
    <div className="min-h-screen bg-dropbox-gray-50">
      {/* Header - 移动端优化 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-dropbox-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 sm:gap-2 text-dropbox-gray-600 hover:text-dropbox-gray-900 transition-colors active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium text-sm sm:text-base">返回</span>
          </button>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-dropbox-blue rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="font-display font-semibold text-dropbox-gray-900 text-base sm:text-lg">
              幸运转盘
            </span>
          </div>
          
          <button
            onClick={resetOptions}
            className="flex items-center gap-1 sm:gap-2 text-dropbox-gray-500 hover:text-dropbox-gray-900 transition-colors active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-xs sm:text-sm hidden sm:inline">重置</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 sm:pt-24 pb-6 sm:pb-12 px-3 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Wheel Section */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-soft p-4 sm:p-8">
              <div className="relative flex items-center justify-center">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1.5 sm:-translate-y-2 z-10">
                  <div className="w-0 h-0 border-l-[10px] sm:border-l-[15px] border-r-[10px] sm:border-r-[15px] border-t-[18px] sm:border-t-[25px] border-l-transparent border-r-transparent border-t-dropbox-gray-900" />
                </div>
                
                {/* Canvas Wheel */}
                <div 
                  className="relative"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
                  }}
                >
                  <canvas
                    ref={canvasRef}
                    width={canvasSize}
                    height={canvasSize}
                    className="max-w-full h-auto"
                  />
                </div>

                {/* Confetti Effect */}
                <AnimatePresence>
                  {showConfetti && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 pointer-events-none"
                    >
                      {[...Array(15)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                          style={{
                            backgroundColor: PRESET_COLORS[i % PRESET_COLORS.length],
                            left: '50%',
                            top: '50%',
                          }}
                          animate={{
                            x: (Math.random() - 0.5) * (canvasSize * 0.8),
                            y: (Math.random() - 0.5) * (canvasSize * 0.8),
                            scale: [1, 0],
                            rotate: Math.random() * 720,
                          }}
                          transition={{
                            duration: 1 + Math.random(),
                            ease: 'easeOut',
                          }}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Spin Button - 移动端更大 */}
              <button
                onClick={spin}
                disabled={isSpinning || options.length < 2}
                className="w-full mt-4 sm:mt-8 py-3 sm:py-4 bg-dropbox-blue text-white font-display font-semibold text-base sm:text-lg rounded-xl sm:rounded-2xl hover:bg-dropbox-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-glow-blue active:scale-[0.98] flex items-center justify-center gap-2 touch-manipulation"
              >
                <Play className="w-5 h-5" />
                {isSpinning ? '转盘中...' : '开始转盘'}
              </button>

              {/* Winner Display */}
              <AnimatePresence>
                {winner && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-4 sm:mt-6 p-4 sm:p-6 bg-dropbox-blue/10 rounded-xl sm:rounded-2xl text-center"
                  >
                    <p className="text-xs sm:text-sm text-dropbox-blue font-medium mb-1">🎉 恭喜！结果是</p>
                    <p className="text-2xl sm:text-3xl font-display font-bold text-dropbox-blue">
                      {winner.text}
                    </p>
                    <p className="text-xs text-dropbox-blue/60 mt-1 sm:mt-2">
                      权重: x{winner.weight} ({getProbability(winner.weight)}%)
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Options Section */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-soft p-4 sm:p-8">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Settings2 className="w-4 h-4 sm:w-5 sm:h-5 text-dropbox-gray-400" />
                  <h2 className="font-display font-semibold text-base sm:text-xl text-dropbox-gray-900">
                    转盘选项
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={() => setShowWeightPanel(!showWeightPanel)}
                    className={`p-1.5 sm:p-2 rounded-lg transition-colors ${showWeightPanel ? 'bg-dropbox-blue text-white' : 'text-dropbox-gray-400 hover:bg-dropbox-gray-100'}`}
                    title="设置权重"
                  >
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <span className="text-xs sm:text-sm text-dropbox-gray-400">
                    {options.length} / 12
                  </span>
                </div>
              </div>

              {/* Options List */}
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6 max-h-[280px] sm:max-h-[400px] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {options.map((option, index) => (
                    <motion.div
                      key={option.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-dropbox-gray-50 rounded-lg sm:rounded-xl group hover:bg-dropbox-gray-100 transition-colors"
                    >
                      <div
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: option.color }}
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(option.id, e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-dropbox-gray-900 font-medium placeholder:text-dropbox-gray-400 text-sm sm:text-base min-w-0"
                        placeholder={`选项 ${index + 1}`}
                      />
                      
                      {/* Weight Control */}
                      {showWeightPanel ? (
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-xs text-dropbox-gray-400 hidden sm:inline">权重</span>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={option.weight}
                            onChange={(e) => updateWeight(option.id, parseInt(e.target.value) || 1)}
                            className="w-10 sm:w-12 px-1 sm:px-2 py-1 text-center text-xs sm:text-sm bg-white border border-dropbox-gray-200 rounded-lg focus:outline-none focus:border-dropbox-blue"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-dropbox-gray-400 px-1 sm:px-2">
                          {getProbability(option.weight)}%
                        </span>
                      )}
                      
                      <button
                        onClick={() => removeOption(option.id)}
                        disabled={options.length <= 2}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-dropbox-gray-400 hover:text-dropbox-accent-coral hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors active:scale-95"
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
                className="w-full py-2.5 sm:py-3 border-2 border-dashed border-dropbox-gray-200 rounded-lg sm:rounded-xl text-dropbox-gray-500 font-medium text-sm sm:text-base hover:border-dropbox-blue hover:text-dropbox-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                添加选项
              </button>

              {/* Tips */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-dropbox-gray-50 rounded-lg sm:rounded-xl">
                <p className="text-xs sm:text-sm text-dropbox-gray-500">
                  <span className="font-medium text-dropbox-gray-700">💡 提示：</span>
                  {showWeightPanel 
                    ? "权重越大，扇区越大，被选中的概率越高。范围 1-10。"
                    : "点击图表图标可设置每个选项的权重。默认等概率。"
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
