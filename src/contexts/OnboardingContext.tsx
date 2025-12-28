import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { OnboardingTutorial } from '@/components/onboarding/OnboardingTutorial';
import { HowToUseButton } from '@/components/onboarding/HowToUseButton';
import { useAuth } from '@/contexts/AuthContext';

interface OnboardingContextType {
  showTutorial: () => void;
  isNewUser: boolean;
  isSecondVisit: boolean;
  isFullyOnboarded: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState({
    isNewUser: false,
    isSecondVisit: false,
    isFullyOnboarded: false,
  });

  const isDashboard = location.pathname === '/';
  const showFloatingButton = (status.isSecondVisit || isDashboard) && !status.isNewUser && !open;

  useEffect(() => {
    if (loading || !user) return;

    const onboarded = localStorage.getItem("onboarded");
    const onboardedComplete = localStorage.getItem("onboardedComplete");
    const onboardingTimestamp = localStorage.getItem("onboardingTimestamp");

    let isWithinMonth = false;
    if (onboardingTimestamp) {
      const startTime = parseInt(onboardingTimestamp, 10);
      const oneMonth = 30 * 24 * 60 * 60 * 1000;
      isWithinMonth = (Date.now() - startTime) < oneMonth;
    }

    const isNewUser = !onboarded;
    // Show floating button if they've onboarded and it's within a month
    const isFloatingVisible = !!onboarded && isWithinMonth;
    const isFullyOnboarded = !!onboardedComplete;

    setStatus({
      isNewUser,
      isSecondVisit: isFloatingVisible,
      isFullyOnboarded,
    });

    if (isNewUser) {
      setOpen(true);
    }
  }, [user, loading]);

  const showTutorial = () => {
    setOpen(true);
  };

  const handleComplete = () => {
    setOpen(false);
    if (status.isNewUser) {
      localStorage.setItem("onboarded", "true");
      localStorage.setItem("secondVisit", "true");
      localStorage.setItem("onboardingTimestamp", Date.now().toString());
      setStatus(prev => ({ ...prev, isNewUser: false, isSecondVisit: true }));
    } else {
      // Even if they complete it again, we don't necessarily hide the button 
      // if it's still within the month, as per the new requirement.
      // But we can mark it as complete for other logic if needed.
      localStorage.setItem("onboardedComplete", "true");
      setStatus(prev => ({ ...prev, isFullyOnboarded: true }));
    }
  };

  return (
    <OnboardingContext.Provider value={{ showTutorial, ...status }}>
      {children}
      <OnboardingTutorial 
        open={open} 
        onOpenChange={setOpen} 
        onComplete={handleComplete} 
        forceShow={status.isNewUser}
      />
      {showFloatingButton && (
        <HowToUseButton onClick={showTutorial} />
      )}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
