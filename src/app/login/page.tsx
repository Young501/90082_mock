'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  Button,
  Text,
  Spinner,
  Input,
  Field
} from '@chakra-ui/react';

import { useAuth } from '@/contexts/AuthContext';
import { checkOnboardingStatus } from '@/app/onboarding/utils';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS, apiRequest } from '@/utils/api';

const validateEmail = (email: string): string => {
  if (!email) return '';
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return EMAIL_REGEX.test(email) ? '' : 'Invalid email format';
};

const validatePassword = (password: string): string => {
  if (!password) return '';
  return password.length < 8 ? 'Password must be at least 8 characters' : '';
};

export default function LoginPage() {
  const router = useRouter();
  const { user, token, login } = useAuth();
  const userType = user?.user_types?.[0];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  const isFormValid = !emailErr && !pwdErr && email && password;

  useEffect(() => setEmailErr(validateEmail(email)), [email]);
  useEffect(() => setPwdErr(validatePassword(password)), [password]);

  const handleOnboardingCheck = async () => {
    const result = await checkOnboardingStatus(user!, token!);
    if (result.status === 'needs_onboarding') {
      router.push('/onboarding');
    } else {
      router.push('/dashboard');
    }
  };

  const handleLogin = async () => {
    setIsLoginLoading(true);
    try {
      const res = await apiRequest({
        endpoint: API_ENDPOINTS.LOGIN,
        body: { email, password },
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(
          data.message || data.detail || (data.non_field_errors?.join?.(', ') ?? 'Login failed')
        );
        setSuccessMsg('');
      } else {
        setSuccessMsg('Login successful!');
        login(data.token, data.user);
        handleOnboardingCheck();
        setErrorMsg('');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleSignup = async () => {
    setIsSignupLoading(true);
    const res = await apiRequest({
      endpoint: API_ENDPOINTS.SIGNUP,
      body: { email, password, user_types: [userType] },
    });
    const data = await res.json();
    setIsSignupLoading(false);
    if (!res.ok) {
      setErrorMsg(data.message || (data.email?.join?.(', ') ?? 'Signup failed'));
      setSuccessMsg('');
    } else {
      setSuccessMsg(data.message || 'Signup successful!');
      setErrorMsg('');
    }
  };

  return (
    <Box maxW="420px" mx="auto" mt={12} p={8} borderWidth={1} rounded="lg">
      <Heading size="lg" mb={6}>Login / Sign Up</Heading>
      {userType && (
        <Text fontSize="md" mb={2} color="gray.600">
          You’re signing up as a <strong>{userType}</strong>
        </Text>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        autoComplete="on"
      >
        <VStack align="stretch" gap={4}>
          <Field.Root id="email" invalid={!!emailErr}>
            <Field.Label>Email</Field.Label>
            <Input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Field.ErrorText>{emailErr}</Field.ErrorText>
          </Field.Root>

          <Field.Root id="password" invalid={!!pwdErr}>
            <Field.Label>Password</Field.Label>
            <Input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
            <Field.ErrorText>{pwdErr}</Field.ErrorText>
          </Field.Root>

          <Button
            type="submit"
            disabled={!isFormValid || isLoginLoading}
            width="100%"
          >
            {isLoginLoading ? <Spinner size="sm" /> : 'Login'}
          </Button>

          <Button
            onClick={handleSignup}
            disabled={!isFormValid || isSignupLoading}
            width="100%"
          >
            {isSignupLoading ? <Spinner size="sm" /> : 'Sign Up'}
          </Button>

          {successMsg && <Text color="green.500">{successMsg}</Text>}
          {errorMsg && <Text color="red.500">{errorMsg}</Text>}
        </VStack>
      </form>
    </Box>
  );
}