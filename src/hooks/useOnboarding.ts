import { useState, useEffect } from 'react';

export function useOnboarding() {
  const [status, setStatus] = useState({
    isNewUser: false,
    isSecondVisit: false,
    isFullyOnboarded: false,
  });

  useEffect(() => {
    const onboarded = localStorage.getItem("onboarded");
    const secondVisit = localStorage.getItem("secondVisit");
    const onboardedComplete = localStorage.getItem("onboardedComplete");

    const isNewUser = !onboarded;
    const isSecondVisit = !!secondVisit && !onboardedComplete && !isNewUser;
    const isFullyOnboarded = !!onboardedComplete;

    setStatus({
      isNewUser,
      isSecondVisit,
      isFullyOnboarded,
    });
    
    // If it's the first time we see 'onboarded', but no secondVisit, it might be the transition
    // But we'll handle setting secondVisit in completeOnboarding
  }, []);

  const completeFirstTutorial = () => {
    localStorage.setItem("onboarded", "true");
    localStorage.setItem("secondVisit", "true");
    setStatus(prev => ({ ...prev, isNewUser: false, isSecondVisit: true }));
  };

  const completeSecondTutorial = () => {
    localStorage.setItem("onboardedComplete", "true");
    setStatus(prev => ({ ...prev, isSecondVisit: false, isFullyOnboarded: true }));
  };

  return {
    ...status,
    completeFirstTutorial,
    completeSecondTutorial,
  };
}
