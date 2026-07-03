import { 
  faArrowRight,
  faShield,
  faTrophy,
  faChevronDown,
  faShoppingBag,
  faUsers,
  faBriefcase,
  faLock
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from '../ui/button';
import { useInView } from 'react-intersection-observer';

interface HeroSectionProps {
  isLoggedIn: boolean;
  onGetStarted: () => void;
  onGoToDashboard: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export function HeroSection({ 
  isLoggedIn, 
  onGetStarted, 
  onGoToDashboard, 
  onScrollToSection 
}: HeroSectionProps) {
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.1, triggerOnce: true });

  return (
    <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-32">
      {/* Content Container */}
      <div className={`relative z-20 container mx-auto px-6 text-center transition-all duration-1000 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* Sleek Floating Badge */}
        <div className="relative mb-8 inline-flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 backdrop-blur-md">
            <FontAwesomeIcon icon={faShield} className="w-4 h-4 text-cyan-600 dark:text-cyan-400 transition-colors" />
            <span className="text-cyan-700 dark:text-cyan-300 text-sm font-medium tracking-wide transition-colors">TRUSTED TRADING PLATFORM</span>
          </div>
        </div>



        {/* Refined Main Title */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400">
            TRADE SAFE
          </h1>
        </div>

        {/* Clean Subtitle */}
        <div className="mb-12">
          <p className="text-lg md:text-xl lg:text-2xl text-slate-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed transition-colors">
            The ultimate social marketplace for Roblox items. <br className="hidden md:block" />
            Showcase your collection, trade safely with trusted middlemen, <br className="hidden md:block" />
            and join a thriving community of collectors.
          </p>
        </div>

        {/* Premium CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24">
          {!isLoggedIn ? (
            <Button
              onClick={onGetStarted}
              size="lg"
              className="relative overflow-hidden group bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-8 py-6 text-lg font-bold rounded-xl shadow-[0_0_40px_rgba(6,182,212,0.3)] transition-all"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full" />
              <FontAwesomeIcon icon={faShoppingBag} className="mr-3 h-5 w-5 text-slate-900" />
              JOIN COMMUNITY
            </Button>
          ) : (
            <Button
              onClick={onGoToDashboard}
              size="lg"
              className="relative overflow-hidden group bg-violet-500 hover:bg-violet-400 text-white px-8 py-6 text-lg font-bold rounded-xl shadow-[0_0_40px_rgba(139,92,246,0.3)] transition-all"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 group-hover:translate-x-full transition-transform duration-500 ease-out -skew-x-12 -translate-x-full" />
              <FontAwesomeIcon icon={faTrophy} className="mr-3 h-5 w-5 text-white" />
              GO TO DASHBOARD
              <FontAwesomeIcon icon={faArrowRight} className="ml-3 h-5 w-5 text-white group-hover:translate-x-1 transition-transform" />
            </Button>
          )}
        </div>

        {/* Sleek Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { value: "50K+", label: "MEMBERS", icon: faUsers, color: "text-cyan-600 dark:text-cyan-400" },
            { value: "100K+", label: "TRADES", icon: faBriefcase, color: "text-violet-600 dark:text-violet-400" },
            { value: "24/7", label: "SUPPORT", icon: faLock, color: "text-fuchsia-600 dark:text-fuchsia-400" }
          ].map((stat, index) => (
            <div key={index} className="relative group bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-8 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300">
              <div className="text-3xl mb-4">
                <FontAwesomeIcon icon={stat.icon} className={`${stat.color} transition-colors`} />
              </div>
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight transition-colors">
                {stat.value}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium tracking-widest uppercase transition-colors">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Minimal Scroll Indicator */}
        <div className="mt-24">
          <button
            onClick={() => onScrollToSection('features')}
            className="text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors flex flex-col items-center mx-auto gap-2"
          >
            <span className="text-xs tracking-widest font-medium uppercase">Explore</span>
            <FontAwesomeIcon icon={faChevronDown} className="w-5 h-5 animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
}