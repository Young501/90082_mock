'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/utils/api';

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const userType = searchParams.get('userType');
  const [steps, setSteps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSteps() {
      if (!userType) return;

      try {
        const res = await fetch(API_ENDPOINTS.ONBOARDING_PAGES(userType));
        if (!res.ok) {
          const statusText = res.statusText || 'Unknown error';
          throw new Error(`Failed to fetch onboarding steps: ${res.status} ${statusText}`);
        }

        const data = await res.json();
        setSteps(data);
        setError(null);
      } catch (err: unknown) {
        console.error(err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unexpected error occurred');
        }
      }
    }

    fetchSteps();
  }, [userType]);

  return (
    <div>
      <h1>Onboarding Steps</h1>
      {error ? (
        <p style={{ color: 'red' }}>Error: {error}</p>
      ) : (
        <pre>{JSON.stringify(steps, null, 2)}</pre>
      )}
    </div>
  );
}