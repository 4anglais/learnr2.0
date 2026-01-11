import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Target, 
  Zap, 
  Shield, 
  Github,
  Twitter,
  Linkedin,
  ArrowRight,
  Layout,
  BookOpen,
  Trophy,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Landing = () => {
  const year = new Date().getFullYear();
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: "Create your profile",
      description: "Tell us about your studies and goals. We'll customize the experience for you.",
      icon: <Layout className="w-12 h-12 text-blue-400" />,
      color: "bg-blue-500/10"
    },
    {
      title: "Plan your path",
      description: "Use our AI tools to break down your semester into actionable study sessions.",
      icon: <Target className="w-12 h-12 text-purple-400" />,
      color: "bg-purple-500/10"
    },
    {
      title: "Execute and track",
      description: "Stay focused with our productivity tools and watch your progress soar.",
      icon: <Trophy className="w-12 h-12 text-emerald-400" />,
      color: "bg-emerald-500/10"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 glass border-b border-border/40">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
              l
            </div>
            <span className="text-xl font-bold tracking-tight">learnr</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it works</a>
            <a href="#about" className="hover:text-primary transition-colors"></a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="gradient-primary">Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section - Unique Animation: Floating Blobs & Staggered Reveal */}
        <section className="py-20 md:py-32 overflow-hidden relative">
          {/* Animated Blobs */}
          <div className="absolute top-20 left-[10%] w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-20 right-[10%] w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 blur-[120px] rounded-full -z-10 animate-pulse-subtle" />
          
          <div className="container relative z-10">
            <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-xs font-medium text-primary animate-reveal">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Coming Soon: Create Roadmaps With AI
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight font-['Fredoka'] animate-reveal delay-100">
                Master your studies with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500 animate-pulse">intelligence</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl animate-reveal delay-200">
                The all-in-one productivity companion for students. Manage tasks, track progress, and stay focused with Learnr.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-reveal delay-300">
                <Link to="/auth" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto gradient-primary text-lg h-12 px-8 shadow-glow hover:scale-105 transition-transform">
                    Get Started 
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <a href="#features" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg h-12 px-8 hover:bg-secondary transition-colors">
                    View Features
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Unique Animation: Staggered Pop-in Grid & Gradient Cards */}
        <section id="features" className="py-24 bg-secondary/30 relative">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4 animate-reveal">
              <h2 className="text-3xl md:text-4xl font-bold">Everything you need to excel</h2>
              <p className="text-muted-foreground italic">Designed specifically for the modern student's workflow.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 - Indigo/Blue */}
              <div className="p-8 rounded-2xl bg-gradient-to-b from-card to-blue-500/5 border border-border/50 shadow-sm hover:shadow-card-hover hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-2 group animate-reveal delay-100">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6 group-hover:rotate-12 group-hover:scale-110 transition-transform">
                  <Layout className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Smart Dashboard</h3>
                <p className="text-muted-foreground">Get a bird's-eye view of your entire academic life. Deadlines, tasks, and progress at a glance.</p>
              </div>

              {/* Feature 2 - Purple */}
              <div className="p-8 rounded-2xl bg-gradient-to-b from-card to-purple-500/5 border border-border/50 shadow-sm hover:shadow-card-hover hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-2 group animate-reveal delay-200">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Focus Mode</h3>
                <p className="text-muted-foreground">Built-in Pomodoro timer and distraction blockers to help you enter the flow state and stay there.</p>
              </div>

              {/* Feature 3 - Emerald/Green */}
              <div className="p-8 rounded-2xl bg-gradient-to-b from-card to-emerald-500/5 border border-border/50 shadow-sm hover:shadow-card-hover hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-2 group animate-reveal delay-300">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6 group-hover:-rotate-12 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Study Roadmaps</h3>
                <p className="text-muted-foreground">Break down complex subjects into manageable milestones. AI-powered planning for your success.</p>
              </div>

              {/* Feature 4 - Amber/Orange */}
              <div className="p-8 rounded-2xl bg-gradient-to-b from-card to-amber-500/5 border border-border/50 shadow-sm hover:shadow-card-hover hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-2 group animate-reveal delay-100">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:animate-pulse transition-transform">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Integrated Calendar</h3>
                <p className="text-muted-foreground">Sync your deadlines and study sessions. Never miss an important exam or submission again.</p>
              </div>

              {/* Feature 5 - Rose/Red */}
              <div className="p-8 rounded-2xl bg-gradient-to-b from-card to-rose-500/5 border border-border/50 shadow-sm hover:shadow-card-hover hover:border-rose-500/30 transition-all duration-300 hover:-translate-y-2 group animate-reveal delay-200">
                <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Progress Tracking</h3>
                <p className="text-muted-foreground">Visualize your growth. See how much you've learned and stay motivated with detailed analytics.</p>
              </div>

              {/* Feature 6 - Cyan/Teal */}
              <div className="p-8 rounded-2xl bg-gradient-to-b from-card to-cyan-500/5 border border-border/50 shadow-sm hover:shadow-card-hover hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-2 group animate-reveal delay-300">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center mb-6 group-hover:rotate-6 group-hover:scale-110 transition-transform">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Goal Setting</h3>
                <p className="text-muted-foreground">Set academic goals and track your path to achieving them. Stay focused on what truly matters.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section - Unique Animation: Dark Glow & Magnetic Steps */}
        <section id="how-it-works" className="py-24 bg-slate-950 text-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)] animate-pulse-subtle" />
          
          <div className="container relative z-10">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="lg:w-1/2 space-y-8 animate-reveal">
                <h2 className="text-3xl md:text-5xl font-bold">Stop procrastinating, start achieving.</h2>
                <div className="space-y-6">
                  {steps.map((step, index) => (
                    <div 
                      key={index} 
                      className={`flex gap-4 p-4 rounded-xl transition-all duration-500 cursor-pointer ${activeStep === index ? 'bg-white/10 translate-x-4 border-l-4 border-blue-500' : 'opacity-40 hover:opacity-60'}`}
                      onClick={() => setActiveStep(index)}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold transition-transform ${activeStep === index ? 'bg-blue-500 scale-110' : 'bg-white/20'}`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-1">{step.title}</h4>
                        <p className="text-slate-400">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/auth">
                  <Button size="lg" className="gradient-primary text-white hover:shadow-glow transition-all mt-4">
                    Join Learnr Today
                  </Button>
                </Link>
              </div>
              <div className="lg:w-1/2 relative h-[450px] w-full flex items-center justify-center animate-reveal delay-300">
                <div className="absolute inset-0 bg-blue-500/20 blur-[120px] rounded-full animate-pulse" />
                <div className="relative w-full max-w-md h-72">
                  {steps.map((step, index) => (
                    <div 
                      key={index}
                      className={`absolute inset-0 flex flex-col items-center justify-center p-8 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl transition-all duration-700 ease-out ${
                        activeStep === index 
                          ? 'opacity-100 scale-100 translate-y-0 rotate-0' 
                          : 'opacity-0 scale-75 translate-y-12 rotate-3 pointer-events-none'
                      }`}
                    >
                      <div className={`p-4 rounded-2xl ${step.color} mb-6 animate-float`}>
                        {step.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-center mb-2">{step.title}</h3>
                      <p className="text-slate-400 text-center">{step.description}</p>
                    </div>
                  ))}
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
                  {steps.map((_, index) => (
                    <button 
                      key={index}
                      className={`h-1.5 rounded-full transition-all duration-500 ${activeStep === index ? 'w-12 bg-blue-500' : 'w-4 bg-white/20'}`}
                      onClick={() => setActiveStep(index)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Unique Animation: Orbiting & Rotating Particles */}
        <section className="py-24 bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white relative overflow-hidden border-y border-white/5">
          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <div className="absolute top-10 left-10 w-24 h-24 border-4 border-white/10 rounded-xl animate-float-slow" style={{ transform: 'rotate(45deg)' }} />
          <div className="absolute bottom-10 right-10 w-32 h-32 border-4 border-white/5 rounded-2xl animate-float" style={{ transform: 'rotate(-20deg)' }} />
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-500/5 rounded-lg animate-blob" />
          <div className="absolute top-1/4 right-1/4 w-20 h-20 border-2 border-white/5 rounded-full animate-tilt" />
          
          <div className="container text-center max-w-3xl mx-auto space-y-8 relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold leading-tight animate-reveal">Ready to transform your study habits?</h2>
            <p className="text-xl text-slate-400 animate-reveal delay-100">Join thousands of students who are already using Learnr to stay ahead of their academic goals.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-reveal delay-200">
              {/* Rotating squares decoration */}
              <div className="hidden lg:flex gap-4 mr-8">
                <div className="w-12 h-12 rounded-xl bg-white/10 animate-[spin_3s_linear_infinite] [animation-iteration-count:0.75]" />
                <div className="w-8 h-8 rounded-lg bg-white/5 animate-[spin_5s_linear_infinite_reverse] mt-4" />
              </div>
              
              <Link to="/auth">
                <Button size="lg" className="bg-white text-slate-950 hover:bg-slate-200 w-full sm:w-auto px-10 h-14 text-lg font-bold shadow-glow hover:scale-105 active:scale-95 transition-all">
                  Get Started for Free
                </Button>
              </Link>

              <div className="hidden lg:flex gap-4 ml-8">
                <div className="w-12 h-12 rounded-xl bg-white/10 animate-[spin_4s_linear_infinite] [animation-delay:1s]" />
                <div className="w-6 h-6 rounded-md bg-white/5 animate-float ml-2" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Unique Animation: Subtle Slide-up Reveal */}
      <footer className="bg-background border-t border-border py-12 relative overflow-hidden animate-reveal delay-500">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                  l
                </div>
                <span className="text-xl font-bold tracking-tight">learnr</span>
              </div>
              <p className="text-muted-foreground max-sm">
                The intelligent productivity companion designed for the modern student. Organize, track, and excel in your academic journey.
              </p>
              <div className="flex gap-4">
                <a href="https://x.com/4anglais" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="rounded-full hover:text-primary transition-colors">
                    <Twitter className="w-5 h-5" />
                  </Button>
                </a>
                <a href="https://github.com/4anglais" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="rounded-full hover:text-primary transition-colors">
                    <Github className="w-5 h-5" />
                  </Button>
                </a>
                <a href="https://www.linkedin.com/in/4anglais" target="_blank" rel="noopener noreferrer">
                  <Button variant="ghost" size="icon" className="rounded-full hover:text-primary transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </Button>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-primary transition-colors">How it works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {year} learnr. All rights reserved.</p>
            <p className="font-bold tracking-widest text-foreground">DEVELOPED BY ANGEL PHIRI</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
