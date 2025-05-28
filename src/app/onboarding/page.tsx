'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const userType = searchParams.get('userType');
  const [steps, setSteps] = useState<string[]>([]);

  useEffect(() => {
    async function fetchSteps() {
      if (!userType) return;
      try {
        const res = await fetch(`/api/v1/user-types/${userType}/onboarding-pages/`);
        if (!res.ok) throw new Error('Failed to fetch onboarding steps');
        const data = await res.json();
        setSteps(data);
      } catch (err) {
        console.error(err);
      }
    }

    fetchSteps();
  }, [userType]);

  return (
    <div>
      <h1>Onboarding Steps</h1>
      <pre>{JSON.stringify(steps, null, 2)}</pre>
    </div>
  );
}