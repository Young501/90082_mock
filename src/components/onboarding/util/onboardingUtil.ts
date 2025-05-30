// src/utils/onboarding.ts

import { User } from '@/types/user';
import { API_ENDPOINTS } from '@/utils/api';
import { useRouter } from 'next/navigation';

export const checkIfNeedsOnboarding = async (
  user: User,
  token: string,
  router: ReturnType<typeof useRouter>
) => {
  const userType = user?.user_types?.[0];

  // If user has more than one user type, assume they have at least 1 completed profile.
  if (user.user_types.length > 1) {
    alert('user have more than 1 user type, assume no need to onboard !');
    //router.push('/dashboard');
    return;
  }

  try {
    const profileRes = await fetch(API_ENDPOINTS.USER_PROFILE(userType), {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    if (profileRes.status === 404) {
      router.push(`/onboarding?userType=${userType}`);
    } else {
      alert('user profile exist, no need to onboard !');
      //router.push('/dashboard');
    }
  } catch (err) {
    console.error('Error checking onboarding profile:', err);
    router.push('/dashboard'); // fallback
  }
};
