import { 
  Shield, 
  Users, 
  TrendingUp,
  Image,
  Sparkles,
  Zap
} from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import type { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  description: string;
  gradient: string;
  shadow: string;
}

export function FeaturesSection() {
  const { ref: featuresRef, inView: featuresInView } = useInView({ threshold: 0.1, triggerOnce: true });

  const features: Feature[] = [
    {
      icon: Shield,
      title: "SAFE",
      subtitle: "Trusted Middleman",
      description: "Our verified middleman service ensures every trade is secure. Trade with confidence knowing your items are protected.",
      gradient: "from-cyan-400 to-blue-500",
      shadow: "shadow-[0_0_30px_rgba(34,211,238,0.2)]"
    },
    {
      icon: Image,
      title: "SHOWCASE",
      subtitle: "Display Your Collection",
      description: "Create stunning showcases of your Roblox items. Share your inventory and attract potential traders effortlessly.",
      gradient: "from-violet-400 to-purple-500",
      shadow: "shadow-[0_0_30px_rgba(167,139,250,0.2)]"
    },
    {
      icon: Users,
      title: "COMMUNITY",
      subtitle: "Connect & Trade",
      description: "Join thousands of active traders in our vibrant community. Network, negotiate, and build lasting relationships.",
      gradient: "from-fuchsia-400 to-pink-500",
      shadow: "shadow-[0_0_30px_rgba(232,121,249,0.2)]"
    },
    {
      icon: TrendingUp,
      title: "MARKET",
      subtitle: "Real-Time Pricing",
      description: "Stay ahead with live market trends and accurate item valuations. Make informed trading decisions.",
      gradient: "from-emerald-400 to-teal-500",
      shadow: "shadow-[0_0_30px_rgba(52,211,153,0.2)]"
    }
  ];

  return (
    <section id="features" ref={featuresRef} className="relative py-32 overflow-hidden bg-transparent">
      <div className="relative z-10 container mx-auto px-6">
        
        {/* Section Title */}
        <div className={`text-center mb-24 transition-all duration-1000 ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 mb-6 transition-colors">
            WHY BLOXMARKET
          </h2>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400 animate-pulse transition-colors" />
            <p className="text-xl md:text-2xl text-cyan-700 dark:text-cyan-300 font-semibold tracking-wide transition-colors">
              THE MOST TRUSTED TRADING PLATFORM
            </p>
            <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400 animate-pulse transition-colors" />
          </div>
          
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto transition-colors">
            Experience the future of Roblox trading with cutting-edge security, 
            stunning showcases, and an unmatched community experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`relative group transition-all duration-1000 ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-all duration-500`} />
                
                {/* Feature Card */}
                <div className={`relative h-full bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 ${feature.shadow}`}>
                  
                  {/* Icon Container */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-[2px] mb-8`}>
                    <div className="w-full h-full bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center transition-colors">
                      <Icon className={`w-8 h-8 text-slate-900 dark:text-white group-hover:text-white transition-colors`} />
                    </div>
                  </div>

                  <h3 className={`text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${feature.gradient} mb-2`}>
                    {feature.title}
                  </h3>
                  
                  <p className="text-slate-900 dark:text-white font-medium uppercase tracking-wider mb-4 transition-colors">
                    {feature.subtitle}
                  </p>
                  
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">
                    {feature.description}
                  </p>
                  
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Call-to-Action */}
        <div className={`text-center mt-24 transition-all duration-1000 ${featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '600ms' }}>
          <div className="inline-block bg-white/60 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md rounded-2xl p-8 max-w-2xl transition-colors duration-500">
            <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-200 mb-2 transition-colors">Ready to experience the difference?</h4>
            <p className="text-slate-600 dark:text-slate-400 transition-colors">Join thousands of satisfied traders who trust BloxMarket for their Roblox trading needs.</p>
          </div>
        </div>

      </div>
    </section>
  );
}