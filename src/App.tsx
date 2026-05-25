import { useState, useEffect, useRef } from 'react';
import { ArrowRight, X, HelpCircle, Github, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WheelPage from './pages/WheelPage';
import DrawPage from './pages/DrawPage';

type Page = 'home' | 'wheel' | 'draw';

// Lusion-inspired Interactive Canvas Particle Network (Self-adapts colors dynamically)
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    const particleCount = Math.min(65, Math.floor((width * height) / 25000));
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        radius: Math.random() * 1.5 + 0.5,
      });
    }

    const mouse = { x: -9999, y: -9999, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.active = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseLeave);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Dynamically read theme state from document body/documentElement
      const isDark = document.documentElement.classList.contains('dark');
      
      // Adapt styling configuration based on active theme
      const dotColor = isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.12)';
      const lineAlpha = isDark ? 0.05 : 0.045;
      const cursorLineAlpha = isDark ? 0.14 : 0.09;
      const rgbBase = isDark ? '255, 255, 255' : '0, 0, 0';

      ctx.fillStyle = dotColor;
      ctx.lineWidth = 0.6;

      // Update & render particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Normal drift
        p.x += p.vx;
        p.y += p.vy;

        // Boundary rebound
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Magnetic attraction toward mouse
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            p.x += (dx / dist) * 0.35;
            p.y += (dy / dist) * 0.35;
          }
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
        ctx.fill();

        // Draw connecting spider mesh
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.strokeStyle = `rgba(${rgbBase}, ${lineAlpha * (1 - dist / 100)})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Draw cursor connection web
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.strokeStyle = `rgba(${rgbBase}, ${cursorLineAlpha * (1 - dist / 140)})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none w-full h-full z-0 opacity-80"
    />
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showHelp, setShowHelp] = useState(false);

  // Synchronized Theme state with local persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    // Fallback to system preferred brightness
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  if (currentPage === 'wheel') {
    return <WheelPage onBack={() => navigateTo('home')} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
  }

  if (currentPage === 'draw') {
    return <DrawPage onBack={() => navigateTo('home')} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />;
  }

  return (
    <div className="min-h-screen bg-dropbox-gray-50 text-dropbox-gray-900 font-sans overflow-hidden relative selection:bg-white/20 transition-colors duration-500">
      {/* Background Interactive Particle Network */}
      <ParticleBackground />

      {/* Navigation - Minimalist Wireframe Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dropbox-gray-50/70 backdrop-blur-xl border-b border-dropbox-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <span className="font-display font-light text-dropbox-gray-900 text-base sm:text-lg tracking-[0.25em] uppercase">
              LUCKY DRAW
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded border border-dropbox-gray-100 bg-white/5 text-dropbox-gray-400 hover:text-dropbox-gray-900 transition-all duration-300 active:scale-95 flex items-center justify-center"
              title={isDarkMode ? "切换为白画廊模式" : "切换为曜石黑模式"}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-white" /> : <Moon className="w-4 h-4 text-black" />}
            </button>

            {/* 帮助按钮 */}
            <button 
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-1.5 text-dropbox-gray-400 hover:text-dropbox-gray-900 transition-colors duration-300 text-xs uppercase tracking-widest active:scale-95 px-3 py-1.5 rounded bg-white/5 border border-dropbox-gray-100 hover:border-dropbox-gray-200"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">帮助</span>
            </button>
            
            {/* GitHub 链接 */}
            <a 
              href="https://github.com/1850741061/lucky-draw" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-dropbox-gray-400 hover:text-dropbox-gray-900 transition-colors duration-300 active:scale-95 px-3 py-1.5 rounded bg-white/5 border border-dropbox-gray-100 hover:border-dropbox-gray-200"
              title="GitHub"
            >
              <Github className="w-4 h-4" />
              <span className="text-xs uppercase tracking-widest hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Help Modal - Minimal luxury catalog window */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 dark:bg-black/85 backdrop-blur-md"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-dropbox-gray-50 border border-dropbox-gray-100 rounded-xl shadow-soft-xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-dropbox-gray-50 border-b border-dropbox-gray-100 p-4 sm:p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-light text-md uppercase tracking-[0.18em] text-dropbox-gray-900">
                    使用帮助 // HELP
                  </h2>
                </div>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="w-8 h-8 flex items-center justify-center rounded border border-dropbox-gray-100 hover:border-dropbox-gray-200 hover:bg-white/5 transition-all text-dropbox-gray-400 hover:text-dropbox-gray-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 space-y-6">
                {/* 幸运转盘 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white/5 border border-dropbox-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-display text-dropbox-gray-900 font-light">01</span>
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-xs tracking-wider uppercase text-dropbox-gray-900 mb-2">🎯 LUCKY WHEEL // 幸运转盘</h3>
                    <ul className="text-xs text-dropbox-gray-400 space-y-1.5 leading-relaxed">
                      <li>• 支持添加任意数量自定义选项（2-12个）</li>
                      <li>• 点击控制面板图表可展开权重调节，数值大中奖几率高</li>
                      <li>• 原版精简预设（自定义及游戏转盘）一键载入</li>
                      <li>• 精密物理缓动框架配合真实木齿拨片声音表现</li>
                    </ul>
                  </div>
                </div>

                {/* 随机抽签 */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-white/5 border border-dropbox-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-display text-dropbox-gray-900 font-light">02</span>
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-xs tracking-wider uppercase text-dropbox-gray-900 mb-2">🎲 RANDOM LOT // 随机抽签</h3>
                    <ul className="text-xs text-dropbox-gray-400 space-y-1.5 leading-relaxed">
                      <li>• <strong>不重复：</strong>剔除已抽取人员，避免多重中奖</li>
                      <li>• <strong>可重复：</strong>保留全局概率，支持二次抽中</li>
                      <li>• 快捷发牌数：1 / 2 / 3 / 5 人选项</li>
                      <li>• 曜石黑银卡片三维空间翻转（3D Rotate Y）仪式展现</li>
                    </ul>
                  </div>
                </div>

                {/* 小贴士 */}
                <div className="bg-white/5 border border-dropbox-gray-100 rounded p-4">
                  <h3 className="font-display font-medium text-xs tracking-wider uppercase text-dropbox-gray-900 mb-2 flex items-center gap-2">
                    💡 TIPS // 小贴士
                  </h3>
                  <ul className="text-xs text-dropbox-gray-400 space-y-1 leading-relaxed">
                    <li>• 所有数据完全依托 localStorage，永不上传，刷新不丢</li>
                    <li>• 适配移动设备的高频动能触觉，支持高响应的音响阻尼</li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-dropbox-gray-50 border-t border-dropbox-gray-100 p-4 sm:p-6">
                <button 
                  onClick={() => setShowHelp(false)}
                  className="w-full py-3 bg-dropbox-blue text-dropbox-black font-semibold rounded uppercase tracking-wider text-xs hover:opacity-90 transition-all duration-300"
                >
                  确认知道了 // CLOSE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-36 pb-12 sm:pb-24 px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-dropbox-gray-100 rounded mb-8 animate-fade-in">
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium text-dropbox-gray-400">LUSION CREATIVE STUDIO INTERACTIVE DECISION</span>
          </div>
          
          <h1 className="font-display font-extralight text-3xl sm:text-5xl lg:text-display-xl text-dropbox-gray-900 mb-6 sm:mb-8 animate-fade-in-up leading-tight tracking-[0.18em] uppercase">
            让每一次选择
            <br />
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-dropbox-gray-900 via-dropbox-gray-400 to-dropbox-gray-900/70 dark:from-white dark:via-neutral-300 dark:to-white/70">
              都充满仪式感
            </span>
          </h1>
          
          <p className="text-xs sm:text-sm uppercase tracking-[0.15em] text-dropbox-gray-400 max-w-2xl mx-auto mb-10 sm:mb-16 px-2 sm:px-0 animate-fade-in-up leading-relaxed font-light" style={{ animationDelay: '0.1s' }}>
            自定义轮盘与卡片抽签工具。舍弃杂乱，回归最纯粹的黑白色彩与动效表达。
          </p>

          {/* Feature Grid - lusion.co wireframe style */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
            {/* Wheel Card */}
            <button
              onClick={() => navigateTo('wheel')}
              className="group relative bg-[#060606]/5 dark:bg-[#060606]/65 border border-dropbox-gray-100 hover:border-dropbox-gray-200 rounded-xl p-6 sm:p-10 transition-all duration-500 hover:bg-[#0c0c0c]/5 dark:hover:bg-[#0c0c0c]/85 active:scale-[0.99] animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="absolute top-6 right-6 w-9 h-9 border border-dropbox-gray-100 rounded-full flex items-center justify-center group-hover:bg-dropbox-blue group-hover:text-dropbox-black group-hover:border-dropbox-blue transition-all duration-300">
                <ArrowRight className="w-4 h-4 text-dropbox-gray-900 group-hover:text-dropbox-black" />
              </div>
              
              <div className="w-10 h-10 border border-dropbox-gray-100 rounded flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                <span className="text-xs font-display text-dropbox-gray-900">01</span>
              </div>
              
              <h3 className="font-display font-light text-lg sm:text-xl text-dropbox-gray-900 mb-2 uppercase tracking-[0.18em]">
                LUCKY WHEEL // 幸运转盘
              </h3>
              <p className="text-xs text-dropbox-gray-400 leading-relaxed font-light">
                水晶极简分段扇区，配置专属数值比例。每一次启动都将配合清脆拨片声及 major 9th 琶音中奖和弦。
              </p>
            </button>

            {/* Draw Card */}
            <button
              onClick={() => navigateTo('draw')}
              className="group relative bg-[#060606]/5 dark:bg-[#060606]/65 border border-dropbox-gray-100 hover:border-dropbox-gray-200 rounded-xl p-6 sm:p-10 transition-all duration-500 hover:bg-[#0c0c0c]/5 dark:hover:bg-[#0c0c0c]/85 active:scale-[0.99] animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="absolute top-6 right-6 w-9 h-9 border border-dropbox-gray-100 rounded-full flex items-center justify-center group-hover:bg-dropbox-blue group-hover:text-dropbox-black group-hover:border-dropbox-blue transition-all duration-300">
                <ArrowRight className="w-4 h-4 text-dropbox-gray-900 group-hover:text-dropbox-black" />
              </div>
              
              <div className="w-10 h-10 border border-dropbox-gray-100 rounded flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-300">
                <span className="text-xs font-display text-dropbox-gray-900">02</span>
              </div>
              
              <h3 className="font-display font-light text-lg sm:text-xl text-dropbox-gray-900 mb-2 uppercase tracking-[0.18em]">
                RANDOM LOT // 随机抽签
              </h3>
              <p className="text-xs text-dropbox-gray-400 leading-relaxed font-light">
                极具写照感的卡片反转揭晓。支持同时切出多张卡片，通过 Y 轴 180 度翻动打造高悬念的决策过程。
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 bg-[#040404]/5 dark:bg-[#040404]/50 border-t border-b border-dropbox-gray-100 relative z-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-light text-xl sm:text-2xl text-dropbox-gray-900 text-center mb-12 sm:mb-20 uppercase tracking-[0.25em]">
            // THE ADVANTAGE // 我们的核心优势
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: '01',
                title: '纯粹交互',
                desc: '鼠标划过激起微粒浮动，每一次点击与滑越皆有原生音效的高速合成回馈'
              },
              {
                icon: '02',
                title: '艺术美感',
                desc: '抛弃杂乱霓虹，使用钛金黑、白银一像素线框与高纯文字，成就画卷级交互设计'
              },
              {
                icon: '03',
                title: '完全本地',
                desc: '无联网权限，数据永久缓存于用户的本机内存，安全私密，配置瞬时加载'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="text-left p-6 sm:p-8 bg-[#060606]/5 dark:bg-[#060606]/35 border border-dropbox-gray-100 hover:border-dropbox-gray-200 rounded transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="w-9 h-9 border border-dropbox-gray-100 rounded flex items-center justify-center text-xs text-dropbox-gray-900 font-mono mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-display font-light text-sm text-dropbox-gray-900 mb-2 uppercase tracking-widest">
                  {feature.title}
                </h3>
                <p className="text-xs text-dropbox-gray-400 leading-relaxed font-light">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-16 px-4 sm:px-6 border-t border-dropbox-gray-100 relative z-10 bg-dropbox-gray-50/60 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-light text-dropbox-gray-900 text-sm tracking-[0.2em] uppercase">
              LUCKYDRAW STUDIO
            </span>
          </div>
          
          <p className="text-[10px] uppercase tracking-widest text-dropbox-gray-300">
            AESTHETIC PORTFOLIO BY LUCKYDRAW TEAM
          </p>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-dropbox-gray-400 hover:text-dropbox-gray-900 transition-colors text-xs uppercase tracking-widest"
            >
              Twitter
            </a>
            <a 
              href="https://github.com/1850741061/lucky-draw" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-dropbox-gray-400 hover:text-dropbox-gray-900 transition-colors text-xs uppercase tracking-widest"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
