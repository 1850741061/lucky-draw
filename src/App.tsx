import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, X, HelpCircle, Github, Sun, Moon, Sparkles, Target, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WheelPage from './pages/WheelPage';
import DrawPage from './pages/DrawPage';

type Page = 'home' | 'wheel' | 'draw';

/* ═══════════════════════════════════════════════
   STARDUST PARTICLE BACKGROUND
   Slow, ethereal particles with golden connections
   ═══════════════════════════════════════════════ */
function StardustBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const count = Math.min(50, Math.floor((w * h) / 35000));
    const particles: Array<{
      x: number; y: number; vx: number; vy: number; r: number; phase: number;
    }> = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.2 + 0.4,
        phase: Math.random() * Math.PI * 2,
      });
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animId: number;
    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      const isDark = document.documentElement.classList.contains('dark');
      const dotColor = isDark ? 'rgba(212,184,150,' : 'rgba(10,10,15,';
      const lineBase = isDark ? '212,184,150' : '10,10,15';
      const cursorBase = isDark ? '212,184,150' : '201,168,108';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // Drift with subtle sine wave
        p.x += p.vx + Math.sin(time * 0.0003 + p.phase) * 0.05;
        p.y += p.vy + Math.cos(time * 0.0002 + p.phase) * 0.05;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Mouse gentle repulsion
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
          const force = (1 - dist / 200) * 0.3;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        // Draw dot with breathing opacity
        const breath = 0.5 + Math.sin(time * 0.001 + p.phase) * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `${dotColor}${(0.12 * breath).toFixed(3)})`;
        ctx.fill();

        // Draw connections
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const ddx = p.x - p2.x;
          const ddy = p.y - p2.y;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < 130) {
            const alpha = (1 - d / 130) * 0.04;
            ctx.strokeStyle = `rgba(${lineBase},${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Cursor connection
        if (mx > -1000) {
          const cdx = mx - p.x;
          const cdy = my - p.y;
          const cd = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cd < 160) {
            const alpha = (1 - cd / 160) * 0.1;
            ctx.strokeStyle = `rgba(${cursorBase},${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mx, my);
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none w-full h-full z-0"
      style={{ opacity: 0.85 }}
    />
  );
}

/* ═══════════════════════════════════════════════
   AMBIENT ORBS — Background depth layers
   ═══════════════════════════════════════════════ */
