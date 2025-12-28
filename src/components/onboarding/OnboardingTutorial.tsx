import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Slide {
  title: string;
  howTo: string;
  benefits: string;
  icon: string;
}

const slides: Slide[] = [
  {
    title: "Learning Roadmaps",
    howTo: "Go to the Planner section and click 'Create Roadmap'. Give your learning journey a name and target date.",
    benefits: "Roadmaps help you break down complex subjects into manageable learning paths, providing a clear bird's-eye view of your long-term goals.",
    icon: "fa-map-marked-alt",
  },
  {
    title: "Strategic Milestones",
    howTo: "Within a Roadmap, add 'Milestones' to represent major chapters or phases of your learning.",
    benefits: "Milestones act as check-points that keep you motivated. They turn a daunting journey into a series of achievable wins.",
    icon: "fa-flag-checkered",
  },
  {
    title: "Actionable Steps",
    howTo: "Break down each Milestone into specific 'Steps' or tasks. This is where the actual work happens.",
    benefits: "Granular steps remove ambiguity. When you know exactly what to do next, you're less likely to procrastinate and more likely to maintain momentum.",
    icon: "fa-list-ol",
  },
  {
    title: "Smart Task Management",
    howTo: "Use the 'Tasks' dashboard to see everything due today. Drag and drop to prioritize or mark as complete.",
    benefits: "Centralized task management ensures nothing falls through the cracks, allowing you to focus on execution rather than organization.",
    icon: "fa-tasks",
  },
  {
    title: "Progress Insights",
    howTo: "Visit the 'Progress' tab to see visual charts of your study hours and completion rates.",
    benefits: "Data-driven insights help you identify your most productive times and areas where you might need to adjust your strategy.",
    icon: "fa-chart-line",
  },
];

interface OnboardingTutorialProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  forceShow?: boolean;
}

export function OnboardingTutorial({ open, onOpenChange, onComplete, forceShow = false }: OnboardingTutorialProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const handleNext = () => {
    if (canScrollNext) {
      emblaApi?.scrollNext();
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    emblaApi?.scrollPrev();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!forceShow) onOpenChange(val);
    }}>
      <DialogContent 
        className={cn(
          "max-w-4xl w-[92vw] md:w-full h-auto max-h-[90vh] p-0 flex flex-col bg-background/95 backdrop-blur-md overflow-hidden rounded-[2rem] border-border/50 shadow-2xl",
        )}
        hideCloseButton={forceShow}
      >
        <div className="w-full px-4 md:px-10 py-6 md:py-10 flex flex-col min-h-0">
          <div className="overflow-hidden flex-1" ref={emblaRef}>
            <div className="flex h-full">
              {slides.map((slide, index) => (
                <div key={index} className="flex-[0_0_100%] min-w-0 h-full overflow-y-auto px-1 custom-scrollbar">
                  <div className="flex flex-col items-center text-center space-y-4 md:space-y-6 max-w-3xl mx-auto py-2">
                    <div className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-primary/10 flex items-center justify-center transform rotate-3 hover:rotate-0 transition-transform duration-300 shrink-0">
                      <i className={cn("fas fa-lg md:fa-3x text-primary", slide.icon)}></i>
                    </div>
                    
                    <div className="space-y-3 md:space-y-4 w-full">
                      <h2 className="text-xl md:text-3xl font-black tracking-tight text-foreground leading-tight">{slide.title}</h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 text-left w-full pb-4">
                        <div className="bg-muted p-4 md:p-6 rounded-2xl border border-border/50 flex flex-col">
                          <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary mb-1 md:mb-2">How to Use</h4>
                          <p className="text-xs md:text-base leading-relaxed text-foreground/80">{slide.howTo}</p>
                        </div>
                        
                        <div className="bg-primary/5 p-4 md:p-6 rounded-2xl border border-primary/10 flex flex-col">
                          <h4 className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary mb-1 md:mb-2">The Benefits</h4>
                          <p className="text-xs md:text-base leading-relaxed text-foreground/80">{slide.benefits}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center mt-6 md:mt-8 space-y-6 md:space-y-6 shrink-0">
            <div className="flex gap-2 md:gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={cn(
                    "h-1.5 md:h-2 rounded-full transition-all duration-500",
                    selectedIndex === index ? "w-6 md:w-10 bg-primary" : "w-1.5 md:w-2 bg-primary/20"
                  )}
                />
              ))}
            </div>

            <div className="flex w-full max-w-md gap-3 md:gap-4 px-4">
              {selectedIndex > 0 && (
                <Button 
                  variant="ghost" 
                  className="flex-1 h-10 md:h-12 text-xs md:text-sm font-semibold hover:bg-muted rounded-xl" 
                  onClick={handlePrev}
                >
                  Back
                </Button>
              )}
              <Button 
                className="flex-1 h-10 md:h-12 text-xs md:text-sm font-bold gradient-primary shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform rounded-xl" 
                onClick={handleNext}
              >
                {selectedIndex === slides.length - 1 ? "Start Learning" : "Next Feature"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
