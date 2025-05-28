'use client';

import { useState } from 'react';
import { Button, HStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

const Demo = () => {
  const [clicked, setClicked] = useState(false);

  return (
    <HStack>
      <Button onClick={() => setClicked(!clicked)}>
        {clicked ? 'You clicked me!' : 'Click me'}
      </Button>
      <Button colorScheme="blue" onClick={() => alert('Hello from Chakra!')}>
        Alert!
      </Button>
    </HStack>
  );
};

export default function WelcomePage() {
  const router = useRouter();

  function handleSelect(userType: string) {
    router.push(`/onboarding?userType=${userType}`);
  }

  return (
    <div>
      <h1>Select user type</h1>
      <button onClick={() => handleSelect('student')}>Student</button>
      <button onClick={() => handleSelect('partner')}>Partner</button>
    </div>
  );
}