function AmbientOrbs() {
  return (
    <>
      <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full pointer-events-none z-0 opacity-[0.03] dark:opacity-[0.04]"
        style={{ background: 'radial-gradient(circle, var(--accent-gold) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'floatSlow 20s ease-in-out infinite' }} />
      <div className="fixed bottom-[-15%] right-[-5%] w-[50vw] h-[50vw] rounded-full pointer-events-none z-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{ background: 'radial-gradient(circle, var(--text-primary) 0%, transparent 70%)', filter: 'blur(100px)', animation: 'floatSlow 25s ease-in-out infinite reverse' }} />
    </>
  );
}

/* ═══════════════════════════════════════════════
   PAGE TRANSITION WRAPPER
   ═══════════════════════════════════════════════ */
function PageTransition({ children, isVisible }: { children: React.ReactNode; isVisible: boolean }) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="page"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="min-h-screen"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════ */
function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [showHelp, setShowHelp] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
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

  const navigateTo = useCallback((page: Page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Sub-pages
  if (currentPage === 'wheel') {
    return (
      <PageTransition isVisible={true}>
        <WheelPage onBack={() => navigateTo('home')} isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(v => !v)} />
      </PageTransition>
    );
  }

  if (currentPage === 'draw') {
    return (
      <PageTransition isVisible={true}>
        <DrawPage onBack={() => navigateTo('home')} isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(v => !v)} />
      </PageTransition>
    );
  }

  return (
    <PageTransition isVisible={true}>
      <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
        <StardustBackground />
        <AmbientOrbs />

        {/* ═══════ Navigation ═══════ */}
        <motion.nav
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 left-0 right-0 z-50 surface border-b"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="container-wide section-padding h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-ink)' }}>
                <Sparkles className="w-4 h-4" style={{ color: 'var(--bg-primary)' }} />
              </div>
              <span className="font-display text-sm tracking-[0.2em] uppercase" style={{ color: 'var(--text-primary)' }}>
                LuckyDraw
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDarkMode(v => !v)}
                className="btn-ghost w-9 h-9 p-0 flex items-center justify-center"
                title={isDarkMode ? '切换日间模式' : '切换夜间模式'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button onClick={() => setShowHelp(true)} className="btn-ghost hidden sm:flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>帮助</span>
              </button>

              <a
                href="https://github.com/1850741061/lucky-draw"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost hidden sm:flex items-center gap-2"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </motion.nav>

        {/* ═══════ Help Modal ═══════ */}
        <AnimatePresence>
          {showHelp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
              style={{ background: 'rgba(6,6,10,0.75)', backdropFilter: 'blur(12px)' }}
              onClick={() => setShowHelp(false)}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="card max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                  <h2 className="font-display text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-primary)' }}>
                    使用指南
                  </h2>
                  <button onClick={() => setShowHelp(false)} className="btn-ghost w-8 h-8 p-0 flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto">
                  {[
                    {
                      num: '01',
                      title: '幸运转盘',
                      icon: Target,
                      items: ['支持 2-12 个自定义选项', '权重系统控制中奖概率', '物理缓动动画 + 合成音效', '一键切换游戏预设'],
                    },
                    {
                      num: '02',
                      title: '随机抽签',
                      icon: Shuffle,
                      items: ['不重复 / 可重复 两种模式', '支持一次抽取 1-5 人', '3D 卡片翻转揭晓效果', '完整抽签历史记录'],
                    },
                  ].map((section) => (
                    <div key={section.num} className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 surface" style={{ borderColor: 'var(--border-subtle)' }}>
                        <section.icon className="w-4 h-4" style={{ color: 'var(--accent-gold)' }} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-primary)' }}>
                          {section.num} / {section.title}
                        </h3>
                        <ul className="space-y-1.5">
                          {section.items.map((item, i) => (
                            <li key={i} className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}

                  <div className="p-4 rounded-xl surface" style={{ borderColor: 'var(--border-subtle)' }}>
                    <h3 className="font-display text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--text-primary)' }}>
                      数据隐私
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                      所有数据仅存储于浏览器本地，不上传任何服务器。刷新页面后配置依然保留。
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                  <button onClick={() => setShowHelp(false)} className="btn-primary w-full">
                    知道了
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════ Hero Section ═══════ */}
        <section className="relative z-10 pt-32 sm:pt-44 pb-16 sm:pb-28 section-padding">
          <div className="container-tight text-center">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-8 surface"
              style={{ borderColor: 'var(--border-subtle)' }}
            >
              <div className="w-1.5 h-1.5 rounded-full animate-pulse-subtle" style={{ background: 'var(--accent-gold)' }} />
              <span className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: 'var(--text-tertiary)' }}>
                交互式决策工具
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-4xl sm:text-6xl lg:text-display-2xl font-bold mb-6 leading-[1.1] tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              <span className="block">让每一次选择</span>
              <span className="block text-gradient-gold mt-1">都充满仪式感</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-sm sm:text-base max-w-xl mx-auto mb-16 leading-relaxed"
              style={{ color: 'var(--text-tertiary)' }}
            >
              自定义幸运转盘与随机抽签工具。<br className="hidden sm:block" />
              以极致简约的设计语言，还原决策应有的庄重与趣味。
            </motion.p>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto text-left">
              {[
                {
                  icon: Target,
                  num: '01',
                  title: '幸运转盘',
                  subtitle: 'Lucky Wheel',
                  desc: '物理级缓动动画，合成音效反馈，支持权重调节与游戏预设一键载入。',
                  page: 'wheel' as Page,
                  delay: 0.3,
                },
                {
                  icon: Shuffle,
                  num: '02',
                  title: '随机抽签',
                  subtitle: 'Random Draw',
                  desc: '3D 卡片翻转揭晓，不重复与可重复模式，营造悬念十足的抽取仪式。',
                  page: 'draw' as Page,
                  delay: 0.4,
                },
              ].map((card) => (
                <motion.button
                  key={card.num}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: card.delay, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4, transition: { duration: 0.3 } }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo(card.page)}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
                    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
                  }}
                  className="group relative card surface-hover p-7 sm:p-10 text-left overflow-hidden"
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--glow-color), transparent 40%)' }} />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-8">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center surface"
                        style={{ borderColor: 'var(--border-subtle)' }}>
                        <card.icon className="w-5 h-5" style={{ color: 'var(--accent-gold)' }} />
                      </div>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center surface group-hover:scale-110 transition-transform duration-300"
                        style={{ borderColor: 'var(--border-subtle)' }}>
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" style={{ color: 'var(--text-primary)' }} />
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="font-mono text-[10px] uppercase tracking-widest block mb-1" style={{ color: 'var(--text-muted)' }}>
                        {card.num}
                      </span>
                      <h3 className="font-display text-xl sm:text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        {card.title}
                      </h3>
                      <span className="text-[10px] uppercase tracking-[0.15em] font-mono" style={{ color: 'var(--text-muted)' }}>
                        {card.subtitle}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                      {card.desc}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ Divider ═══════ */}
        <div className="relative z-10 divider-elegant max-w-3xl mx-auto" />

        {/* ═══════ Features Section ═══════ */}
        <section className="relative z-10 py-20 sm:py-32 section-padding">
          <div className="container-tight">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-center text-lg sm:text-xl font-medium mb-16 sm:mb-20 tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              <span className="text-gradient-gold">核心优势</span>
            </motion.h2>

            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { num: '01', title: '纯粹交互', desc: '每一个按钮、每一次滑动都有精心调校的触觉与视觉反馈，拒绝粗糙。' },
                { num: '02', title: '艺术美感', desc: '曜石黑与暖金的配色体系，玻璃拟态材质，营造沉浸式的使用体验。' },
                { num: '03', title: '完全本地', desc: '数据仅存于设备本地，零网络请求，即时响应，隐私绝对安全。' },
              ].map((feat, i) => (
                <motion.div
                  key={feat.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="card p-6 sm:p-8 surface-hover"
                >
                  <span className="font-mono text-xs" style={{ color: 'var(--accent-gold)' }}>
                    {feat.num}
                  </span>
                  <h3 className="font-display text-sm font-semibold mt-3 mb-2 tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    {feat.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
                    {feat.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════ Footer ═══════ */}
        <footer className="relative z-10 border-t py-10 sm:py-14 section-padding" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="container-tight flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: 'var(--accent-ink)' }}>
                <Sparkles className="w-3 h-3" style={{ color: 'var(--bg-primary)' }} />
              </div>
              <span className="font-display text-xs tracking-[0.15em] uppercase" style={{ color: 'var(--text-secondary)' }}>
                LuckyDraw
              </span>
            </div>

            <p className="text-[10px] uppercase tracking-[0.15em]" style={{ color: 'var(--text-muted)' }}>
              精心打造 · 免费开源
            </p>

            <div className="flex items-center gap-5">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="text-[10px] uppercase tracking-widest transition-colors hover:opacity-70"
                style={{ color: 'var(--text-muted)' }}>
                Twitter
              </a>
              <a href="https://github.com/1850741061/lucky-draw" target="_blank" rel="noopener noreferrer"
                className="text-[10px] uppercase tracking-widest transition-colors hover:opacity-70"
                style={{ color: 'var(--text-muted)' }}>
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}

export default App;
