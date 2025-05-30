'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Spinner,
  Field
} from '@chakra-ui/react';

import { API_ENDPOINTS } from '@/utils/api';


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
  const params = useSearchParams();
  const userType = params.get('userType');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const isFormValid = !emailErr && !pwdErr && email && password;

  useEffect(() => setEmailErr(validateEmail(email)), [email]);
  useEffect(() => setPwdErr(validatePassword(password)), [password]);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setEmailErr('');
    setPwdErr('');
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Login failed');

      setSuccessMsg('Login successful!');
      setErrorMsg('');
      resetForm();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Login failed');
      setSuccessMsg('');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
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

      if (!res.ok) throw new Error(data.message || 'Signup failed');

      setSuccessMsg(data.message || 'Signup successful!');
      setErrorMsg('');
      resetForm();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Signup failed');
      setSuccessMsg('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="420px" mx="auto" mt={12} p={8} borderWidth={1} rounded="lg">
      <Heading size="lg" mb={6}>Login / Sign Up</Heading>

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
            colorScheme="blue"
            disabled={!isFormValid || loading}
            onClick={handleLogin}
            flex={1}
          >
            {loading ? <Spinner size="sm" /> : 'Login'}
          </Button>

          <Button
            colorScheme="green"
            disabled={!isFormValid || loading}
            onClick={handleSignup}
            flex={1}
          >
            {loading ? <Spinner size="sm" /> : 'Sign Up'}
          </Button>
        </HStack>

        {successMsg && <Text color="green.500">{successMsg}</Text>}
        {errorMsg && <Text color="red.500">{errorMsg}</Text>}
      </VStack>
    </Box>
  );
}