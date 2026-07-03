import { useApp } from '../App';
import { useAuth } from '../App';
import { HeroSection } from './landing/HeroSection';
import { FeaturesSection } from './landing/FeaturesSection';
import { CTASection } from './landing/CTASection';

export function LandingPage() {
  const { setCurrentPage } = useApp();
  const { isLoggedIn } = useAuth();

  const handleGetStarted = () => {
    setCurrentPage('auth');
  };

  const handleGoToDashboard = () => {
    setCurrentPage('dashboard');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-slate-200 transition-colors duration-500">
      {/* Premium Dark Gradient Background & Original Image */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/landingpage.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed'
          }}
        ></div>
        {/* Responsive overlay to ensure text readability with glassmorphism */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm dark:bg-black/60 dark:backdrop-blur-none transition-all duration-500 z-0" />
        
        {/* Subtle mesh/glow effects on top of the image overlay */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[128px] pointer-events-none"></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <HeroSection 
          isLoggedIn={isLoggedIn}
          onGetStarted={handleGetStarted}
          onGoToDashboard={handleGoToDashboard}
          onScrollToSection={scrollToSection}
        />

        {/* Features Section */}
        <FeaturesSection />

        {/* Final CTA Section */}
        <CTASection 
          isLoggedIn={isLoggedIn}
          onGetStarted={handleGetStarted}
          onGoToDashboard={handleGoToDashboard}
        />
      </div>
    </div>
  );
}