'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Spinner,
  Field,
} from '@chakra-ui/react';

import { API_ENDPOINTS } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { checkIfNeedsOnboarding } from '@/components/onboarding/util/onboardingUtil';
import { useRouter } from 'next/navigation';

const validateEmail = (email: string): string => {
  if (!email) return '';
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_REGEX.test(email)) return 'Invalid email format';
  return '';
};

const validatePassword = (password: string): string => {
  if (!password) return '';
  if (password.length < 8) return 'Password must be at least 8 characters';
  // const SPECIAL_CHAR_REGEX = /[^A-Za-z0-9]/;
  // if (!SPECIAL_CHAR_REGEX.test(password)) return 'Include at least one special character';
  return '';
};

export default function LoginPage() {
  const router = useRouter();

  const { login, user } = useAuth();
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

  const handleLogin = async () => {
    setIsLoginLoading(true);

    try {
      const res = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        console.log('Login failed:', data);
        setErrorMsg(data.message || data.detail || (data.non_field_errors?.join?.(', ') ?? 'Login failed'));
        setSuccessMsg('');
      }else{
        setSuccessMsg('Login successful!');
        login(data.token, data.user);  // update context
        await checkIfNeedsOnboarding(data.user, data.token, router); // check if this user need an onboarding process
        setErrorMsg('');
      }

    } catch (err) {
      console.error(err);
      setErrorMsg('Something went wrong. Please try again.');
    } finally {
      setIsLoginLoading(false);
  }
}


  const handleSignup = async () => {
    setIsSignupLoading(true);
    const res = await fetch(API_ENDPOINTS.SIGNUP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        user_types: [userType],
      }),
    });
    const data = await res.json();
    setIsSignupLoading(false);
    if (!res.ok) {
      console.log('Signup failed:', data);
      setErrorMsg(data.message || (data.email?.join?.(', ') ?? 'Signup failed'));
      setSuccessMsg('');
    }else{
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
      <VStack align="stretch" gap={4}>
        <Field.Root id="email" invalid={!!emailErr}>
          <Field.Label>Email</Field.Label>
          <Input
            type="email"
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />
          <Field.ErrorText>{pwdErr}</Field.ErrorText>
        </Field.Root>

        <HStack gap={4} justify="center">
          <Button
            disabled={!isFormValid || isLoginLoading}
            onClick={handleLogin}
            flex={1}
          >
            {isLoginLoading ? <Spinner size="sm" /> : 'Login'}
          </Button>

          <Button
            disabled={!isFormValid || isSignupLoading}
            onClick={handleSignup}
            flex={1}
          >
            {isSignupLoading ? <Spinner size="sm" /> : 'Sign Up'}
          </Button>
        </HStack>

        {successMsg && <Text color="green.500">{successMsg}</Text>}
        {errorMsg && <Text color="red.500">{errorMsg}</Text>}
      </VStack>
    </Box>
  );
}