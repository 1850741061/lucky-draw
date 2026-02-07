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

// 加权随机选择算法
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

  // 绘制带权重的转盘（扇区大小根据权重比例）
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    let currentAngle = -Math.PI / 2; // 从12点钟方向开始

    options.forEach((option) => {
      const segmentAngle = (option.weight / totalWeight) * 2 * Math.PI;
      const endAngle = currentAngle + segmentAngle;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = option.color;
      ctx.fill();

      // Draw border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(currentAngle + segmentAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Inter, sans-serif';
      
      let displayText = option.text;
      if (displayText.length > 6) {
        displayText = displayText.substring(0, 6) + '...';
      }
      
      ctx.fillText(displayText, radius - 15, 5);
      
      // Draw weight indicator
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText(`x${option.weight}`, radius - 15, 18);
      
      ctx.restore();

      currentAngle = endAngle;
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#0061FF';
    ctx.lineWidth = 4;
    ctx.stroke();
  }, [options]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  const spin = () => {
    if (isSpinning || options.length < 2) return;

    setIsSpinning(true);
    setWinner(null);
    setShowConfetti(false);

    // 使用加权随机算法决定结果
    const targetIndex = weightedRandomIndex(options);
    
    // 计算需要旋转到的角度
    // 转盘绘制从 -90度（12点钟方向）开始，顺时针绘制
    // 第 i 个扇区的中心角度 = -90 + 前面所有扇区的角度和 + 当前扇区角度/2
    const totalWeight = options.reduce((sum, opt) => sum + opt.weight, 0);
    let currentAngle = -90; // 从12点钟方向开始
    
    for (let i = 0; i < options.length; i++) {
      const segmentAngle = (options[i].weight / totalWeight) * 360;
      if (i === targetIndex) {
        // 目标扇区的中心角度（加上随机偏移让结果更自然）
        const randomOffset = (Math.random() - 0.5) * segmentAngle * 0.8;
        const targetCenterAngle = currentAngle + segmentAngle / 2 + randomOffset;
        
        // 需要旋转的角度：让 targetCenterAngle 指向 270度（12点钟）
        // 转盘顺时针旋转，所以旋转量 = 270 - targetCenterAngle
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

  // 计算概率
  const getProbability = (weight: number) => {
    const total = options.reduce((sum, opt) => sum + opt.weight, 0);
    return ((weight / total) * 100).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-dropbox-gray-50">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-dropbox-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-dropbox-gray-600 hover:text-dropbox-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">返回</span>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-dropbox-blue rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-semibold text-dropbox-gray-900 text-lg">
              幸运转盘
            </span>
          </div>
          
          <button
            onClick={resetOptions}
            className="flex items-center gap-2 text-dropbox-gray-500 hover:text-dropbox-gray-900 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">重置</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Wheel Section */}
            <div className="bg-white rounded-3xl shadow-soft p-8">
              <div className="relative flex items-center justify-center">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
                  <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-dropbox-gray-900" />
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
                    width={400}
                    height={400}
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
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: PRESET_COLORS[i % PRESET_COLORS.length],
                            left: '50%',
                            top: '50%',
                          }}
                          animate={{
                            x: (Math.random() - 0.5) * 400,
                            y: (Math.random() - 0.5) * 400,
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

              {/* Spin Button */}
              <button
                onClick={spin}
                disabled={isSpinning || options.length < 2}
                className="w-full mt-8 py-4 bg-dropbox-blue text-white font-display font-semibold text-lg rounded-2xl hover:bg-dropbox-blue-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-glow-blue active:scale-[0.98] flex items-center justify-center gap-2"
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
                    className="mt-6 p-6 bg-dropbox-blue/10 rounded-2xl text-center"
                  >
                    <p className="text-sm text-dropbox-blue font-medium mb-1">🎉 恭喜！结果是</p>
                    <p className="text-3xl font-display font-bold text-dropbox-blue">
                      {winner.text}
                    </p>
                    <p className="text-xs text-dropbox-blue/60 mt-2">
                      权重: x{winner.weight} ({getProbability(winner.weight)}%)
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Options Section */}
            <div className="bg-white rounded-3xl shadow-soft p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Settings2 className="w-5 h-5 text-dropbox-gray-400" />
                  <h2 className="font-display font-semibold text-xl text-dropbox-gray-900">
                    转盘选项
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowWeightPanel(!showWeightPanel)}
                    className={`p-2 rounded-lg transition-colors ${showWeightPanel ? 'bg-dropbox-blue text-white' : 'text-dropbox-gray-400 hover:bg-dropbox-gray-100'}`}
                    title="设置权重"
                  >
                    <BarChart3 className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-dropbox-gray-400">
                    {options.length} / 12
                  </span>
                </div>
              </div>

              {/* Options List */}
              <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {options.map((option, index) => (
                    <motion.div
                      key={option.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 p-3 bg-dropbox-gray-50 rounded-xl group hover:bg-dropbox-gray-100 transition-colors"
                    >
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: option.color }}
                      />
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => updateOption(option.id, e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-dropbox-gray-900 font-medium placeholder:text-dropbox-gray-400"
                        placeholder={`选项 ${index + 1}`}
                      />
                      
                      {/* Weight Control */}
                      {showWeightPanel ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-dropbox-gray-400">权重</span>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={option.weight}
                            onChange={(e) => updateWeight(option.id, parseInt(e.target.value) || 1)}
                            className="w-12 px-2 py-1 text-center text-sm bg-white border border-dropbox-gray-200 rounded-lg focus:outline-none focus:border-dropbox-blue"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-dropbox-gray-400 px-2">
                          {getProbability(option.weight)}%
                        </span>
                      )}
                      
                      <button
                        onClick={() => removeOption(option.id)}
                        disabled={options.length <= 2}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-dropbox-gray-400 hover:text-dropbox-accent-coral hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add Button */}
              <button
                onClick={addOption}
                disabled={options.length >= 12}
                className="w-full py-3 border-2 border-dashed border-dropbox-gray-200 rounded-xl text-dropbox-gray-500 font-medium hover:border-dropbox-blue hover:text-dropbox-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                添加选项
              </button>

              {/* Tips */}
              <div className="mt-6 p-4 bg-dropbox-gray-50 rounded-xl">
                <p className="text-sm text-dropbox-gray-500">
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
