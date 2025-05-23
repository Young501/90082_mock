'use client';

import { useEffect, useState } from 'react';

export default function OnboardingPage() {
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    const data = sessionStorage.getItem('onboarding');
    if (data) {
      setSteps(JSON.parse(data));
    }
  }, []);

  return (
    <div>
      <h1>This is a placeholder onboarding page, you found me congrats!</h1>
      <pre>{JSON.stringify(steps, null, 2)}</pre>
    </div>
  );
}