import { useState, useCallback } from 'react';
import { ArrowLeft, Plus, Trash2, Play, RotateCcw, Sparkles, Users, Trophy, Settings2, Dices, Repeat, Ban } from 'lucide-react';
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

        // 移动端振动反馈
        if (navigator.vibrate) {
          navigator.vibrate([50, 100, 50]);
        }
      }
    }, 100);
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
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-dropbox-accent-purple rounded-lg flex items-center justify-center">
              <Dices className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="font-display font-semibold text-dropbox-gray-900 text-base sm:text-lg">
              随机抽签
            </span>
          </div>
          
          <button
            onClick={resetItems}
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
          <div className="grid lg:grid-cols-5 gap-4 sm:gap-8">
            {/* Left Panel - Items */}
            <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl shadow-soft p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-dropbox-gray-400" />
                  <h2 className="font-display font-semibold text-base sm:text-lg text-dropbox-gray-900">
                    候选列表
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {drawMode === 'unique' && drawnItems.size > 0 && (
                    <button
                      onClick={resetDrawnItems}
                      className="text-xs px-2 py-1 bg-dropbox-gray-100 text-dropbox-gray-500 rounded-lg hover:bg-dropbox-gray-200 transition-colors active:scale-95"
                    >
                      重置已抽
                    </button>
                  )}
                  <span className="text-xs sm:text-sm text-dropbox-gray-400">
                    {drawMode === 'unique' ? `${availableCount}/${items.length}` : items.length} 项
                  </span>
                </div>
              </div>

              {/* Items List - 移动端优化 */}
              <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 max-h-[240px] sm:max-h-[320px] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => {
                    const isDrawn = drawnItems.has(item.id);
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: isDrawn ? 0.4 : 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-colors ${
                          isDrawn 
                            ? 'bg-dropbox-gray-100' 
                            : 'bg-dropbox-gray-50 hover:bg-dropbox-gray-100'
                        }`}
                      >
                        <span className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-medium rounded-lg ${
                          isDrawn 
                            ? 'bg-dropbox-gray-200 text-dropbox-gray-400' 
                            : 'bg-white text-dropbox-gray-400'
                        }`}>
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => updateItem(item.id, e.target.value)}
                          disabled={isDrawn}
                          className="flex-1 bg-transparent border-none outline-none text-dropbox-gray-900 font-medium placeholder:text-dropbox-gray-400 text-sm min-w-0 disabled:text-dropbox-gray-400"
                          placeholder={`项目 ${index + 1}`}
                        />
                        {isDrawn && (
                          <span className="text-xs text-dropbox-gray-400 px-1">已抽</span>
                        )}
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={items.length <= 2}
                          className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg text-dropbox-gray-400 hover:text-dropbox-accent-coral hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors active:scale-95"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Add Button */}
              <button
                onClick={addItem}
                className="w-full py-2 sm:py-2.5 border-2 border-dashed border-dropbox-gray-200 rounded-lg sm:rounded-xl text-dropbox-gray-500 text-xs sm:text-sm font-medium hover:border-dropbox-accent-purple hover:text-dropbox-accent-purple transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                添加项目
              </button>
            </div>

            {/* Center Panel - Draw */}
            <div className="lg:col-span-3 space-y-4 sm:space-y-6">
              {/* Draw Settings */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-soft p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <Settings2 className="w-4 h-4 sm:w-5 sm:h-5 text-dropbox-gray-400" />
                  <h2 className="font-display font-semibold text-base sm:text-lg text-dropbox-gray-900">
                    抽签设置
                  </h2>
                </div>

                {/* Draw Mode Selection - 移动端垂直堆叠 */}
                <div className="mb-4 sm:mb-6">
                  <span className="text-xs sm:text-sm text-dropbox-gray-500 block mb-2 sm:mb-3">抽取模式：</span>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      onClick={() => setDrawMode('unique')}
                      className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
                        drawMode === 'unique'
                          ? 'border-dropbox-accent-purple bg-dropbox-accent-purple/5'
                          : 'border-dropbox-gray-100 hover:border-dropbox-gray-200'
                      }`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center ${
                        drawMode === 'unique' ? 'bg-dropbox-accent-purple text-white' : 'bg-dropbox-gray-100 text-dropbox-gray-500'
                      }`}>
                        <Ban className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className={`font-medium text-sm ${drawMode === 'unique' ? 'text-dropbox-gray-900' : 'text-dropbox-gray-600'}`}>
                          不重复
                        </p>
                        <p className="text-[10px] sm:text-xs text-dropbox-gray-400 truncate">不会重复抽中</p>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setDrawMode('repeatable')}
                      className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 transition-all active:scale-[0.98] ${
                        drawMode === 'repeatable'
                          ? 'border-dropbox-accent-purple bg-dropbox-accent-purple/5'
                          : 'border-dropbox-gray-100 hover:border-dropbox-gray-200'
                      }`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center ${
                        drawMode === 'repeatable' ? 'bg-dropbox-accent-purple text-white' : 'bg-dropbox-gray-100 text-dropbox-gray-500'
                      }`}>
                        <Repeat className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className={`font-medium text-sm ${drawMode === 'repeatable' ? 'text-dropbox-gray-900' : 'text-dropbox-gray-600'}`}>
                          可重复
                        </p>
                        <p className="text-[10px] sm:text-xs text-dropbox-gray-400 truncate">可重复抽中</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Draw Count & Button */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="text-xs sm:text-sm text-dropbox-gray-500 whitespace-nowrap">抽取数量：</span>
                    <div className="flex items-center bg-dropbox-gray-50 rounded-xl p-1">
                      {[1, 2, 3, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => setDrawCount(num)}
                          disabled={num > availableCount && drawMode === 'unique'}
                          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all disabled:opacity-30 active:scale-95 ${
                            drawCount === num
                              ? 'bg-white text-dropbox-accent-purple shadow-soft'
                              : 'text-dropbox-gray-500 hover:text-dropbox-gray-700'
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
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-dropbox-accent-purple text-white font-display font-semibold rounded-xl hover:bg-dropbox-accent-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-soft-lg active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                    {isDrawing ? '抽签中...' : '开始抽签'}
                  </button>
                </div>

                {!canDraw && drawMode === 'unique' && (
                  <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-dropbox-accent-coral">
                    ⚠️ 剩余可抽取人数不足 {drawCount} 人
                  </p>
                )}
              </div>

              {/* Current Result */}
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-soft p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-dropbox-gray-400" />
                    <h2 className="font-display font-semibold text-base sm:text-lg text-dropbox-gray-900">
                      抽签结果
                    </h2>
                  </div>
                  {results.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-xs sm:text-sm text-dropbox-gray-400 hover:text-dropbox-accent-coral transition-colors"
                    >
                      清空
                    </button>
                  )}
                </div>

                {/* Animation Display */}
                <div className="min-h-[100px] sm:min-h-[120px] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {isDrawing && animationIndex >= 0 ? (
                      <motion.div
                        key="animating"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.1, opacity: 0 }}
                        className="text-center"
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 sm:mb-4 bg-dropbox-accent-purple/10 rounded-xl sm:rounded-2xl flex items-center justify-center">
                          <span className="text-2xl sm:text-3xl font-display font-bold text-dropbox-accent-purple">
                            {drawMode === 'unique' 
                              ? items.filter(item => !drawnItems.has(item.id))[animationIndex]?.text.slice(0, 2)
                              : items[animationIndex]?.text.slice(0, 2)
                            }
                          </span>
                        </div>
                        <p className="text-sm text-dropbox-gray-500">正在抽取...</p>
                      </motion.div>
                    ) : currentDraw.length > 0 ? (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full"
                      >
                        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                          {currentDraw.map((item, index) => (
                            <motion.div
                              key={`${item.id}-${index}`}
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: index * 0.1, type: 'spring' }}
                              className="relative"
                            >
                              <div className="px-4 sm:px-6 py-2.5 sm:py-4 bg-gradient-to-br from-dropbox-accent-purple to-dropbox-accent-pink rounded-xl sm:rounded-2xl shadow-soft">
                                <span className="text-base sm:text-xl font-display font-bold text-white">
                                  {item.text}
                                </span>
                              </div>
                              {index === 0 && (
                                <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-800" />
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                        <p className="text-center text-sm text-dropbox-gray-500 mt-3 sm:mt-4">
                          🎉 恭喜以上 {currentDraw.length} 位！
                          {drawMode === 'repeatable' && (
                            <span className="block text-[10px] sm:text-xs mt-1">（可重复模式）</span>
                          )}
                        </p>
                      </motion.div>
                    ) : (
                      <div className="text-center text-dropbox-gray-400">
                        <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-30" />
                        <p className="text-sm">点击"开始抽签"抽取结果</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* History */}
              {results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl sm:rounded-3xl shadow-soft p-4 sm:p-6"
                >
                  <h3 className="font-display font-semibold text-xs sm:text-sm text-dropbox-gray-500 uppercase tracking-wider mb-3 sm:mb-4">
                    历史记录
                  </h3>
                  <div className="space-y-2 sm:space-y-3 max-h-[160px] sm:max-h-[200px] overflow-y-auto">
                    {results.slice(0, 5).map((result, index) => (
                      <div
                        key={result.timestamp}
                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-dropbox-gray-50 rounded-lg sm:rounded-xl"
                      >
                        <span className="text-[10px] sm:text-xs text-dropbox-gray-400 font-mono">
                          #{results.length - index}
                        </span>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {result.items.map((item, itemIndex) => (
                            <span
                              key={`${item.id}-${itemIndex}`}
                              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white rounded-md sm:rounded-lg text-xs sm:text-sm text-dropbox-gray-700 font-medium"
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
