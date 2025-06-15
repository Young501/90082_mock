'use client';

import { useState } from 'react';
import { Button, HStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Demo = () => {
  const [clicked, setClicked] = useState(false);
const router = useRouter();
  return (
    <HStack>
      <Button onClick={() => setClicked(!clicked)}>
        {clicked ? 'You clicked me!' : 'Click me'}
      </Button>
      <Button colorScheme="blue" onClick={() => alert('Hello from Chakra!')}>
        Alert!
      </Button>
      <Button colorScheme="blue" onClick={() => router.push("/home")}>
        Home
      </Button>
      <Button colorScheme="blue" onClick={() => router.push("/signup")}>Sign Up</Button>
    </HStack>
  );
};

export default function HomePage() {
  return (
    <div>
      <Demo />
      <ToastContainer />
    </div>
  );
}