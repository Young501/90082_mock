'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Heading,
  VStack,
  Input,
  Button,
} from '@chakra-ui/react';

import {
  FormControl,
  FormLabel,
  FormErrorMessage
} from '@chakra-ui/form-control';
import { Text } from '@chakra-ui/react';
import { API_ENDPOINTS } from '@/utils/api';


import { useAuth } from '../context/AuthContext';  // import useAuth() hook

//Regular expressions for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPECIAL_CHAR_REGEX = /[^A-Za-z0-9]/;

export default function LoginPage() {
  const { login } = useAuth();

  //State for input values and messages
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [pwdErr, setPwdErr] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  //Validation checks
  const isEmailValid = EMAIL_REGEX.test(email);
  const isPasswordValid = password.length >= 8 && SPECIAL_CHAR_REGEX.test(password);
  const isFormValid = isEmailValid && isPasswordValid;
  const params = useSearchParams();
  const userType = params.get('userType');
  // Validate email in real-time
  useEffect(() => {
    if (!email) {
      setEmailErr('');
    } else if (!isEmailValid) {
      setEmailErr('Invalid email format');
    } else {
      setEmailErr('');
    }
  }, [email]);
  //Validate password in real-time
  useEffect(() => {
    if (!password) {
      setPwdErr('');
    } else if (password.length < 8) {
      setPwdErr('Password must be at least 8 characters');
    } else if (!SPECIAL_CHAR_REGEX.test(password)) {
      setPwdErr('Password must include at least one special character');
    } else {
      setPwdErr('');
    }
  }, [password]);

  //Handle login API request
  const handleLogin = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password
        }),
      });
        if (!res.ok) throw new Error('Login failed');

        const data = await res.json();
        login(data.token, data.user);  // update context
        setSuccessMsg('Login successful!');
        setErrorMsg('');
      } catch (err) {
        setErrorMsg('Invalid credentials');
        setSuccessMsg('');
      }
    };


  //Handle signup API request
  const handleSignup = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.SIGNUP, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          user_types: [userType]
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Signup failed');

      setSuccessMsg(data.message || 'Signup successful!');
      setErrorMsg('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Signup failed');
      setSuccessMsg('');
    }
  };

  return (
    <Box maxW="420px" mx="auto" mt={12} p={8} borderWidth={1} rounded="lg">
      <Heading size="lg" mb={6}>Login / Sign Up</Heading>

      <VStack align="stretch">
        <FormControl isInvalid={!!emailErr}>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <FormErrorMessage>{emailErr}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!pwdErr}>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />
          <FormErrorMessage>{pwdErr}</FormErrorMessage>
        </FormControl>

        <VStack>
          <Button
            colorScheme="blue"
            disabled={!isFormValid}
            onClick={handleLogin}
            width="100%"
          >
            Login
          </Button>

          <Button
            colorScheme="green"
            disabled={!isFormValid}
            onClick={handleSignup}
            width="100%"
          >
            Sign Up
          </Button>
        </VStack>

        {successMsg && <Text color="green.500">{successMsg}</Text>}
        {errorMsg && <Text color="red.500">{errorMsg}</Text>}
      </VStack>
    </Box>
  );
}