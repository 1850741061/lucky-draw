import { useState } from 'react';
import { Sparkles, Dices, ArrowRight, Github, Twitter, Heart, X, HelpCircle, RotateCcw, Users, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WheelPage from './pages/WheelPage';
import DrawPage from './pages/DrawPage';

type Page = 'home' | 'wheel' | 'draw';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showHelp, setShowHelp] = useState(false);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  if (currentPage === 'wheel') {
    return <WheelPage onBack={() => navigateTo('home')} />;
  }

  if (currentPage === 'draw') {
    return <DrawPage onBack={() => navigateTo('home')} />;
  }

  return (
    <div className="min-h-screen bg-[#030308] text-white font-sans overflow-hidden relative selection:bg-cyan-500/30 selection:text-cyan-400">
      {/* Drifting ambient background glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-mesh-blob bg-[#00f0ff] animate-float-slow opacity-[0.06] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-mesh-blob bg-[#bd00ff] animate-float-slower opacity-[0.07] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[40vw] h-[40vw] bg-mesh-blob bg-[#ff007a] animate-float opacity-[0.04] pointer-events-none" />

      {/* Navigation - 移动端优化 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070814]/75 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-tr from-dropbox-blue to-dropbox-accent-purple rounded-lg flex items-center justify-center shadow-glow-blue">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="font-display font-semibold bg-gradient-to-r from-white via-[#b4f4ff] to-white/70 bg-clip-text text-transparent text-base sm:text-lg tracking-wider">
              LUCKY DRAW
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            {/* 帮助按钮 */}
            <button 
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-1.5 text-dropbox-gray-400 hover:text-dropbox-blue transition-all duration-300 text-xs sm:text-sm active:scale-95 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-dropbox-blue/20"
            >
              <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">帮助</span>
            </button>
            
            {/* GitHub 链接 */}
            <a 
              href="https://github.com/1850741061/lucky-draw" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-dropbox-gray-400 hover:text-white transition-colors active:scale-95 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/20"
              title="GitHub 仓库"
            >
              <Github className="w-4 h-4 sm:w-5 sm:h-5 text-[#bd00ff]" />
              <span className="text-xs hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0b0c1b]/95 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl shadow-soft-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#070814]/80 backdrop-blur-md border-b border-white/5 p-4 sm:p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-dropbox-blue" />
                  <h2 className="font-display font-semibold text-lg text-white">
                    使用帮助
                  </h2>
                </div>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-dropbox-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-6">
                {/* 幸运转盘 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-dropbox-blue/15 rounded-xl flex items-center justify-center flex-shrink-0 border border-dropbox-blue/20">
                    <RotateCcw className="w-5 h-5 text-dropbox-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">🎯 幸运转盘</h3>
                    <ul className="text-sm text-dropbox-gray-400 space-y-1.5">
                      <li>• 添加任意数量的选项（2-12个）</li>
                      <li>• 点击图表图标可设置权重，权重越大中奖概率越高</li>
                      <li>• 轮盘扇区会自动根据权重比例自适应显示</li>
                      <li>• 点击"开始转盘"播放沉浸式声响旋转动画</li>
                    </ul>
                  </div>
                </div>

                {/* 随机抽签 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-dropbox-accent-purple/15 rounded-xl flex items-center justify-center flex-shrink-0 border border-dropbox-accent-purple/20">
                    <Users className="w-5 h-5 text-dropbox-accent-purple" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-2">🎲 随机抽签</h3>
                    <ul className="text-sm text-dropbox-gray-400 space-y-1.5">
                      <li>• <strong>不重复模式：</strong>每人只能被抽中一次，已被抽中的变灰</li>
                      <li>• <strong>可重复模式：</strong>每次独立抽取，可能重复抽中</li>
                      <li>• 快捷选择同时抽取 1 / 2 / 3 / 5 人</li>
                      <li>• 极具仪式感的 3D 卡片发牌与翻牌揭晓效果</li>
                    </ul>
                  </div>
                </div>

                {/* 小贴士 */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                  <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-dropbox-blue" />
                    💡 小贴士
                  </h3>
                  <ul className="text-sm text-dropbox-gray-400 space-y-1">
                    <li>• 所有数据保存在本地，刷新页面不会丢失</li>
                    <li>• 适配移动端高频振动与触碰优化，体验顺滑</li>
                    <li>• 点击"重置"可一键恢复默认候选人</li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-[#070814]/80 backdrop-blur-md border-t border-white/5 p-4 sm:p-6">
                <button 
                  onClick={() => setShowHelp(false)}
                  className="w-full py-3 bg-gradient-to-r from-dropbox-blue to-dropbox-blue-dark text-white font-medium rounded-xl hover:shadow-glow-blue transition-all duration-300 active:scale-[0.98]"
                >
                  知道了
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section - 移动端优化 */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-dropbox-blue/10 border border-dropbox-blue/20 rounded-full mb-6 sm:mb-8 animate-fade-in shadow-glow-blue">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-dropbox-blue" />
            <span className="text-xs sm:text-sm font-medium text-dropbox-blue-light">简单易用的决策工具</span>
          </div>
          
          <h1 className="font-display font-bold text-3xl sm:text-5xl lg:text-display-xl text-white mb-4 sm:mb-6 animate-fade-in-up leading-tight tracking-tight">
            让每一次选择
            <br />
            <span className="bg-gradient-to-r from-dropbox-blue via-dropbox-accent-purple to-dropbox-accent-pink bg-clip-text text-transparent filter drop-shadow-[0_0_30px_rgba(0,240,255,0.2)]">
              都充满惊喜
            </span>
          </h1>
          
          <p className="text-base sm:text-xl text-dropbox-gray-400 max-w-2xl mx-auto mb-8 sm:mb-12 px-2 sm:px-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            自定义转盘和抽签工具，帮助你快速做出决定。无论是聚会游戏、课堂提问还是日常决策，都能轻松应对。
          </p>

          {/* Feature Cards - 移动端优化 */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {/* Wheel Card */}
            <button
              onClick={() => navigateTo('wheel')}
              className="group relative bg-[#0d1021]/60 backdrop-blur-md border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-left transition-all duration-500 hover:border-dropbox-blue/40 hover:bg-[#121630]/70 hover:shadow-glow-blue-lg hover:-translate-y-1.5 active:scale-[0.98] animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 group-hover:bg-dropbox-blue group-hover:text-white transition-all duration-300">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-dropbox-blue group-hover:text-white" />
              </div>
              
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-soft mb-4 sm:mb-6 group-hover:rotate-12 group-hover:bg-dropbox-blue/10 group-hover:border-dropbox-blue/30 transition-transform duration-300">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-dropbox-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2L12 12L19 16" />
                </svg>
              </div>
              
              <h3 className="font-display font-semibold text-xl sm:text-2xl text-white mb-1.5 sm:mb-2 group-hover:text-dropbox-blue transition-colors">
                幸运转盘
              </h3>
              <p className="text-sm sm:text-base text-dropbox-gray-400 group-hover:text-white/90 transition-colors">
                自定义选项，旋转决定命运。支持等权重和差额权重，让转盘结果充满悬念。
              </p>
            </button>

            {/* Draw Card */}
            <button
              onClick={() => navigateTo('draw')}
              className="group relative bg-[#0d1021]/60 backdrop-blur-md border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-left transition-all duration-500 hover:border-dropbox-accent-purple/40 hover:bg-[#121630]/70 hover:shadow-glow-purple hover:-translate-y-1.5 active:scale-[0.98] animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 group-hover:bg-dropbox-accent-purple group-hover:text-white transition-all duration-300">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-dropbox-accent-purple group-hover:text-white" />
              </div>
              
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-soft mb-4 sm:mb-6 group-hover:rotate-12 group-hover:bg-dropbox-accent-purple/10 group-hover:border-dropbox-accent-purple/30 transition-transform duration-300">
                <Dices className="w-6 h-6 sm:w-8 sm:h-8 text-dropbox-accent-purple" />
              </div>
              
              <h3 className="font-display font-semibold text-xl sm:text-2xl text-white mb-1.5 sm:mb-2 group-hover:text-dropbox-accent-purple transition-colors">
                随机抽签
              </h3>
              <p className="text-sm sm:text-base text-dropbox-gray-400 group-hover:text-white/90 transition-colors">
                从列表中随机抽取一个或多个结果。适用于抽奖、点名、分组等多种场景。
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section - 移动端优化 */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-[#070814]/40 border-t border-b border-white/5 relative z-10 backdrop-blur-md">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-white text-center mb-10 sm:mb-16">
            为什么选择 LuckyDraw
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                icon: '✨',
                title: '简单易用',
                desc: '直观的操作界面，无需学习成本，开箱即用',
                glow: 'hover:shadow-glow-blue border-dropbox-blue/10 hover:border-dropbox-blue/30'
              },
              {
                icon: '🎨',
                title: '精美设计',
                desc: '赛博玻璃拟态 UI 设计，流畅动画配合音感声响，带来极致愉悦体验',
                glow: 'hover:shadow-glow-purple border-dropbox-accent-purple/10 hover:border-dropbox-accent-purple/30'
              },
              {
                icon: '🔒',
                title: '隐私保护',
                desc: '所有数据保存在本地，无需注册，完全免费',
                glow: 'hover:shadow-glow-pink border-dropbox-accent-pink/10 hover:border-dropbox-accent-pink/30'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className={`text-center p-5 sm:p-8 bg-[#0d1021]/50 backdrop-blur-sm border rounded-2xl transition-all duration-300 hover:-translate-y-1 ${feature.glow} animate-fade-in-up`}
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl shadow-soft flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-3 sm:mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-display font-semibold text-base sm:text-lg text-white mb-1.5 sm:mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-dropbox-gray-400">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - 移动端优化 */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-white/5 relative z-10 bg-[#030308]/60 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-tr from-dropbox-blue to-dropbox-accent-purple rounded-md flex items-center justify-center">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="font-display font-medium text-white text-sm sm:text-base">
              LuckyDraw
            </span>
          </div>
          
          <p className="text-xs sm:text-sm text-dropbox-gray-400">
            Made with <Heart className="w-3 h-3 sm:w-4 sm:h-4 inline text-dropbox-accent-pink animate-pulse-soft" /> by LuckyDraw Team
          </p>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-dropbox-gray-400 hover:text-white transition-colors"
            >
              <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-dropbox-blue" />
            </a>
            <a 
              href="https://github.com/1850741061/lucky-draw" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-dropbox-gray-400 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
