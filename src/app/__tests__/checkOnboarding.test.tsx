import { render } from '@testing-library/react';
import { useCheckOnboarding } from '../checkOnboarding';
import * as helpers from '../apihelpers';
//import { useRouter } from 'next/router';
import { jest } from '@jest/globals';

type GetUserProfileReturn = Awaited<ReturnType<typeof helpers.getUserProfile>>;
type GetOnboardingPagesReturn = Awaited<ReturnType<typeof helpers.getOnboardingPages>>;

// Mock next/router and return our push mock
const push = jest.fn();


jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
import { useRouter } from 'next/navigation';
const mockUseRouter = useRouter as jest.Mock;
// Mock internal helper methods
jest.mock('../apihelpers');

describe('useCheckOnboarding', () => {
  const token = 'mock-token';
  const userType = 'mock-user-type';

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push });
    sessionStorage.clear();
    jest.clearAllMocks();
  });
  function TestComponent() {
    useCheckOnboarding(token, userType);
    return <div>Test</div>;
  }

  it('redirects to /home if profile exists', async () => {
    (helpers.getUserProfile as jest.MockedFunction<typeof helpers.getUserProfile>)
      .mockResolvedValue({ status: 'exists' });

    render(<TestComponent />);
    await new Promise((r) => setTimeout(r, 0));
    expect(push).toHaveBeenCalledWith('/home');
  });

  it('redirects to /onboarding and stores steps if profile not found', async () => {
    (helpers.getUserProfile as jest.MockedFunction<typeof helpers.getUserProfile>)
      .mockResolvedValue({ status: 'onboarding-required' });

    (helpers.getOnboardingPages as jest.MockedFunction<typeof helpers.getOnboardingPages>)
      .mockResolvedValue(['step1', 'step2']);

    render(<TestComponent />);
    await new Promise((r) => setTimeout(r, 0));
    expect(push).toHaveBeenCalledWith('/onboarding');
    expect(sessionStorage.getItem('onboarding')).toEqual(JSON.stringify(['step1', 'step2']));
  });
});

