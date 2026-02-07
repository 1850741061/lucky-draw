import { useState } from 'react';
import { Sparkles, Dices, ArrowRight, Github, Twitter, Heart } from 'lucide-react';
import WheelPage from './pages/WheelPage';
import DrawPage from './pages/DrawPage';

type Page = 'home' | 'wheel' | 'draw';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

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
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation - 移动端优化 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-dropbox-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-dropbox-blue rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="font-display font-semibold text-dropbox-gray-900 text-base sm:text-lg">
              LuckyDraw
            </span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <a href="#" className="text-dropbox-gray-500 hover:text-dropbox-gray-900 transition-colors text-xs sm:text-sm">
              帮助
            </a>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-dropbox-gray-500 hover:text-dropbox-gray-900 transition-colors"
            >
              <Github className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section - 移动端优化 */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-dropbox-blue/10 rounded-full mb-6 sm:mb-8 animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-dropbox-blue" />
            <span className="text-xs sm:text-sm font-medium text-dropbox-blue">简单易用的决策工具</span>
          </div>
          
          <h1 className="font-display font-bold text-3xl sm:text-5xl lg:text-display-xl text-dropbox-gray-900 mb-4 sm:mb-6 animate-fade-in-up">
            让每一次选择
            <br />
            <span className="text-dropbox-blue">都充满惊喜</span>
          </h1>
          
          <p className="text-base sm:text-xl text-dropbox-gray-500 max-w-2xl mx-auto mb-8 sm:mb-12 px-2 sm:px-0 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            自定义转盘和抽签工具，帮助你快速做出决定。无论是聚会游戏、课堂提问还是日常决策，都能轻松应对。
          </p>

          {/* Feature Cards - 移动端优化 */}
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {/* Wheel Card */}
            <button
              onClick={() => navigateTo('wheel')}
              className="group relative bg-dropbox-gray-50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-left transition-all duration-300 hover:bg-dropbox-blue hover:shadow-glow-blue-lg hover:-translate-y-1 active:scale-[0.98] animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-dropbox-blue" />
              </div>
              
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-soft mb-4 sm:mb-6 group-hover:rotate-12 transition-transform duration-300">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-dropbox-blue" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2L12 12L19 16" />
                </svg>
              </div>
              
              <h3 className="font-display font-semibold text-xl sm:text-2xl text-dropbox-gray-900 mb-1.5 sm:mb-2 group-hover:text-white transition-colors">
                幸运转盘
              </h3>
              <p className="text-sm sm:text-base text-dropbox-gray-500 group-hover:text-white/80 transition-colors">
                自定义选项，旋转决定命运。支持添加任意数量的选项，让选择变得有趣。
              </p>
            </button>

            {/* Draw Card */}
            <button
              onClick={() => navigateTo('draw')}
              className="group relative bg-dropbox-gray-50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-left transition-all duration-300 hover:bg-dropbox-accent-purple hover:shadow-soft-xl hover:-translate-y-1 active:scale-[0.98] animate-fade-in-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-soft group-hover:scale-110 transition-transform duration-300">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-dropbox-accent-purple" />
              </div>
              
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-soft mb-4 sm:mb-6 group-hover:rotate-12 transition-transform duration-300">
                <Dices className="w-6 h-6 sm:w-8 sm:h-8 text-dropbox-accent-purple" />
              </div>
              
              <h3 className="font-display font-semibold text-xl sm:text-2xl text-dropbox-gray-900 mb-1.5 sm:mb-2 group-hover:text-white transition-colors">
                随机抽签
              </h3>
              <p className="text-sm sm:text-base text-dropbox-gray-500 group-hover:text-white/80 transition-colors">
                从列表中随机抽取一个或多个结果。适用于抽奖、点名、分组等场景。
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* Features Section - 移动端优化 */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-dropbox-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-dropbox-gray-900 text-center mb-10 sm:mb-16">
            为什么选择 LuckyDraw
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8">
            {[
              {
                icon: '✨',
                title: '简单易用',
                desc: '直观的操作界面，无需学习成本，开箱即用'
              },
              {
                icon: '🎨',
                title: '精美设计',
                desc: '现代化的 UI 设计，流畅的动画效果，带来愉悦体验'
              },
              {
                icon: '🔒',
                title: '隐私保护',
                desc: '所有数据保存在本地，无需注册，完全免费'
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="text-center p-4 sm:p-6 animate-fade-in-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-xl sm:rounded-2xl shadow-soft flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-3 sm:mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-display font-semibold text-base sm:text-lg text-dropbox-gray-900 mb-1.5 sm:mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-dropbox-gray-500">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - 移动端优化 */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-dropbox-gray-100">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-dropbox-blue rounded-md flex items-center justify-center">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="font-display font-medium text-dropbox-gray-900 text-sm sm:text-base">
              LuckyDraw
            </span>
          </div>
          
          <p className="text-xs sm:text-sm text-dropbox-gray-400">
            Made with <Heart className="w-3 h-3 sm:w-4 sm:h-4 inline text-dropbox-accent-pink" /> by LuckyDraw Team
          </p>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="#" className="text-dropbox-gray-400 hover:text-dropbox-gray-600 transition-colors">
              <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <a href="#" className="text-dropbox-gray-400 hover:text-dropbox-gray-600 transition-colors">
              <Github className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
