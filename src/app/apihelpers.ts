export async function getUserProfile(userType: string, token: string) {
  const res = await fetch(`/api/v1/${userType}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 200) return { status: 'exists' };
  if (res.status === 404) return { status: 'onboarding-required' };

  throw new Error(`Unexpected response: ${res.status}`);
}

export async function getOnboardingPages(userType: string, token: string) {
  const res = await fetch(`/api/v1/user-types/${userType}/onboarding-pages/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to load onboarding pages');
  return await res.json();
}

