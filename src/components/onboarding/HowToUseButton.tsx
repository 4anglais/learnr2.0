import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { HelpCircle, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface HowToUseButtonProps {
  onClick: () => void;
}

export function HowToUseButton({ onClick }: HowToUseButtonProps) {
  const [position, setPosition] = useState({ x: 24, y: window.innerHeight - 80 });
  const [isDragging, setIsDragging] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Keep button in bounds on resize
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 64),
        y: Math.min(prev.y, window.innerHeight - 64)
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(false);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    dragStartPos.current = {
      x: clientX - position.x,
      y: clientY - position.y
    };

    const handleMouseMove = (moveEvent: MouseEvent | TouchEvent) => {
      setIsDragging(true);
      const moveX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const moveY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const newX = Math.max(0, Math.min(moveX - dragStartPos.current.x, window.innerWidth - 64));
      const newY = Math.max(0, Math.min(moveY - dragStartPos.current.y, window.innerHeight - 64));
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);
  };

  return (
    <div
      ref={buttonRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999,
        touchAction: 'none'
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onMouseDown}
      className="group"
    >
      <div className="relative">
        {/* Drag handle hint */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 rounded px-1 cursor-move">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <Button
          onClick={(e) => {
            if (!isDragging) {
              onClick();
            }
          }}
          className={cn(
            "rounded-full w-12 h-12 md:w-14 md:h-14 shadow-lg gradient-primary p-0 cursor-move transition-transform active:scale-95",
            isDragging && "opacity-80"
          )}
          title="Drag me anywhere! Click for help."
        >
          <HelpCircle className="h-5 w-5 md:h-6 md:w-6" />
        </Button>
      </div>
    </div>
  );
}
